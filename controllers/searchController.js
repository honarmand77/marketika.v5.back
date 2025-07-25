const Product = require('../models/Product');

/**
 * جستجوی محصولات
 * @param {string} q - عبارت جستجو
 * @param {number} [page=1] - شماره صفحه
 * @param {number} [limit=12] - تعداد محصولات در هر صفحه
 * @returns {Object} - نتایج جستجو
 */
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    
    // اعتبارسنجی پارامترهای ورودی
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'عبارت جستجو الزامی است'
      });
    }

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'پارامترهای صفحه‌بندی نامعتبر هستند'
      });
    }

    const skip = (page - 1) * limit;

    // اجرای جستجو با استفاده از text index
    const results = await Product.aggregate([
      {
        $match: {
          $text: { $search: q }
        }
      },
      {
        $addFields: {
          score: { $meta: "textScore" }
        }
      },
      {
        $sort: { score: { $meta: "textScore" } }
      },
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                images: { $slice: ["$images", 1] }, // فقط اولین تصویر
                score: 1
              }
            }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const products = results[0].products;
    const totalResults = results[0].total[0]?.count || 0;

    res.json({
      success: true,
      query: q,
      totalResults,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalResults / limit),
      products
    });

  } catch (err) {
    console.error('خطا در جستجو:', err);
    res.status(500).json({
      success: false,
      message: 'خطای سرور در پردازش جستجو'
    });
  }
};

/**
 * جستجوی سریع (AutoComplete)
 * @param {string} q - عبارت جستجو
 * @param {number} [limit=5] - تعداد نتایج
 * @returns {Object} - نتایج جستجوی سریع
 */
const quickSearch = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'عبارت جستجو الزامی است'
      });
    }

    const results = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit))
    .select('name price images._id');

    res.json({
      success: true,
      results
    });

  } catch (err) {
    console.error('خطا در جستجوی سریع:', err);
    res.status(500).json({
      success: false,
      message: 'خطای سرور در پردازش جستجوی سریع'
    });
  }
};

module.exports = {
  searchProducts,
  quickSearch
};