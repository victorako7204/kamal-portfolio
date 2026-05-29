const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const connectDB = require('../db');
const Media = require('../models/Media');
const { requireAuth } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: String(process.env.CLOUDINARY_API_KEY).trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("=== 📡 CLOUDINARY CONFIGURATION DIAGNOSTICS ===");
console.log("✅ Target Cloud Name :", cloudinary.config().cloud_name);
console.log("✅ API Key Loaded     :", cloudinary.config().api_key ? "YES (Verified length: " + cloudinary.config().api_key.length + ")" : "NO (MISSING)");
console.log("===============================================");

router.get('/signature', requireAuth, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET
    );
    return res.status(200).json({
      success: true,
      timestamp,
      signature,
      apiKey: String(process.env.CLOUDINARY_API_KEY).trim(),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    await connectDB();

    const { title, description, category, sourceType, mediaUrl, cloudinaryPublicId } = req.body;

    if (!title || !category || !sourceType || !mediaUrl) {
      return res.status(400).json({ success: false, error: 'title, category, sourceType, and mediaUrl are required' });
    }

    if (!['cloudinary', 'youtube'].includes(sourceType)) {
      return res.status(400).json({ success: false, error: 'sourceType must be "cloudinary" or "youtube"' });
    }

    const media = new Media({
      title: title.trim(),
      description: (description || '').trim(),
      category,
      sourceType,
      mediaUrl: mediaUrl.trim(),
      cloudinaryPublicId: sourceType === 'cloudinary' ? cloudinaryPublicId : null,
    });

    const saved = await media.save();

    res.status(201).json({
      _id: saved._id,
      title: saved.title,
      description: saved.description,
      category: saved.category,
      sourceType: saved.sourceType,
      mediaUrl: saved.mediaUrl,
      cloudinaryPublicId: saved.cloudinaryPublicId,
    });
  } catch (error) {
    console.error("💥 Upload route error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
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
