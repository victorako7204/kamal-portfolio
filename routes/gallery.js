const express = require('express');
const router = express.Router();
const Media = require('../models/Media');

router.get('/', async (req, res) => {
  const media = await Media.find({ isDeleted: false }).sort({ createdAt: -1 });
  res.json(media);
});

module.exports = router;
