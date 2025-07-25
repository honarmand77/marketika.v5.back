const express = require("express");
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ایجاد نظر جدید (نیاز به احراز هویت دارد)
router.post("/products/:productId/reviews", protect, reviewController.createReview);

// دریافت تمام نظرات یک محصول
router.get("/products/:productId/reviews", reviewController.getProductReviews);

// دریافت یک نظر خاص
router.get("/reviews/:reviewId", reviewController.getReview);

// به‌روزرسانی نظر (نیاز به احراز هویت دارد)
router.put("/reviews/:reviewId", protect, reviewController.updateReview);

// حذف نظر (نیاز به احراز هویت دارد)
router.delete("/reviews/:reviewId", protect, reviewController.deleteReview);

module.exports = router;