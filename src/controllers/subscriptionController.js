const { validationResult } = require('express-validator');
const subscriptionService = require('../services/subscriptionService');
const { SubscriptionError } = require('../utils/errors');
const subscriptionRepository = require('../repositories/subscriptionRepository');

exports.createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period, interval, item } = req.body;
    const plan = await razorpay.plans.create({
      period,
      interval,
      item: {
        name: item.name,
        amount: item.amount,
        currency: 'INR',
        description: item.description
      }
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
};

exports.changePlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subscriptionId } = req.params;
    const { newPlanId } = req.body;

    const updatedSubscription = await subscriptionService.changePlan(
      subscriptionId,
      newPlanId
    );

    res.json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    if (error instanceof SubscriptionError) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error('Change plan error:', error);
      res.status(500).json({ success: false, error: 'Failed to change plan' });
    }
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    res.json({ 
      success: true, 
      subscription 
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve subscription' 
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await subscriptionService.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd
    );

    res.json({ success: true, subscription });
  } catch (error) {
    if (error instanceof SubscriptionError) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
  }
};