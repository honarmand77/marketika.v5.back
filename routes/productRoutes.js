const express = require("express");
const router = express.Router();
const {
  getAllProducts,
addProduct,
incrementLikes,
decrementLikes,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");

const { uploadProduct } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public Routes (No authentication required)
router.get("/", getAllProducts); // Get all products

// Protected Routes (Require user authentication)
router.patch("/like/:id", protect, incrementLikes); // Like a product
router.patch("/unlike/:id", protect, decrementLikes); // Unlike a product

// Admin Routes (Require admin privileges)
router.post("/add", protect, adminOnly, uploadProduct.single("image"), addProduct); // Add new product
router.put("/edit/:id", protect, adminOnly, uploadProduct.single("image"), editProduct); // Edit existing product
router.delete("/delete/:id", protect, adminOnly, deleteProduct); // Delete product

module.exports = router;