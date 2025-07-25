const { encryptData, decryptData } = require("../utils/encryption");
const Banner = require("../models/Banner");

exports.createBanner = async (req, res) => {
  try {
    // رمزگشایی داده‌های دریافتی از کلاینت
    const decryptedData = decryptData(req.body.data); // فرض کنید داده‌ها در `data` ارسال شده‌اند
    const { title, link } = decryptedData;

    const imageUrl = req.file ? req.file.path : null;

    if (!title || !imageUrl || !link) {
      return res.status(400).json({ message: "تمام فیلدها باید پر شوند" });
    }

    const newBanner = new Banner({ title, imageUrl, link });
    await newBanner.save();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "بنر با موفقیت ایجاد شد", banner: newBanner });
    res.status(201).json(encryptedResponse);
  } catch (error) {
    console.error("خطای سرور:", error);
    res.status(500).json({ message: "خطا در ایجاد بنر", error });
  }
};




exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    if (banners.length === 0) {
      return res.status(404).json({ message: "هیچ بنری پیدا نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(banners);
    res.status(200).json(encryptedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در دریافت بنرها", error: error.message });
  }
};




exports.updateBanner = async (req, res) => {
  const { id } = req.params;

  try {
    // رمزگشایی داده‌های دریافتی از کلاینت
    const decryptedData = decryptData(req.body.data);
    const { title, imageUrl, link } = decryptedData;

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { title, imageUrl, link },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "بنر مورد نظر یافت نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "بنر با موفقیت به‌روزرسانی شد", updatedBanner });
    res.json(encryptedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در به‌روزرسانی بنر", error: error.message });
  }
};



exports.deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
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