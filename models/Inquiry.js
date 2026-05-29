const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  clientName: {
    type: String,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  projectBrief: {
    type: String,
    trim: true,
  },
  budgetRange: {
    type: String,
    trim: true,
  },
  timelineUrgency: {
    type: String,
    trim: true,
  },
  briefFile: {
    type: String,
    default: '',
  },
  briefData: {
    type: Buffer,
    default: null,
  },
  briefMimeType: {
    type: String,
    default: '',
  },
  briefFileName: {
    type: String,
    default: '',
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inquiry', inquirySchema);
