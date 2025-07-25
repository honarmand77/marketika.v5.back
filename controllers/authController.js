const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/otpMailer");
const { encryptData ,decryptData} = require("../utils/encryption");
const Cart = require("../models/Cart"); // Add this line with other imports
const validator = require('validator');
let otpStore = {}; // ذخیره موقت OTP

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "ایمیل الزامی است." });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // تولید OTP
    otpStore[email] = otp; // ذخیره OTP

    await sendOtpEmail(email, otp); // ارسال OTP

    // رمزنگاری پاسخ قبل از ارسال به کلاینت
    const encryptedResponse = encryptData({ message: "کد OTP ارسال شد." });
    res.status(200).json(encryptedResponse);
  } catch (err) {
    res.status(500).json({ message: "خطا در ارسال OTP.", error: err.message });
  }
};

exports.register = async (req, res) => {
  const { email, password, username, phone, role } = req.body;
  
  if (!email || !password || !username || !phone) {
    return res.status(400).json({ message: "تمام فیلدها الزامی هستند." });
  }

  try {
    // 1. بررسی وجود کاربر
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "این ایمیل قبلاً ثبت شده است." });
    }

    // 2. هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. ایجاد کاربر جدید (بدون سبد خرید)
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      phone,
      role: role || 'user',
      cart: null // صریحاً null قرار می‌دهیم
    });

    await newUser.save();

    // 4. آماده‌سازی پاسخ
    const responseData = {
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    };

    const encryptedResponse = encryptData(responseData);
    res.status(201).json(encryptedResponse);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "اطلاعات تکراری در سیستم وجود دارد",
        error: "DUPLICATE_DATA_ERROR"
      });
    }
    
    res.status(500).json({ 
      message: "خطای سرور در هنگام ثبت‌نام",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// ورود کاربر

exports.login = async (req, res) => {
  const { email, password, otp } = req.body;

  // 1. اعتبارسنجی ورودی‌ها
  if (!email || !password || !otp) {
    return res.status(400).json({ 
      success: false,
      message: "تمام فیلدها الزامی هستند"
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "فرمت ایمیل نامعتبر است"
    });
  }

  try {
    // 2. بررسی OTP
    if (!otpStore[email] || otpStore[email] !== parseInt(otp)) {
      return res.status(401).json({ 
        success: false,
        message: "کد تأیید نامعتبر است"
      });
    }

    // 3. یافتن کاربر
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "کاربر یافت نشد"
      });
    }

    // 4. بررسی وضعیت حساب
    if (user.isLocked && user.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: "حساب شما موقتاً مسدود شده است"
      });
    }

    // 5. بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 دقیقه
      }
      
      await user.save();
      return res.status(401).json({ 
        success: false,
        message: "رمز عبور اشتباه است"
      });
    }

    // 6. بازنشانی وضعیت ورود
    user.failedLoginAttempts = 0;
    user.lastLogin = Date.now();
    user.isLocked = false;
    user.lockUntil = undefined;
    await user.save();

    // 7. تولید توکن
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role
      }, 
      process.env.JWT_SECRET,
      { 
        expiresIn: "7d"
      }
    );

    // 8. پاکسازی OTP
    delete otpStore[email];

    // 9. تنظیم کوکی
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
      path: '/'
    });

    // 10. آماده‌سازی پاسخ
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture
    };

  const encryptedResponse = encryptData({userData , token});
   return res.status(200).json(encryptedResponse);

  } catch (err) {
    console.error('خطا در ورود:', err);
    return res.status(500).json({
      success: false,
      message: "خطای سرور در هنگام ورود"
    });
  }
};