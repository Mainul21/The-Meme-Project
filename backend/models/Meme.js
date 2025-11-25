const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageData: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  captions: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meme', memeSchema);
