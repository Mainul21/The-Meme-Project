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
  authorUID: {
    type: String,
    // required: true - Removed to support legacy anonymous memes
  },
  authorName: {
    type: String,
    // required: true - Removed to support legacy anonymous memes
  },
  upvotes: [{
    type: String // Array of user UIDs
  }],
  downvotes: [{
    type: String // Array of user UIDs
  }],
  comments: [{
    userUID: String,
    userName: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Meme', memeSchema);
