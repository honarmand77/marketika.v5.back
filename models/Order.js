const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    products: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product" 
        },
        quantity: { 
          type: Number, 
          default: 1, 
          min: [1, "Quantity must be at least 1"], // اعتبارسنجی برای حداقل 1
        },
      },
    ],
    totalAmount: { 
      type: Number, 
      required: true, 
      min: [0, "Total amount cannot be negative"] // اعتبارسنجی برای مبلغ کل منفی نباشد
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "cancelled"], 
      default: "pending" 
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true } // اضافه کردن زمان‌های ایجاد و بروزرسانی به‌طور خودکار
);

module.exports = mongoose.model("Order", orderSchema);
