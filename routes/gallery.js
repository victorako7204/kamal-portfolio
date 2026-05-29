const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const Media = require('../models/Media');

router.get('/', async (req, res) => {
  try {
    await connectDB();
    const media = await Media.find({ isDeleted: false }, { assetData: 0 }).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    console.error("💥 Gallery route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
