const { validationResult } = require('express-validator');
const razorpay = require('../config/razorpay');
const planRepository = require('../repositories/planRepository');

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

      await planRepository.create({ ...item, period, interval });
  
      res.status(201).json({ success: true, plan });
    } catch (error) {
      console.error('Create plan error:', error);
      res.status(500).json({ success: false, error: 'Failed to create plan' });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { planId } = req.params;
  
        const plans = await planRepository.findByProductId(planId);
    
        res.status(201).json({ success: true,plans });
      } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch plan' });
      }
}