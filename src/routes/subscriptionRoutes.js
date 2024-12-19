const express = require('express');
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

const changePlanValidation = [
  body('newPlanId').isString().notEmpty()
];

const cancelSubscriptionValidation = [
  body('cancelAtPeriodEnd').optional().isBoolean()
];

// Routes
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