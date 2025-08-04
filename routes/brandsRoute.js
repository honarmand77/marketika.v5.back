const express = require("express");
const router = express.Router();
const {
  createBrands,
  getBrands,
  updateBrands,
  deleteBrands,
} = require("../controllers/brandsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadBrand } = require("../middleware/upload");

// مسیرهای بنر
router.post("/add", uploadBrand.single("imageUrl"), createBrands , protect, adminOnly);
router.get("/", getBrands); // دریافت تمام بنرها
router.put("/:id", protect, adminOnly, updateBrands); // به‌روزرسانی بنر
router.delete("/:id", protect, adminOnly, deleteBrands); // حذف بنر

module.exports = router;
