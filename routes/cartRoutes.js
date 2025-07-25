const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validateCartItem } = require('../middleware/validationMiddleware');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/:userId', protect, cartController.getCart);

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post(
  '/add',
  protect,
  validateCartItem,
  cartController.addToCart
);

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
router.put(
  '/items/:itemId',
  protect,
  validateCartItem,
  cartController.updateCartItem
);

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
router.delete(
  '/items/:itemId',
  protect,
  cartController.removeFromCart
);

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/:userId', protect, cartController.clearCart);

module.exports = router;