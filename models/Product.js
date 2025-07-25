const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true, // حذف فضای اضافی در ابتدا و انتهای نام
    },
    price: { 
      type: Number, 
      required: true,
      min: [0, "Price must be a positive value"], // اعتبارسنجی قیمت مثبت
    },
    stock: { 
      type: Number, 
      required: true,
      min: [0, "Stock cannot be negative"], // اعتبارسنجی تعداد موجودی مثبت
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", // ارجاع به مدل Category
      required: true,
    },
    description: { 
      type: String, 
      maxlength: [500, "Description should not exceed 500 characters"], // محدودیت طول توضیحات
    },
    images: { 
      type: [String], 
      default: [],
      required: true,
      validate: {
        validator: function (val) {
          return val.length <= 5;
        },
        message: "You can upload up to 5 images only.",
      },
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      adminName: { type: String, required: true },
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId, // آیدی ساب‌کتگوری مرتبط
      ref: "SubCategory", // ارجاع به مدل SubCategory
      required: true
    },
    keywords:{
      type: String, 
      default:"خرید انواع محصولات خارجی , واردکننده تمامی اجناس خارجی از برند های معروف دنیا , marketika , مارکتیکا"
    }
  },
  { timestamps: true } // Mongoose به‌طور خودکار createdAt و updatedAt را اضافه می‌کند
);

module.exports = mongoose.model("Product", ProductSchema);
