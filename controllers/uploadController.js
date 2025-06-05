// controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, MP4, and WEBM are allowed.'), false);
    }
  }
});

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({ 
      url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
};

module.exports = { upload, uploadMedia };