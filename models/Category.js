const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image_url: { type: String, required: true },
  subCategories: [{
    type: mongoose.Schema.Types.ObjectId, // آیدی ساب‌کتگوری‌ها
    ref: "SubCategory" // ارجاع به مدل SubCategory
  }]
});
categorySchema.pre("find", function () {
  this.populate("subCategories");
});
module.exports = mongoose.model("Category", categorySchema);