    const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Configure multer for single file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'familyPhoto') {
      cb(null, 'uploads/families/');
    } else if (file.fieldname === 'memberPhoto') {
      cb(null, 'uploads/members/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Upload family photo
router.post('/family', protect, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      path: req.file.path,
      filename: req.file.filename,
      message: 'Photo uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload member photo
router.post('/member', protect, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      path: req.file.path,
      filename: req.file.filename,
      message: 'Photo uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;