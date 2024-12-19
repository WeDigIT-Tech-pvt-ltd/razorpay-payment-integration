const crypto = require('crypto');

exports.validateWebhookSignature = (webhookBody, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(webhookBody))
    .digest('hex');
  
  return expectedSignature === signature;
};

exports.formatAmount = (amount) => {
  // Convert amount to paise/cents (multiply by 100)
  return Math.round(amount * 100);
};

exports.generateReceiptId = () => {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}