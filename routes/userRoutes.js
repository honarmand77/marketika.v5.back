const express = require("express");
const { protect, adminOnly } = require("../middleware/userMiddleware");
const { getUserProfile, updateUserProfile, deleteUserProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUserProfile);

// مسیرهای فقط مخصوص ادمین
router.get("/admin/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("خطا در دریافت کاربران:", error);
    res.status(500).json({ message: "خطا در دریافت لیست کاربران", error: error.message });
  }
});

module.exports = router;
