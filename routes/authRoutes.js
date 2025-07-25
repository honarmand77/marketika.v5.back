// فایل روتر: routes/authRoutes.js
const express = require("express");
const { sendOtp, register, login } = require("../controllers/authController");
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);

module.exports = router;

// فایل ابزار: utils/otpMailer.js
const nodemailer = require("nodemailer");

exports.sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "کد تأیید OTP",
    text: `کد تأیید شما: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
