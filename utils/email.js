// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP for Email Verification',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
