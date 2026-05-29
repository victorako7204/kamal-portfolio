const express = require('express');
const router = express.Router();
const multer = require('multer');
const connectDB = require('../db');
const Media = require('../models/Media');
const Inquiry = require('../models/Inquiry');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 4.5 * 1024 * 1024 },
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
    await connectDB();

    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    const fileType = imageMimeTypes.includes(req.file.mimetype) ? 'image' : 'video';

    console.log("💾 ATTEMPTING MONGODB PERSISTENCE...");
    console.log("Target Payload Category:", req.body.category);
    console.log("Target Payload Title:", req.body.title);

    const media = new Media({
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category,
      fileType,
      assetUrl: '', // placeholder, updated after save
      assetData: req.file.buffer,
      assetMimeType: req.file.mimetype,
    });

    const saved = await media.save();
    saved.assetUrl = '/api/uploads/media/' + saved._id;
    await saved.save();

    res.status(201).json({
      _id: saved._id,
      title: saved.title,
      description: saved.description,
      category: saved.category,
      fileType: saved.fileType,
      assetUrl: saved.assetUrl,
    });
  } catch (error) {
    console.error("💥 CRITICAL BACKEND ERROR PATHWAY:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

router.get('/media/:id', async (req, res) => {
  try {
    await connectDB();
    const media = await Media.findById(req.params.id);
    if (!media || !media.assetData) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.set('Content-Type', media.assetMimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(media.assetData);
  } catch (error) {
    console.error("💥 Media serve error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/brief/:id', async (req, res) => {
  try {
    await connectDB();
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry || !inquiry.briefData) {
      return res.status(404).json({ message: 'Brief not found' });
    }
    res.set('Content-Type', inquiry.briefMimeType);
    res.set('Content-Disposition', 'inline; filename="' + inquiry.briefFileName + '"');
    res.send(inquiry.briefData);
  } catch (error) {
    console.error("💥 Brief serve error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await connectDB();
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error("💥 Upload DELETE route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
