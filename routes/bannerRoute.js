const express = require("express");
const router = express.Router();
const {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadBanner } = require("../middleware/upload");

// مسیرهای بنر
router.post("/add", uploadBanner.single("imageUrl"), createBanner , protect, adminOnly);
router.get("/", getBanners); // دریافت تمام بنرها
router.put("/:id", protect, adminOnly, updateBanner); // به‌روزرسانی بنر
router.delete("/:id", protect, adminOnly, deleteBanner); // حذف بنر

module.exports = router;
