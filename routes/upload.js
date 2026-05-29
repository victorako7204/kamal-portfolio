const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp|bmp|svg/;
  const videoTypes = /mp4|webm|ogg|mov|avi|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (imageTypes.test(ext) || videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/', (req, res, next) => {
  console.log("================ BACKEND INCOMING REQUEST ================");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Content-Length (Bytes):", req.headers['content-length']);
  console.log("Content-Type:", req.headers['content-type']);
  console.log("==========================================================");
  next();
}, upload.single('asset'), async (req, res) => {
  if (!req.file && !req.files) {
    console.error("❌ BACKEND FAILURE: Request reached the route, but no binary files were detected or parsed by the middleware.");
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log("✅ BACKEND SUCCESS: File successfully parsed on the server.");
  console.log("File Metadata:", req.file || req.files);

  try {
    const imageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
    const fileType = imageTypes.includes(ext) ? 'image' : 'video';

    const assetUrl = '/uploads/' + req.file.filename;

    console.log("💾 ATTEMPTING MONGODB PERSISTENCE...");
    console.log("Target Payload Category:", req.body.category);
    console.log("Target Payload Title:", req.body.title);

    const media = new Media({
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category,
      fileType,
      assetUrl,
    });

    const saved = await media.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("💥 CRITICAL BACKEND ERROR PATHWAY:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

router.delete('/:id', async (req, res) => {
  const media = await Media.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!media) {
    return res.status(404).json({ message: 'Media not found' });
  }
  res.json({ message: 'Deleted successfully' });
});

module.exports = router;
