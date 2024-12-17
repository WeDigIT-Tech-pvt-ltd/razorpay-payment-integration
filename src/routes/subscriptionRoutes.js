const express = require('express');
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Validation middleware
const planValidation = [
  body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']),
  body('interval').isInt({ min: 1 }),
  body('item.name').isString().notEmpty(),
  body('item.amount').isInt({ min: 1 }),
  body('item.description').isString().notEmpty()
];

const changePlanValidation = [
  body('newPlanId').isString().notEmpty()
];

const cancelSubscriptionValidation = [
  body('cancelAtPeriodEnd').optional().isBoolean()
];

// Routes
router.post('/plans', planValidation, subscriptionController.createPlan);
router.post(
  '/subscriptions/:subscriptionId/change-plan',
  changePlanValidation,
  subscriptionController.changePlan
);
router.post(
  '/subscriptions/:subscriptionId/cancel',
  cancelSubscriptionValidation,
  subscriptionController.cancelSubscription
);
router.get('/subscriptions/:subscriptionId', subscriptionController.getSubscription);

module.exports = router;