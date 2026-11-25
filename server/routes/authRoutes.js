
const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  googleLogin,
  getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const { createAdmin } = require('../controllers/adminAccountController');
const User = require('../models/User');

// Verify current database role as well as the signed token for privileged creation.
const requireCurrentAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id).select('role');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    return next();
  } catch {
    return res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};


// Public Routes

router.post("/signup", signup);

router.post("/login", login);

router.post("/google", googleLogin);


// Protected Route

router.get("/profile", authMiddleware, getProfile);
router.post('/admin', authMiddleware, requireCurrentAdmin, createAdmin);


module.exports = router;
