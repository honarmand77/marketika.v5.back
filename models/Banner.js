const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    imageUrl: { 
      type: String, 
      required: true 
    },
    link: { 
      type: String, 
      default: "#", 
    }, // اعتبارسنجی URL
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true } // مدیریت خودکار زمان‌های ایجاد و بروزرسانی
);

module.exports = mongoose.model("Banner", BannerSchema);
