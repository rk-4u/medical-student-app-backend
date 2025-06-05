// routes/upload.js
const express = require('express');
const router = express.Router();
const { upload, uploadMedia } = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

router.post('/', auth, upload.single('file'), uploadMedia); // Changed 'media' to 'file' to match frontend
router.get('/signature', auth, (req, res) => {
  const cloudinary = require('../config/cloudinary');
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { 
      timestamp, 
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET 
    },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({ 
    signature, 
    timestamp, 
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME // Added cloud name
  });
});

module.exports = router;