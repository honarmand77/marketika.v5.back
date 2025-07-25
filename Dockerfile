# استفاده از نسخه LTS نودجی‌اس
FROM node:18-alpine

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی package.json و نصب dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps 

# کد بک‌اند را کپی کنید
COPY . .

# پورت مورد استفاده در کد بک‌اند (مثلاً 5000)
EXPOSE 5000

# دستور اجرای سرور
CMD ["npm", "run", "dev"]