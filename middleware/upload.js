const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const Category = require("../models/Category");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");

// تابع کمکی برای ایجاد دایرکتوری
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return dirPath;
    } catch (error) {
        throw new Error(`Failed to create directory: ${dirPath}`);
    }
};

// تابع برای تولید نام یکتا برای فایل‌ها
const generateUniqueFilename = (originalname) => {
    const ext = path.extname(originalname);
    const name = path.basename(originalname, ext);
    return `${name}-${Date.now()}${ext}`;
};

// تنظیمات ذخیره‌سازی برای دسته‌بندی‌ها
const categoryStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const categoryName = req.body.name;
            if (!categoryName) {
                return cb(new Error("نام دسته‌بندی الزامی است"));
            }

            const categoryPath = await ensureDirectoryExists(
                path.join("uploads", "categories", categoryName)
            );
            cb(null, categoryPath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
    },
});

// تنظیمات ذخیره‌سازی برای محصولات
const productStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { category, subCategory } = req.body;
            
            if (!category) {
                return cb(new Error("آیدی دسته‌بندی الزامی است"));
            }

            const [categoryData, subCategoryData] = await Promise.all([
                Category.findById(category),
                SubCategory.findById(subCategory)
            ]);

            if (!categoryData || !subCategoryData) {
                return cb(new Error("دسته‌بندی یا زیردسته یافت نشد"));
            }

            const productPath = await ensureDirectoryExists(
                path.join("uploads", "products", 
                         categoryData.name, subCategoryData.name)
            );
            cb(null, productPath);
        } catch (error) {
            cb(new Error(`خطا در تنظیم مسیر ذخیره‌سازی: ${error.message}`));
        }
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
    },
});

// تنظیمات ذخیره‌سازی برای بنرها
const bannerStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const bannerPath = await ensureDirectoryExists(
                path.join("uploads", "banners")
            );
            cb(null, bannerPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
    },
});

// فیلتر تصاویر
const imageFilter = (req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpeg|png|gif|webp)/)) {
        return cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
    }
    cb(null, true);
};

// ایجاد آپلودرها
const createUploader = (storage) => multer({ 
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // محدودیت حجم فایل: 5MB
});

const uploadCategory = createUploader(categoryStorage);
const uploadProduct = createUploader(productStorage);
const uploadBanner = createUploader(bannerStorage);

// تابع برای تولید لینک عمومی فایل‌ها
const generateFileUrl = (req, filePath) => {
    const relativePath = path.relative(
        path.join("uploads"), 
        filePath
    );
    return `${req.protocol}://${req.get('host')}/uploads/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = { 
    uploadBanner, 
    uploadProduct, 
    uploadCategory,
    generateFileUrl
};