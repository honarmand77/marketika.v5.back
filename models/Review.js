const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ارجاع به کاربر
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // ارجاع به محصول
  rating: { type: Number, required: true, min: 1, max: 5 }, // امتیاز (1 تا 5)
  comment: { type: String, required: false }, // نظر (اختیاری)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
