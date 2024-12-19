const razorpay = require('../config/razorpay');
const { validationResult } = require('express-validator');
const { generateReceiptId, isValidEmail, validateWebhookSignature } = require('../utils/paymentUtils');
const orderRepository = require('../repositories/orderRepository');
const paymentRepository = require('../repositories/paymentRepository');
const customerRepository = require('../repositories/customerRepository');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const subscriptionService = require('../services/subscriptionService');

exports.createOrder = async (req, res) => {
  try {
    const receipt = generateReceiptId();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, name = '', email, phone = '9999999999' } = req.body;

    if(!email || !isValidEmail(email)) 
      return res.status(404).json({ 
        success: false, 
        error: 'Customer Email is required'
      });

    let customer = await customerRepository.findByEmail(email);
    if(!customer) customer = await customerRepository.create({ name, phone, email });

    // Create Razorpay order
    const { razorpayOrder, plan } = subscriptionService.createSubscription(planId, customer.id);

    // Save order in database
    await orderRepository.create({
      id: razorpayOrder.id,
      customerId: customer.id,
      amount: amount,
      receipt,
      status: 'created',
      metadata: razorpayOrder
    });

    res.status(201).json({
      success: true,
      receipt,
      pg_options: {
        subscription_id: razorpayOrder.id,
        name: plan.name,
        description: plan.description,
        recurring: true,
        callback_url: `${process.env.CALLBACK_URL}?orderId=${order.id}`,
        prefill: {
            name: name,
            email: email,
            contact: phone ? phone : "9999999999",
        },
        notes: {
            plan_id: plan.id,
            reciept: receipt,
        },
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    res.json({ 
      success: true, 
      payment 
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payment' 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { razorpay_signature, razorpay_payment_id, error } = reqBody;

    const { orderId } = req.query;

    if (validateWebhookSignature(razorpay_payment_id + "|" + orderId, process.env.RAZORPAY_SECRET) || razorpay_signature === 'webhook_verified') {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.order_id !== orderId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Payment verification failed' 
        });
      }

      // Update order status
      await orderRepository.updateStatus(orderId, 'paid');

      //create a new payment entry
      await paymentRepository.create({
        id: razorpay_payment_id,
        orderId,
        customerId: payment.customer_id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        metadata: payment
      });

      //update the subscription station
      if (payment.subscription_id) {
        let rpSubs = razorpay.subscriptions.fetch(payment.subscription_id);
        await subscriptionRepository.updateStatus(payment.subscription_id, (await rpSubs).status);
      }

      res.json({ 
        success: true, 
        payment 
      });     
    } else return res.status(500).json({  success: false, error: 'Payment verification failed' });

    if(error) {
        res.redirect(`&error=${error.description}`);
        return;
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};