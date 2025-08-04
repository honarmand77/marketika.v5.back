const { encryptData, decryptData } = require("../utils/encryption");
const Brands = require("../models/Brands");

exports.createBrands = async (req, res) => {
  try {
    // رمزگشایی داده‌های دریافتی از کلاینت
    const decryptedData = decryptData(req.body.data); // فرض کنید داده‌ها در `data` ارسال شده‌اند
    const { title, link } = decryptedData;

    const imageUrl = req.file ? req.file.path : null;

    if (!title || !imageUrl || !link) {
      return res.status(400).json({ message: "تمام فیلدها باید پر شوند" });
    }

    const newBrands = new Brands({ title, imageUrl, link });
    await newBrands.save();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "بنر با موفقیت ایجاد شد", Brands: newBrands });
    res.status(201).json(encryptedResponse);
  } catch (error) {
    console.error("خطای سرور:", error);
    res.status(500).json({ message: "خطا در ایجاد بنر", error });
  }
};




exports.getBrands = async (req, res) => {
  try {
    const brands = await Brands.find();
    if (brands.length === 0) {
      return res.status(404).json({ message: "هیچ بنری پیدا نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(brands);
    res.status(200).json(encryptedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در دریافت بنرها", error: error.message });
  }
};




exports.updateBrands = async (req, res) => {
  const { id } = req.params;

  try {
    // رمزگشایی داده‌های دریافتی از کلاینت
    const decryptedData = decryptData(req.body.data);
    const { title, imageUrl, link } = decryptedData;

    const updatedBrands = await Brands.findByIdAndUpdate(
      id,
      { title, imageUrl, link },
      { new: true }
    );

    if (!updatedBrands) {
      return res.status(404).json({ message: "بنر مورد نظر یافت نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "بنر با موفقیت به‌روزرسانی شد", updatedBrands });
    res.json(encryptedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در به‌روزرسانی بنر", error: error.message });
  }
};



exports.deleteBrands = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBrands = await Brands.findByIdAndDelete(id);
    if (!deletedBrands) {
      return res.status(404).json({ message: "بنر مورد نظر یافت نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "بنر با موفقیت حذف شد" });
    res.json(encryptedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در حذف بنر", error: error.message });
  }
};