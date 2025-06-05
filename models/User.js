// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'default-profile-pic-url' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
    required: function () {
      return this.role === 'student';
    },
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
