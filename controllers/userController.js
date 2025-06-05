// controllers/userController.js
const User = require('../models/User');
const { validateUpdateProfile } = require('../utils/validation');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { error } = validateUpdateProfile(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updates = req.body;
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.subscriptionPlan;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password -otp -otpExpires');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, deleteProfile };