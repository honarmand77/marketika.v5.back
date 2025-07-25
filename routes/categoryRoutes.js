const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { uploadCategory } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.get("/", categoryController.getCategories); // Get all categories
router.get("/:id", categoryController.getCategoryById); // Get single category

// Admin-only routes (require authentication and admin privileges)
router.post(
  "/",
  protect,
  adminOnly,
  uploadCategory.single("image"),
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadCategory.single("image"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;