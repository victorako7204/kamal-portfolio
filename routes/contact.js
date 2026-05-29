const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connectDB = require('../db');
const Inquiry = require('../models/Inquiry');

const briefStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'briefs'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const uploadBrief = multer({
  storage: briefStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', uploadBrief.single('briefFile'), async (req, res) => {
  try {
    await connectDB();

    const data = {
      clientName: (req.body.clientName || '').trim(),
      companyName: (req.body.companyName || '').trim(),
      email: (req.body.email || '').trim(),
      projectBrief: (req.body.projectBrief || '').trim(),
      budgetRange: (req.body.budgetRange || '').trim(),
      timelineUrgency: (req.body.timelineUrgency || '').trim(),
      briefFile: req.file ? '/uploads/briefs/' + req.file.filename : '',
    };

    const inquiry = new Inquiry(data);
    await inquiry.save();

    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error("💥 Contact route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
