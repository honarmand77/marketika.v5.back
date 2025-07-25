const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const { encryptData } = require("../utils/encryption");

exports.createSubCategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    console.log(categoryId, name, description);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "کتگوری یافت نشد!" });
    }

    const subCategory = new SubCategory({
      name,
      description,
      category: categoryId,
    });

    await subCategory.save();

    // اضافه کردن زیردسته‌بندی به کتگوری
    category.subCategories.push(subCategory._id);
    await category.save();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({
      message: "زیردسته‌بندی با موفقیت ایجاد شد!",
      subCategory,
    });
    res.status(201).json(encryptedResponse);
  } catch (error) {
    console.error("خطا در ایجاد زیردسته‌بندی:", error);
    res.status(500).json({ message: "خطا در ایجاد زیردسته‌بندی!" });
  }
};


exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category");

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(subCategories);
    res.status(200).json(encryptedResponse);
  } catch (error) {
    console.error("خطا در دریافت زیردسته‌بندی‌ها:", error);
    res.status(500).json({ message: "خطا در دریافت زیردسته‌بندی‌ها!" });
  }
};



exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate("category");
    if (!subCategory) {
      return res.status(404).json({ message: "زیردسته‌بندی یافت نشد!" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(subCategory);
    res.status(200).json(encryptedResponse);
  } catch (error) {
    console.error("خطا در دریافت زیردسته‌بندی:", error);
    res.status(500).json({ message: "خطا در دریافت زیردسته‌بندی!" });
  }
};




exports.updateSubCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { name, description, categoryId } = req.body;

    // اعتبارسنجی شناسه
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "شناسه زیردسته‌بندی نامعتبر است" });
    }

    // یافتن زیردسته‌بندی
    const subCategory = await SubCategory.findById(id).session(session);
    if (!subCategory) {
      return res.status(404).json({ message: "زیردسته‌بندی یافت نشد" });
    }

    // اگر categoryId تغییر کرده باشد
    if (categoryId && !subCategory.category.equals(categoryId)) {
      const newCategory = await Category.findById(categoryId).session(session);
      if (!newCategory) {
        return res.status(404).json({ message: "دسته‌بندی جدید یافت نشد" });
      }

      // حذف از دسته‌بندی قدیم
      await Category.findByIdAndUpdate(
        subCategory.category,
        { $pull: { subCategories: id } },
        { session }
      );

      // اضافه به دسته‌بندی جدید
      await Category.findByIdAndUpdate(
        categoryId,
        { $addToSet: { subCategories: id } },
        { session }
      );

      subCategory.category = categoryId;
    }

    // به‌روزرسانی فیلدها
    if (name) subCategory.name = name;
    if (description) subCategory.description = description;

    await subCategory.save({ session });
    await session.commitTransaction();

    // رمزنگاری پاسخ
    const encryptedResponse = encryptData({
      success: true,
      message: "زیردسته‌بندی با موفقیت به‌روزرسانی شد",
      subCategory
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در به‌روزرسانی زیردسته‌بندی:", error);
    res.status(500).json({ 
      message: "خطا در به‌روزرسانی زیردسته‌بندی",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

exports.deleteSubCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // اعتبارسنجی شناسه
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "شناسه زیردسته‌بندی نامعتبر است" });
    }

    // یافتن و حذف زیردسته‌بندی
    const subCategory = await SubCategory.findByIdAndDelete(id).session(session);
    if (!subCategory) {
      return res.status(404).json({ message: "زیردسته‌بندی یافت نشد" });
    }

    // حذف از دسته‌بندی مربوطه
    await Category.findByIdAndUpdate(
      subCategory.category,
      { $pull: { subCategories: id } },
      { session }
    );

    // TODO: در صورت نیاز، حذف محصولات مرتبط یا انجام عملیات مرتبط دیگر

    await session.commitTransaction();

    // رمزنگاری پاسخ
    const encryptedResponse = encryptData({
      success: true,
      message: "زیردسته‌بندی با موفقیت حذف شد",
      deletedSubCategoryId: id
    });
    res.status(200).json(encryptedResponse);

  } catch (error) {
    await session.abortTransaction();
    console.error("خطا در حذف زیردسته‌بندی:", error);
    res.status(500).json({ 
      message: "خطا در حذف زیردسته‌بندی",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

