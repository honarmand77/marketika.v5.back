const express = require("express");
const subCategoryController = require("../controllers/subCategoryController");
const router = express.Router();


// ایجاد زیردسته‌بندی
router.post("/add", subCategoryController.createSubCategory);

// دریافت تمام زیردسته‌بندی‌ها
router.get("/", subCategoryController.getAllSubCategories);

// دریافت زیردسته‌بندی بر اساس آیدی
router.get("/:id", subCategoryController.getSubCategoryById);

// به‌روزرسانی زیردسته‌بندی
router.put("/:id", subCategoryController.updateSubCategory);

// حذف زیردسته‌بندی
router.delete("/:id", subCategoryController.deleteSubCategory);

module.exports = router;