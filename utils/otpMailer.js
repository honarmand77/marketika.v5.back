const nodemailer = require("nodemailer");

exports.sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // محتوای HTML ایمیل
  const emailContent = `
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>کد تایید مارکتیکا</title>
  </head>
  <body style="font-family: 'Vazir', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f6f9fc;">
      <tr>
        <td align="center" valign="top" style="padding: 40px 10px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <tr>
              <td align="center" valign="top" style="padding: 40px 20px; background:  #ffa05c; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">
                مارکتیکا
                </h1>
<svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M43 43C43 38.5817 46.5817 35 51 35C55.4183 35 59 38.5817 59 43C59 47.4183 55.4183 51 51 51C46.5817 51 43 47.4183 43 43Z" fill="#FFA05C"/>
<path d="M0 10C0 4.47715 4.47715 0 10 0H90C95.5228 0 100 4.47715 100 10V90C100 95.5228 95.5228 100 90 100H10C4.47715 100 0 95.5228 0 90V10Z" fill="#FFA05C"/>
<path d="M33.9389 43.3727C34.0727 38.8358 40.4784 38.0243 41.7394 42.3845V42.3845C41.9108 42.9772 41.942 43.6016 41.8307 44.2084L36.2499 74.6164C36.0413 75.7533 34.746 76.3151 33.7734 75.6905V75.6905C33.2935 75.3824 33.0103 74.8452 33.0271 74.2752L33.9389 43.3727Z" fill="white"/>
<path d="M37.5219 51.3282C37.5877 48.7464 41.2657 48.342 41.8908 50.8479V50.8479C41.9629 51.1368 41.976 51.4373 41.9294 51.7314L38.7944 71.5351C38.689 72.2012 37.9138 72.517 37.3729 72.1143V72.1143C37.1391 71.9403 37.0044 71.6634 37.0118 71.372L37.5219 51.3282Z" fill="white"/>
<path d="M39.522 51.1835C39.5849 48.5822 43.301 48.1934 43.901 50.7253V50.7253C43.9664 51.0011 43.9783 51.2869 43.9362 51.5672L40.7909 72.4812C40.6889 73.1594 39.8934 73.4757 39.3536 73.0526V73.0526C39.1311 72.8782 39.004 72.609 39.0109 72.3264L39.522 51.1835Z" fill="white"/>
<path d="M34 43C34 33.6112 41.6112 26 51 26C60.3888 26 68 33.6112 68 43V44C68 53.3888 60.3888 61 51 61C41.6112 61 34 53.3888 34 44V43Z" fill="white"/>
<path d="M43 43C43 38.5817 46.5817 35 51 35C55.4183 35 59 38.5817 59 43C59 47.4183 55.4183 51 51 51C46.5817 51 43 47.4183 43 43Z" fill="#FFA05C"/>
</svg>
              </td>
            </tr>
            <tr>
              <td align="center" valign="top" style="padding: 40px 20px 30px;">
                <h2 style="color: #ffa05c; font-size: 24px; font-weight: bold; margin: 0 0 20px;">خوش آمدید به وب‌سایت مارکتیکا</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 20px;">برای ورود به حساب کاربری خود، از کد زیر استفاده کنید</p>
                <div style="background-color: #f1c40f; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                  <p style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</p>
                </div>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 30px;">برای ورود به حساب کاربری خود و استفاده از خدمات، روی دکمه زیر کلیک کنید</p>
                <a href="http://localhost:3000/login" style="background-color: #314e89; border-radius: 50px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 15px 30px; text-decoration: none; transition: background-color 0.3s ease;">ورود به حساب</a>
              </td>
            </tr>
            <tr>
              <td align="center" valign="top" style="padding: 30px 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                <p style="color: #888888; font-size: 14px; line-height: 20px; margin: 0 0 10px;">اگر شما این درخواست را ارسال نکردید، لطفاً این ایمیل را نادیده بگیرید.</p>
                <p style="color: #888888; font-size: 14px; line-height: 20px; margin: 0;">
                  آدرس وب‌سایت: <a href="http://localhost:3000" style="color: #314e89; text-decoration: none;">مارکتیکا</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  // گزینه‌های ایمیل
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "کد تأیید OTP",
    html: emailContent, // محتوای HTML
  };

  // ارسال ایمیل
  await transporter.sendMail(mailOptions);
};