// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/email');
const { validateSignup, validateLogin } = require('../utils/validation');

const signup = async (req, res, next) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { fullName, username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      fullName,
      username,
      email,
      password,
      otp,
      otpExpires,
    });
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(201).json({ message: 'User created, OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) return res.status(401).json({ message: 'Invalid credentials or unverified email' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    // Implement Google OAuth logic here
    res.status(501).json({ message: 'Google OAuth not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP resent to email' });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, googleLogin, verifyOtp, resendOtp };
