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
  fileType: {
    type: String,
    required: true,
    enum: {
      values: ['video', 'image'],
      message: 'fileType must be either "video" or "image"',
    },
  },
  assetUrl: {
    type: String,
    required: [true, 'Asset URL is required'],
  },
  assetData: {
    type: Buffer,
    required: true,
  },
  assetMimeType: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

mediaSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 432000 });

module.exports = mongoose.model('Media', mediaSchema);
