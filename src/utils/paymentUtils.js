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

exports.generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16); // 4-byte timestamp
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join(''); // 8-byte random hex string
  const objectId = (timestamp + random).substring(0, 24); // Ensure 12 bytes (24 hex chars)
  return objectId;
}