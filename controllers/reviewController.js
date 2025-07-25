const Review = require("../models/Review");
const Product = require("../models/Product");
const { calculateAverageRating } = require("../utils/ratingUtils");

// ایجاد نظر جدید
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; // از middleware احراز هویت گرفته می‌شود

    // بررسی وجود محصول
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    // بررسی اینکه کاربر قبلاً برای این محصول نظر داده یا نه
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "شما قبلاً برای این محصول نظر داده‌اید" });
    }

    // ایجاد نظر جدید
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });

    await review.save();

    // محاسبه میانگین امتیازهای محصول
    await calculateAverageRating(productId);

    res.status(201).json({
      message: "نظر شما با موفقیت ثبت شد",
      review
    });
  } catch (error) {
    console.error("خطا در ثبت نظر:", error);
    res.status(500).json({ message: "خطا در ثبت نظر" });
  }
};

// دریافت تمام نظرات یک محصول
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email") // اطلاعات کاربر را هم بگیر
      .sort({ createdAt: -1 }); // جدیدترین نظرات اول

    res.status(200).json(reviews);
  } catch (error) {
    console.error("خطا در دریافت نظرات:", error);
    res.status(500).json({ message: "خطا در دریافت نظرات" });
  }
};

// دریافت یک نظر خاص
exports.getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate("user", "name email");
    if (!review) {
      return res.status(404).json({ message: "نظر یافت نشد" });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("خطا در دریافت نظر:", error);
    res.status(500).json({ message: "خطا در دریافت نظر" });
  }
};

// به‌روزرسانی نظر
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // پیدا کردن نظر
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "نظر یافت نشد" });
    }

    // بررسی مالکیت نظر
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "شما مجاز به ویرایش این نظر نیستید" });
    }

    // به‌روزرسانی نظر
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // محاسبه مجدد میانگین امتیازهای محصول
    await calculateAverageRating(review.product);

    res.status(200).json({
      message: "نظر با موفقیت به‌روزرسانی شد",
      review
    });
  } catch (error) {
    console.error("خطا در به‌روزرسانی نظر:", error);
    res.status(500).json({ message: "خطا در به‌روزرسانی نظر" });
  }
};

// حذف نظر
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // پیدا کردن نظر
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "نظر یافت نشد" });
    }

    // بررسی مالکیت نظر (یا ادمین بودن)
    if (review.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "شما مجاز به حذف این نظر نیستید" });
    }

    const productId = review.product;
    await review.remove();

    // محاسبه مجدد میانگین امتیازهای محصول
    await calculateAverageRating(productId);

    res.status(200).json({ message: "نظر با موفقیت حذف شد" });
  } catch (error) {
    console.error("خطا در حذف نظر:", error);
    res.status(500).json({ message: "خطا در حذف نظر" });
  }
};