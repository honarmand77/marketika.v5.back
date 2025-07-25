const express = require("express");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  addBanner,
  updateBanner,
  deleteBanner,
  addCategory,
  updateCategory,
  deleteCategory,
  requestAdmin,
approveAdmin,
rejectAdmin,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// محصولات
router.post("/product/add", protect, adminOnly, addProduct);
router.put("/product/update/:id", protect, adminOnly, updateProduct);
router.delete("/product/delete/:id", protect, adminOnly, deleteProduct);

// بنرها
router.post("/banner/add", protect, adminOnly, addBanner);
router.put("/banner/update/:id", protect, adminOnly, updateBanner);
router.delete("/banner/delete/:id", protect, adminOnly, deleteBanner);

// دسته‌بندی
router.post("/category/add", protect, adminOnly, addCategory);
router.put("/category/update/:id", protect, adminOnly, updateCategory);
router.delete("/category/delete/:id", protect, adminOnly, deleteCategory);



router.post("/request-admin", protect, adminOnly,requestAdmin);

// تأیید درخواست ادمین
router.post("/approve-admin", protect, adminOnly,approveAdmin);

// رد درخواست ادمین
router.post("/reject-admin", protect, adminOnly, rejectAdmin);

module.exports = router;
