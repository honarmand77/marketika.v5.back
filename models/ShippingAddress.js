const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ارجاع به کاربر
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // ارجاع به سفارش
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, required: false },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ShippingAddress", shippingAddressSchema);
