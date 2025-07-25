const { body, param } = require('express-validator');

const validateCartItem = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  param('itemId').optional().isMongoId().withMessage('Invalid item ID')
];

module.exports = { validateCartItem };