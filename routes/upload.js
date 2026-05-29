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

router.post('/', upload.single('asset'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
  const fileType = imageTypes.includes(ext) ? 'image' : 'video';

  const assetUrl = '/uploads/' + req.file.filename;

  const media = new Media({
    title: req.body.title,
    description: req.body.description || '',
    category: req.body.category,
    fileType,
    assetUrl,
  });

  const saved = await media.save();
  res.status(201).json(saved);
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
