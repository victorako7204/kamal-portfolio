const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const connectDB = require('../db');
const Media = require('../models/Media');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/signature', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});

router.post('/', async (req, res) => {
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
