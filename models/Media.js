const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['motion', 'graphic'],
      message: 'Category must be either "motion" or "graphic"',
    },
  },
  sourceType: {
    type: String,
    enum: ['cloudinary', 'youtube'],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required'],
    trim: true,
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

mediaSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 432000 });

module.exports = mongoose.model('Media', mediaSchema);
