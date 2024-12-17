class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

class SubscriptionError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class PaymentError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  SubscriptionError,
  PaymentError
};