require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require('cors');
const path = require('path');

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require("./routes/adminRoutes");
const bannerRoutes = require("./routes/bannerRoute");
const categoryRoutes = require("./routes/categoryRoutes")
const userRoutes = require("./routes/userRoutes")
const ViewRoutes = require("./routes/ViewRoutes")
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require("./routes/reviewRoutes");
const brandsRoutes = require("./routes/brandsRoute");

// اضافه کردن روت‌ها
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // برای درخواست‌های URL-encoded




app.use(cors({
    origin: "https://masters-college-count-buried.trycloudflare.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE" , "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }));



app.use("/api", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/banners", bannerRoutes); 
app.use("/api/Brands", brandsRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/views" , ViewRoutes)
app.use("/api/subcategories", subCategoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
