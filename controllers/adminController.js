const Product = require("../models/Product");
const Category = require("../models/Category");
const Banner = require("../models/Banner");

exports.addProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ message: "Product added successfully", product });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Product updated successfully", product });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted successfully" });
};

exports.addBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ message: "Banner added successfully", banner });
};

exports.updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Banner updated successfully", banner });
};

exports.deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner deleted successfully" });
};

exports.addCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ message: "Category added successfully", category });
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Category updated successfully", category });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted successfully" });
};



const AdminInfo = require("../models/AdminInfo");
const User = require("../models/User");

exports.requestAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    // بررسی وجود کاربر
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد." });
    }

    // بررسی وجود درخواست قبلی
    const existingRequest = await AdminInfo.findOne({ userId });
    if (existingRequest) {
      return res.status(400).json({ message: "درخواست قبلی وجود دارد." });
    }

    // ایجاد درخواست جدید
    const adminInfo = new AdminInfo({ userId });
    await adminInfo.save();

    res.status(201).json({ message: "درخواست شما ثبت شد.", adminInfo });
  } catch (error) {
    res.status(500).json({ message: "خطا در ثبت درخواست.", error: error.message });
  }
};


exports.approveAdmin = async (req, res) => {
  const { adminInfoId, approvedById } = req.body;

  try {
    // بررسی وجود درخواست
    const adminInfo = await AdminInfo.findById(adminInfoId);
    if (!adminInfo) {
      return res.status(404).json({ message: "درخواست یافت نشد." });
    }

    // بررسی وجود ادمین اصلی
    const adminUser = await User.findById(approvedById);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "شما مجوز تأیید درخواست را ندارید." });
    }

    // تأیید درخواست
    adminInfo.status = "approved";
    adminInfo.approvedBy = approvedById;
    adminInfo.updatedAt = Date.now();
    await adminInfo.save();

    // تغییر نقش کاربر به ادمین
    const user = await User.findById(adminInfo.userId);
    user.role = "admin";
    await user.save();

    res.status(200).json({ message: "درخواست تأیید شد.", adminInfo });
  } catch (error) {
    res.status(500).json({ message: "خطا در تأیید درخواست.", error: error.message });
  }
};


exports.rejectAdmin = async (req, res) => {
  const { adminInfoId, approvedById } = req.body;

  try {
    // بررسی وجود درخواست
    const adminInfo = await AdminInfo.findById(adminInfoId);
    if (!adminInfo) {
      return res.status(404).json({ message: "درخواست یافت نشد." });
    }

    // بررسی وجود ادمین اصلی
    const adminUser = await User.findById(approvedById);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "شما مجوز رد درخواست را ندارید." });
    }

    // رد درخواست
    adminInfo.status = "rejected";
    adminInfo.approvedBy = approvedById;
    adminInfo.updatedAt = Date.now();
    await adminInfo.save();

    res.status(200).json({ message: "درخواست رد شد.", adminInfo });
  } catch (error) {
    res.status(500).json({ message: "خطا در رد درخواست.", error: error.message });
  }
};