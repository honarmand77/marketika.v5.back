const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // اگر کاربر لاگین کرده
  ip: String, // ذخیره IP بازدیدکننده
  createdAt: { type: Date, default: Date.now }, // تاریخ بازدید
});

module.exports = mongoose.model("View", viewSchema);