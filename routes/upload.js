const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const Media = require('../models/Media');

router.post('/', async (req, res) => {
  try {
    await connectDB();

    const { title, description, category, mediaUrl } = req.body;

    if (!title || !category || !mediaUrl) {
      return res.status(400).json({ success: false, error: 'title, category, and mediaUrl are required' });
    }

    const media = new Media({
      title: title.trim(),
      description: (description || '').trim(),
      category,
      mediaUrl: mediaUrl.trim(),
    });

    const saved = await media.save();

    res.status(201).json({
      _id: saved._id,
      title: saved.title,
      description: saved.description,
      category: saved.category,
      mediaUrl: saved.mediaUrl,
    });
  } catch (error) {
    console.error("💥 Upload route error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
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
