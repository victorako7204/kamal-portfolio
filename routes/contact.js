const express = require('express');
const router = express.Router();
const multer = require('multer');
const connectDB = require('../db');
const Inquiry = require('../models/Inquiry');

const uploadBrief = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 },
});

router.post('/', uploadBrief.single('briefFile'), async (req, res) => {
  try {
    await connectDB();

    const inquiry = new Inquiry({
      clientName: (req.body.clientName || '').trim(),
      companyName: (req.body.companyName || '').trim(),
      email: (req.body.email || '').trim(),
      projectBrief: (req.body.projectBrief || '').trim(),
      budgetRange: (req.body.budgetRange || '').trim(),
      timelineUrgency: (req.body.timelineUrgency || '').trim(),
      briefFile: '',
      briefData: req.file ? req.file.buffer : null,
      briefMimeType: req.file ? req.file.mimetype : '',
      briefFileName: req.file ? req.file.originalname : '',
    });

    const saved = await inquiry.save();
    if (req.file) {
      saved.briefFile = '/api/uploads/brief/' + saved._id;
      await saved.save();
    }

    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error("💥 Contact route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
