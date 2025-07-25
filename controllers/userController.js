const User = require("../models/User");

const { encryptData } = require("../utils/encryption");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // حذف پسورد از پاسخ

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(user);
    res.json(encryptedResponse);
  } catch (error) {
    console.error("خطا در دریافت اطلاعات کاربر:", error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر.", error: error.message });
  }
};



exports.updateUserProfile = async (req, res) => {
  try {
    const { username, phone, profilePicture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.profilePicture = profilePicture || user.profilePicture;

    const updatedUser = await user.save();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData(updatedUser);
    res.json(encryptedResponse);
  } catch (error) {
    console.error("خطا در ویرایش اطلاعات کاربر:", error);
    res.status(500).json({ message: "خطا در ویرایش اطلاعات کاربر.", error: error.message });
  }
};




exports.deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    await user.deleteOne();

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "حساب کاربری با موفقیت حذف شد" });
    res.json(encryptedResponse);
  } catch (error) {
    console.error("خطا در حذف حساب کاربری:", error);
    res.status(500).json({ message: "خطا در حذف حساب کاربری.", error: error.message });
  }
};