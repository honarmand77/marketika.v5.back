const { body, validationResult } = require('express-validator');

exports.validateOrderCreation = [
  body('items').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.province').notEmpty().withMessage('Province is required'),
  body('paymentMethod').isIn(['credit-card', 'paypal', 'bank-transfer']).withMessage('Invalid payment method'),
  body('shippingPrice').isFloat({ min: 0 }).withMessage('Shipping price must be a positive number'),
  body('taxPrice').isFloat({ min: 0 }).withMessage('Tax price must be a positive number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errors.array()[0].msg, 400;
    }
    next();
  }
];

exports.validateOrderUpdate = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errors.array()[0].msg, 400;
    }
    next();
  }
];