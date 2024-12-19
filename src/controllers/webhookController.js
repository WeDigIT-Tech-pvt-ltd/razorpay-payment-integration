const subscriptionService = require('../services/subscriptionService');
const { validateWebhookSignature } = require('../utils/paymentUtils');

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_KEY;

    if (!validateWebhookSignature(req.body, webhookSignature, webhookSecret)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        await subscriptionService.handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await subscriptionService.handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'subscription.activated':
        await subscriptionService.handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      case 'subscription.charged':
        await subscriptionService.handleSubscriptionCharged(event.payload.subscription.entity);
        break;
      case 'subscription.cancelled':
        await subscriptionService.handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      case 'subscription.pending':
        await subscriptionService.handleSubscriptionPending(event.payload.subscription.entity);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
};

// ... other webhook handlers remain the same