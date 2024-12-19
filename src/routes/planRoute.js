
const express = require('express');
const { body, param } = require('express-validator');
const planController = require('../controllers/planController');

const router = express.Router();


// Validation middleware
const planPostValidation = [
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']),
    body('interval').isInt({ min: 1 }),
    body('item.name').isString().notEmpty(),
    body('item.amount').isInt({ min: 1 }),
    body('item.description').isString().notEmpty()
];


// Validation middleware
const planGetValidation = [
    param('planId').isString().notEmpty(),
  ];

// Routes
router.post('/plans', planPostValidation, planController.createPlan);
router.get('/plans/:planId', planGetValidation, planController.getPlans);
