const mongoose = require("mongoose");

const adminInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ارجاع به مدل User
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"], // وضعیت تأیید
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ارجاع به ادمین اصلی که تأیید کرده است
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AdminInfo", adminInfoSchema);