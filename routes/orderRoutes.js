const express = require("express");
const {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderInvoice
} = require("../controllers/orderController.js");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");
const { validateOrderCreation, validateOrderUpdate } = require("../middleware/orderValidation.js");

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post("/", protect, validateOrderCreation, createOrder);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, getOrderById);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get("/myorders", protect, getOrdersByUser);

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get("/", protect, adminOnly, getAllOrders);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put("/:id/status", protect, adminOnly, validateOrderUpdate, updateOrderStatus);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, cancelOrder);

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
router.get("/:id/invoice", protect, getOrderInvoice);

module.exports = router;