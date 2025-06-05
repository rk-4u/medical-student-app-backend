// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

module.exports = router;