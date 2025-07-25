
const Category = require("../models/Category");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const SubCategory = require("../models/SubCategory"); // مسیر فایل مدل SubCategory
const { encryptData } = require("../utils/encryption");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
    .populate("category")
    .populate("subCategory");

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(products);
    res.json(encryptedResponse);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصولات", error });
  }
};



exports.addProduct = async (req, res) => {
  try {
    let { name, price, stock, category, description, subCategory } = req.body;

    // اعتبارسنجی ورودی‌ها
    if (!name || !price || !stock) {
      return res.status(400).json({
        message: "فیلدهای name, price و stock الزامی هستند",
      });
    }

    if (!category) {
      return res.status(400).json({ message: "دسته‌بندی محصول الزامی است" });
    }

    if (!subCategory) {
      return res.status(400).json({ message: "زیردسته‌بندی محصول الزامی است" });
    }

    // اطمینان از اینکه price عدد است
    price = parseFloat(price);
    if (isNaN(price)) {
      return res.status(400).json({ message: "قیمت باید یک مقدار عددی باشد" });
    }

    // بررسی کاربر
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // بررسی وجود دسته‌بندی
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "دسته‌بندی یافت نشد" });
    }

    // بررسی وجود زیردسته‌بندی
    const subCategoryExists = await SubCategory.findById(subCategory);
    if (!subCategoryExists) {
      return res.status(404).json({ message: "زیردسته‌بندی یافت نشد" });
    }

    // ایجاد محصول جدید
    const newProduct = new Product({
      name,
      price,
      stock,
      category,
      description,
      subCategory, // اضافه کردن subCategory به مدل محصول
      images: req.file ? [req.file.path] : [],
      createdBy: {
        adminId: userId,
        adminName: user.username,
      },
    });

    // ذخیره محصول
    await newProduct.save();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      message: "محصول با موفقیت اضافه شد",
      product: newProduct,
    });
    res.status(201).json(encryptedResponse);
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ message: "خطا در افزودن محصول", error });
  }
};



exports.incrementLikes = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id: productId } = req.params;
    const { userId } = req.body;

    // اعتبارسنجی شناسه‌ها
    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "شناسه محصول یا کاربر نامعتبر است" });
    }

    // پیدا کردن محصول و کاربر
    const product = await Product.findById(productId).session(session);
    const user = await User.findById(userId).session(session);

    if (!product || !user) {
      return res.status(404).json({ message: "محصول یا کاربر یافت نشد" });
    }

    // بررسی وجود کاربر در لیست لایک‌ها
    const alreadyLiked = product.likes.some(like => 
      like.toString() === userId.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ 
        message: "شما قبلاً این محصول را لایک کرده‌اید"
      });
    }

    // افزودن لایک
    product.likes.push(userId);
    await product.save({ session });

    // افزودن به لیست علاقه‌مندی‌های کاربر
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save({ session });
    }

    await session.commitTransaction();
    const response = {
      success: true,
      message: "محصول با موفقیت لایک شد",
      likes: product.likes,
      likesCount: product.likes.length
    }
    const encryptedResponse = encryptData(response);
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در افزایش لایک محصول:", error);
    res.status(500).json({ 
      message: "خطا در افزایش لایک محصول",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};



exports.decrementLikes = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: productId } = req.params;
    const { userId } = req.body;

    // اعتبارسنجی شناسه‌ها
    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "شناسه محصول یا کاربر نامعتبر است" });
    }

    // پیدا کردن محصول و کاربر
    const product = await Product.findById(productId).session(session);
    const user = await User.findById(userId).session(session);

    if (!product || !user) {
      return res.status(404).json({ message: "محصول یا کاربر یافت نشد" });
    }

    // بررسی وجود کاربر در لیست لایک‌ها
    const likeIndex = product.likes.findIndex(like => 
      like.toString() === userId.toString()
    );

    if (likeIndex === -1) {
      return res.status(400).json({ 
        message: "شما این محصول را لایک نکرده‌اید"
      });
    }

    // حذف لایک
    product.likes.splice(likeIndex, 1);
    await product.save({ session });

    // حذف از لیست علاقه‌مندی‌های کاربر
    const wishlistIndex = user.wishlist.findIndex(id => 
      id.toString() === productId.toString()
    );
    
    if (wishlistIndex !== -1) {
      user.wishlist.splice(wishlistIndex, 1);
      await user.save({ session });
    }

    await session.commitTransaction();

    const response = {
      success: true,
      message: "لایک محصول با موفقیت حذف شد",
      likes: product.likes,
      likesCount: product.likes.length
    }
    const encryptedResponse = encryptData(response);
    res.status(200).json(encryptedResponse);


  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در حذف لایک محصول:", error);
    res.status(500).json({ 
      message: "خطا در حذف لایک محصول",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};


exports.editProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id: productId } = req.params;
    const { 
      name, 
      price, 
      stock, 
      category, 
      description, 
      subCategory,
      images 
    } = req.body;
    const userId = req.user.id;

    // اعتبارسنجی شناسه محصول
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "شناسه محصول نامعتبر است" });
    }

    // یافتن محصول
    const product = await Product.findById(productId).session(session);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    // یافتن کاربر
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // اعتبارسنجی دسته‌بندی اگر ارسال شده
    if (category) {
      const categoryExists = await Category.findById(category).session(session);
      if (!categoryExists) {
        return res.status(404).json({ message: "دسته‌بندی یافت نشد" });
      }
    }

    // اعتبارسنجی زیردسته‌بندی اگر ارسال شده
    if (subCategory) {
      const subCategoryExists = await SubCategory.findById(subCategory).session(session);
      if (!subCategoryExists) {
        return res.status(404).json({ message: "زیردسته‌بندی یافت نشد" });
      }
    }

    // اعتبارسنجی قیمت اگر ارسال شده
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ message: "قیمت باید یک مقدار عددی باشد" });
      }
    }

    // به‌روزرسانی فیلدهای محصول
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (description) product.description = description;
    if (subCategory) product.subCategory = subCategory;
    
    // مدیریت تصاویر
    if (req.file) {
      product.images.push(req.file.path);
    } else if (images && Array.isArray(images)) {
      product.images = images;
    }

    // ثبت اطلاعات ویرایش
    product.updatedBy = {
      adminId: userId,
      adminName: user.username,
      updatedAt: new Date()
    };

    // ذخیره تغییرات
    await product.save({ session });
    await session.commitTransaction();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      success: true,
      message: "محصول با موفقیت ویرایش شد",
      product
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در ویرایش محصول:", error);
    res.status(500).json({ 
      message: "خطا در ویرایش محصول",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

exports.deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    // اعتبارسنجی شناسه محصول
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "شناسه محصول نامعتبر است" });
    }

    // یافتن محصول
    const product = await Product.findById(productId).session(session);
    if (!product) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    // یافتن کاربر
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // حذف محصول از لیست علاقه‌مندی‌های تمام کاربران
    await User.updateMany(
      { wishlist: productId },
      { $pull: { wishlist: productId } },
      { session }
    );

    // حذف محصول از دیتابیس
    await Product.deleteOne({ _id: productId }).session(session);

    await session.commitTransaction();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      success: true,
      message: "محصول با موفقیت حذف شد",
      deletedProductId: productId
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در حذف محصول:", error);
    res.status(500).json({ 
      message: "خطا در حذف محصول",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};