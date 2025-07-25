const express = require("express");
const { addView, getProductViewers } = require("../controllers/viewController");

const router = express.Router();

router.post("/add-view/:productId", addView); // ثبت بازدید
router.get("/:productId/viewers", getProductViewers); // دریافت اطلاعات بازدیدکنندگان

module.exports = router;
