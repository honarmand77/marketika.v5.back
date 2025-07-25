const Review = require("../models/Review");
const Product = require("../models/Product");

exports.calculateAverageRating = async (productId) => {
  try {
    const result = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: result[0].averageRating,
        reviewCount: result[0].reviewCount
      });
    } else {
      // اگر هیچ نظری وجود نداشت
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error("خطا در محاسبه میانگین امتیاز:", error);
  }
};