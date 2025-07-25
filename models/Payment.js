const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // ارجاع به سفارش
  paymentMethod: { type: String, enum: ["creditCard", "paypal", "bankTransfer"], required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  amount: { type: Number, required: true }, // مبلغ پرداختی
  paymentDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
