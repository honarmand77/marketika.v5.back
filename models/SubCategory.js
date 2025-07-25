const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // نام ساب‌کتگوری
  description: { type: String }, // توضیحات ساب‌کتگوری
  category: { 
    type: mongoose.Schema.Types.ObjectId, // آیدی کتگوری مرتبط
    ref: "Category", // ارجاع به مدل Category
    required: true 
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId, // آیدی محصولات مرتبط
    ref: "Product" // ارجاع به مدل Product
  }]
});

module.exports = mongoose.model("SubCategory", subCategorySchema);