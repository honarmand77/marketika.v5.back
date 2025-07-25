const express = require("express");
const { createOrder, getOrdersByUser, getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createOrder);
router.get("/user", protect, getOrdersByUser);
router.get("/all", protect, adminOnly, getAllOrders);
router.put("/status/:id", protect, adminOnly, updateOrderStatus);

module.exports = router;
