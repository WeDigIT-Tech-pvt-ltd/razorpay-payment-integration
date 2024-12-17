const razorpay = require('../config/razorpay');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const planRepository = require('../repositories/planRepository');
const { SubscriptionError } = require('../utils/errors');

class SubscriptionService {
  async createSubscriptionAfterPayment(payment, planId, customerId) {
    try {
      const plan = await planRepository.findById(planId);
      if (!plan) {
        throw new SubscriptionError('Plan not found');
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: 12, // Default to yearly subscription
        customer_notify: 1
      });

      return await subscriptionRepository.create({
        id: subscription.id,
        planId,
        customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        metadata: subscription
      });
    } catch (error) {
      throw new SubscriptionError('Failed to create subscription: ' + error.message);
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
}

module.exports = new SubscriptionService();