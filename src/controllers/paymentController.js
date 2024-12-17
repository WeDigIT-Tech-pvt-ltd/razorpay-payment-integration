const razorpay = require('../config/razorpay');
const { validationResult } = require('express-validator');
const { CURRENCY } = require('../config/constants');
const { formatAmount, generateReceiptId } = require('../utils/paymentUtils');
const orderRepository = require('../repositories/orderRepository');
const paymentRepository = require('../repositories/paymentRepository');

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = CURRENCY.INR, notes, customerId } = req.body;
    const receipt = generateReceiptId();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: formatAmount(amount),
      currency,
      receipt,
      notes,
      payment_capture: 1
    });

    // Save order in database
    const order = await orderRepository.create({
      id: razorpayOrder.id,
      customerId,
      amount: amount,
      currency,
      receipt,
      status: 'created',
      notes: notes || {},
      metadata: razorpayOrder
    });

    res.status(201).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
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

    const { orderId, paymentId } = req.body;
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.order_id !== orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed' 
      });
    }

    // Update order status
    await orderRepository.updateStatus(orderId, 'paid');

    // Save payment details
    await paymentRepository.create({
      id: paymentId,
      orderId,
      customerId: payment.customer_id,
      amount: payment.amount / 100, // Convert from paise to rupees
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      metadata: payment
    });

    res.json({ 
      success: true, 
      payment 
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};