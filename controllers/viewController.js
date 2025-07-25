const Product = require("../models/Product");
const User = require("../models/User");

exports.addView = async (req, res) => {
    try {
      console.log("🚀 دریافت درخواست بازدید:", req.body); // بررسی مقدار ورودی
  
      const { productId, userId } = req.body;
  
      if (!productId) {
        return res.status(400).json({ message: "آیدی محصول الزامی است" });
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "محصول یافت نشد" });
      }
  
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "کاربر یافت نشد" });
        }
  
        // بررسی اینکه آیا کاربر قبلاً این محصول را دیده است یا نه
        if (!product.viewers.includes(userId)) {
          product.viewers.push(userId);
          await product.save();
          console.log("✅ کاربر به viewers محصول اضافه شد:", product.viewers);
  
          // اضافه کردن این محصول به لیست `viewedProducts` کاربر
          if (!user.viewedProducts.includes(productId)) {
            user.viewedProducts.push(productId);
            await user.save();
            console.log("✅ محصول به viewedProducts کاربر اضافه شد:", user.viewedProducts);
          }
        }
      }
  
      res.json({ message: "بازدید ثبت شد", viewersCount: product.viewers.length });
    } catch (error) {
      console.error("❌ خطا در ثبت بازدید:", error);
      res.status(500).json({ message: "خطای سرور", error });
    }
  };
  
// دریافت تعداد و لیست بازدیدکنندگان یک محصول
exports.getProductViewers = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("viewers", "name email");
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    res.json({ 
      totalViewers: product.viewers.length, 
      viewers: product.viewers 
    });
  } catch (error) {
    res.status(500).json({ message: "خطای سرور", error });
  }
};
