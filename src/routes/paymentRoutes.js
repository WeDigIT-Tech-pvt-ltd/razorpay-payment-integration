const express = require('express');
const { body, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('planId').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('phone').isString(),
  body('email').isEmail().notEmpty(),
];

const paymentVerificationValidation = [
  query('orderId').isString().notEmpty(),
];

// Payment routes
router.post('/orders', orderValidation, paymentController.createOrder);
router.get('/verify', paymentVerificationValidation, paymentController.verifyPayment);
router.get('/payments/:paymentId', paymentController.getPaymentDetails);

// Webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.handleWebhook);

module.exports = router;