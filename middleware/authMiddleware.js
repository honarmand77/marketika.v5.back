const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  // دریافت توکن از هدر Authorization
  const token = req.header("Authorization");

  // بررسی وجود توکن
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // بررسی ساختار توکن (Bearer Token)
  if (!token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  // حذف پیشوند "Bearer " از توکن
  const tokenWithoutBearer = token.split(" ")[1];

  try {
    // بررسی اعتبار توکن
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // ذخیره اطلاعات کاربر در req.user
    req.user = decoded;

    // ادامه به مرحله بعدی
    next();
  } catch (error) {
    // بررسی نوع خطا و ارسال پیام مناسب
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    // سایر خطاها
    res.status(401).json({ message: "Authentication failed" });
  }
};


exports.adminOnly = (req, res, next) => {
  // بررسی وجود req.user
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // بررسی نقش کاربر
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  // ادامه به مرحله بعدی
  next();
};