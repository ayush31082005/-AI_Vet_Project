const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body || {};
    if ([fullName, email, mobile, password].some(value => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ success: false, message: 'Full name, email, mobile and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || fullName.length > 150 || mobile.length > 30) {
      return res.status(400).json({ success: false, message: 'Invalid account details' });
    }
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and at most 72 bytes' });
    }
    const user = await User.create({
      fullName: fullName.trim(), email: email.trim().toLowerCase(), mobile: mobile.trim(),
      password: await bcrypt.hash(password, 12), role: 'admin'
    });
    return res.status(201).json({ success: true, message: 'Admin account created', user: {
      id: user._id, fullName: user.fullName, email: user.email, role: user.role
    } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email already registered' });
    return res.status(500).json({ success: false, message: 'Admin creation failed' });
  }
};

module.exports = { createAdmin };
