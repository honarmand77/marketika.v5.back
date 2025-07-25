
    const Category = require("../models/Category");
    const fs = require("fs");
    const path = require("path");
    
    const { encryptData ,decryptData } = require("../utils/encryption");
    
    exports.createCategory = async (req, res) => {
      try {
    
        const { name, description } = req.body;
    
    
        const newCategory = new Category({
          name,
          description,
          image_url: req.file ? req.file.path : null,
      
          
        });
    
        await newCategory.save();
        const encryptedResponse = encryptData({
          message: "محصول با موفقیت اضافه شد",
          product: newCategory,
        });
        res.status(201).json(encryptedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
      }
    };
    
    exports.getCategories = async (req, res) => {
      try {
        const categories = await Category.find().populate("subCategories");
    
        // رمزنگاری پاسخ قبل از ارسال به کلاینت
        const encryptedResponse = encryptData(categories);
        res.status(200).json(encryptedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get categories", error: error.message });
      }
    };
    
    
    exports.getCategoryById = async (req, res) => {
      const { id } = req.params;
    
      try {
        const category = await Category.findById(id);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
    
        // رمزنگاری پاسخ قبل از ارسال به کلاینت
        const encryptedResponse = encryptData(category);
        res.status(200).json(encryptedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get category", error: error.message });
      }
    };
    
    
    
    exports.updateCategory = async (req, res) => {
      const { id } = req.params;
    
      try {
        // رمزگشایی داده‌های دریافتی از کلاینت
        const decryptedData = decryptData(req.body.data);
        const { name, description } = decryptedData;
    
        let { image_url } = decryptedData;
    
        // اگر فایلی آپلود شده باشد، تصویر جدید را به‌روزرسانی می‌کنیم
        if (req.file) {
          image_url = `uploads/categories/${req.file.filename}`;
        }
    
        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          { name, description, image_url },
          { new: true }
        );
        if (!updatedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }
    
        // اگر تصویر قبلی وجود دارد و تصویری جدید آپلود شده، تصویر قبلی را حذف می‌کنیم
        if (req.file && updatedCategory.image_url) {
          const oldImagePath = path.join(__dirname, "../", updatedCategory.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
    
        // رمزنگاری پاسخ قبل از ارسال به کلاینت
        const encryptedResponse = encryptData({ message: "Category updated successfully", updatedCategory });
        res.status(200).json(encryptedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
      }
    };
    
    
    
    exports.deleteCategory = async (req, res) => {
      const { id } = req.params;
    
      try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
          return res.status(404).json({ message: "Category not found" });
        }
    
        // اگر تصویر موجود باشد، آن را حذف می‌کنیم
        if (deletedCategory.image_url) {
          const imagePath = path.join(__dirname, "../", deletedCategory.image_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
    
        // رمزنگاری پاسخ قبل از ارسال به کلاینت
        const encryptedResponse = encryptData({ message: "Category deleted successfully", deletedCategory });
        res.status(200).json(encryptedResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete category", error: error.message });
      }
    };


    exports.updateCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // اعتبارسنجی شناسه دسته‌بندی
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "شناسه دسته‌بندی نامعتبر است" });
    }

    // یافتن دسته‌بندی
    const category = await Category.findById(id).session(session);
    if (!category) {
      return res.status(404).json({ message: "دسته‌بندی یافت نشد" });
    }

    // ذخیره مسیر تصویر قبلی برای حذف در صورت آپلود جدید
    const oldImagePath = category.image_url 
      ? path.join(__dirname, "../", category.image_url) 
      : null;

    // به‌روزرسانی فیلدها
    if (name) category.name = name;
    if (description) category.description = description;
    if (req.file) {
      category.image_url = req.file.path;
    }

    // ذخیره تغییرات
    await category.save({ session });

    // حذف تصویر قبلی اگر تصویر جدید آپلود شده باشد
    if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    await session.commitTransaction();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      success: true,
      message: "دسته‌بندی با موفقیت ویرایش شد",
      category
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در ویرایش دسته‌بندی:", error);
    res.status(500).json({ 
      message: "خطا در ویرایش دسته‌بندی",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

exports.deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // اعتبارسنجی شناسه دسته‌بندی
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "شناسه دسته‌بندی نامعتبر است" });
    }

    // یافتن دسته‌بندی
    const category = await Category.findById(id).session(session);
    if (!category) {
      return res.status(404).json({ message: "دسته‌بندی یافت نشد" });
    }

    // ذخیره مسیر تصویر برای حذف
    const imagePath = category.image_url 
      ? path.join(__dirname, "../", category.image_url) 
      : null;

    // حذف دسته‌بندی
    await Category.deleteOne({ _id: id }).session(session);

    // حذف تصویر اگر وجود داشته باشد
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await session.commitTransaction();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      success: true,
      message: "دسته‌بندی با موفقیت حذف شد",
      deletedCategoryId: id
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در حذف دسته‌بندی:", error);
    res.status(500).json({ 
      message: "خطا در حذف دسته‌بندی",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};