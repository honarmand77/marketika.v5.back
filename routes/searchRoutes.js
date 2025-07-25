const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { query } = require('express-validator');

// اعتبارسنجی پارامترهای جستجو
const searchValidation = [
  query('q')
    .trim()
    .notEmpty().withMessage('عبارت جستجو نمی‌تواند خالی باشد')
    .isLength({ max: 100 }).withMessage('عبارت جستجو نمی‌تواند بیشتر از 100 کاراکتر باشد')
    .escape(),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('شماره صفحه باید عددی مثبت باشد')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('تعداد در هر صفحه باید بین 1 تا 50 باشد')
    .toInt()
];

// اعتبارسنجی جستجوی سریع
const quickSearchValidation = [
  query('q')
    .trim()
    .notEmpty().withMessage('عبارت جستجو نمی‌تواند خالی باشد')
    .isLength({ max: 50 }).withMessage('عبارت جستجو نمی‌تواند بیشتر از 50 کاراکتر باشد')
    .escape(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('تعداد نتایج باید بین 1 تا 10 باشد')
    .toInt()
];

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: جستجوی محصولات
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: عبارت جستجو
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: شماره صفحه
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: تعداد محصولات در هر صفحه
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: نتایج جستجو
 *       400:
 *         description: پارامترهای نامعتبر
 *       500:
 *         description: خطای سرور
 */
router.get('/', searchValidation, searchController.searchProducts);

/**
 * @swagger
 * /api/search/quick:
 *   get:
 *     summary: جستجوی سریع محصولات (AutoComplete)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: عبارت جستجو
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: تعداد نتایج
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: نتایج جستجوی سریع
 *       400:
 *         description: پارامترهای نامعتبر
 *       500:
 *         description: خطای سرور
 */
router.get('/quick', quickSearchValidation, searchController.quickSearch);

module.exports = router;