const historySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // مثلا: "viewed_product", "purchased_product"
    details: { type: mongoose.Schema.Types.Mixed }, // اطلاعات اضافی مربوط به عمل
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("History", historySchema);
  