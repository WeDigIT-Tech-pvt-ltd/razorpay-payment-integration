const razorpay = require('../config/razorpay');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const planRepository = require('../repositories/planRepository');
const { SubscriptionError } = require('../utils/errors');
const paymentRepository = require('../repositories/paymentRepository');
const { PAYMENT_STATUS } = require('../config/constants');
const orderRepository = require('../repositories/orderRepository');

class SubscriptionService {
  async createSubscription(planId, customerId) {
    try {
      const plan = await planRepository.findById(planId);
      if (!plan) {
        throw new SubscriptionError('Plan not found');
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: plan.pgPlanId,
        total_count: 12, // Default to yearly subscription
        customer_notify: 1,
        notes: {
          customerId,
        }
      });

      await subscriptionRepository.create({
        id: subscription.id,
        planId,
        customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        metadata: subscription
      });

      return { razorpayOrder: subscription, plan };
    } catch (error) {
      throw new SubscriptionError('Failed to create subscription: ' + JSON.stringify(error));
    }
  }

  async changePlan(subscriptionId, newPlanId) {
    try {
      const subscription = await razorpay.subscriptions.fetch(subscriptionId);
      if (!subscription) {
        throw new SubscriptionError('Subscription not found');
      }

      const updatedSubscription = await razorpay.subscriptions.update(subscriptionId, {
        plan_id: newPlanId,
        customer_notify: 1,
        schedule_change_at: 'cycle_end' // Change plan at the end of current billing cycle
      });

      return await subscriptionRepository.update(subscriptionId, {
        planId: newPlanId,
        status: updatedSubscription.status,
        metadata: updatedSubscription
      });
    } catch (error) {
      throw new SubscriptionError('Failed to change plan: ' + error.message);
    }
  }

  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtPeriodEnd);
      
      return await subscriptionRepository.update(subscriptionId, {
        status: subscription.status,
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        metadata: subscription
      });
    } catch (error) {
      throw new SubscriptionError('Failed to cancel subscription: ' + error.message);
    }
  }


  async handlePaymentCaptured(payment) {
    try {
      await paymentRepository.updateStatus(payment.id, PAYMENT_STATUS.CAPTURED);
      
      if (payment.order_id) {
        await orderRepository.updateStatus(payment.order_id, 'paid');
      }

      // Create subscription after successful payment if it's a subscription payment
      if (payment.subscription_id) {
        const planId = payment.notes?.plan_id;
        const customerId = payment.customer_id;
        
        let rpSubs = razorpay.subscriptions.fetch(payment.subscription_id);
        await subscriptionRepository.updateStatus(payment.subscription_id, (await rpSubs).status);
      }
    } catch (error) {
      console.error('Payment capture handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionActivated(subscription) {
    try {
      await subscriptionRepository.updateStatus(subscription.id, 'active');
    } catch (error) {
      console.error('Subscription activation handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionPending(subscription) {
    try {
      await subscriptionRepository.updateStatus(subscription.id, 'pending');
    } catch (error) {
      console.error('Subscription pending handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionCharged(subscription) {
    try {
      await subscriptionRepository.updateStatus(subscription.id, 'active');
    } catch (error) {
      console.error('Subscription pending handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionCancelled(subscription) {
    try {
      await subscriptionRepository.updateStatus(subscription.id, 'cancelled');
    } catch (error) {
      console.error('Subscription pending handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionPending(subscription) {
    try {
      await subscriptionRepository.updateStatus(subscription.id, 'pending');
    } catch (error) {
      console.error('Subscription pending handling error:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();