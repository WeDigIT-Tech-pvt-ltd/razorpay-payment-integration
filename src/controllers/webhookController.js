const { validateWebhookSignature } = require('../utils/paymentUtils');
const { PAYMENT_STATUS } = require('../config/constants');
const orderRepository = require('../repositories/orderRepository');
const paymentRepository = require('../repositories/paymentRepository');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const subscriptionService = require('../services/subscriptionService');

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!validateWebhookSignature(req.body, webhookSignature, webhookSecret)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      case 'subscription.pending':
        await handleSubscriptionPending(event.payload.subscription.entity);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
};

async function handlePaymentCaptured(payment) {
  try {
    await paymentRepository.updateStatus(payment.id, PAYMENT_STATUS.CAPTURED);
    
    if (payment.order_id) {
      await orderRepository.updateStatus(payment.order_id, 'paid');
    }

    // Create subscription after successful payment if it's a subscription payment
    if (payment.subscription_id) {
      const planId = payment.notes?.plan_id;
      const customerId = payment.customer_id;
      
      if (planId && customerId) {
        await subscriptionService.createSubscriptionAfterPayment(
          payment,
          planId,
          customerId
        );
      }
    }
  } catch (error) {
    console.error('Payment capture handling error:', error);
    throw error;
  }
}

async function handleSubscriptionActivated(subscription) {
  try {
    await subscriptionRepository.updateStatus(subscription.id, 'active');
  } catch (error) {
    console.error('Subscription activation handling error:', error);
    throw error;
  }
}

async function handleSubscriptionPending(subscription) {
  try {
    await subscriptionRepository.updateStatus(subscription.id, 'pending');
  } catch (error) {
    console.error('Subscription pending handling error:', error);
    throw error;
  }
}

// ... other webhook handlers remain the same