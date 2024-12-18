const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');
const { CURRENCY } = require('../config/constants');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('amount').isFloat({ min: 1 }),
  body('currency').optional().isIn(Object.values(CURRENCY)),
  body('notes').optional().isObject(),
  body('customerId').isNumeric(),
];

const paymentVerificationValidation = [
  body('orderId').isString().notEmpty(),
  body('paymentId').isString().notEmpty()
];

// Payment routes
router.post('/orders', orderValidation, paymentController.createOrder);
router.post('/verify', paymentVerificationValidation, paymentController.verifyPayment);
router.get('/payments/:paymentId', paymentController.getPaymentDetails);

// Webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

module.exports = router;