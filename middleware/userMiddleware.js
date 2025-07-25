const jwt = require("jsonwebtoken");
const User = require("../models/User");

// بررسی احراز هویت کاربران (محافظت از مسیرها)
exports.protect = async (req, res, next) => {
  let token;

  // دریافت توکن از هدر Authorization یا از کوکی‌ها
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return res.status(401).json({ message: "توکن وجود ندارد، دسترسی غیرمجاز" });
  }

  try {
    // بررسی توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "کاربر یافت نشد" });
    }

    next();
  } catch (error) {
    console.error("خطای احراز هویت:", error);

    if (error.name === "TokenExpiredError") {
      res.clearCookie("token"); // حذف توکن از کوکی
      return res.status(401).json({ message: "توکن منقضی شده است، لطفا دوباره وارد شوید" });
    }

    return res.status(401).json({ message: "توکن نامعتبر است" });
  }
};

// بررسی سطح دسترسی ادمین
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "این عملیات فقط برای ادمین‌ها مجاز است" });
  }
  next();
};

