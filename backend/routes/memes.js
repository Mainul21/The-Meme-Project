const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

const { verifyToken } = require('../middleware/auth');

// GET all memes (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const memes = await Meme.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Meme.countDocuments();

    res.json({
      memes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMemes: total
    });
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// GET memes by user UID
router.get('/user/:uid', async (req, res) => {
  try {
    const memes = await Meme.find({ authorUID: req.params.uid })
      .sort({ createdAt: -1 });
    res.json(memes);
  } catch (error) {
    console.error('Error fetching user memes:', error);
    res.status(500).json({ error: 'Failed to fetch user memes' });
  }
});

// GET single meme by ID
router.get('/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ error: 'Failed to fetch meme' });
  }
});

// POST new meme (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, imageData, template, captions } = req.body;
    const { uid, name: userName, email } = req.user;

    if (!name || !imageData || !template) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meme = new Meme({
      name,
      imageData,
      template,
      captions: captions || [],
      authorUID: uid,
      authorName: userName || (email ? email.split('@')[0] : 'Anonymous'),
      upvotes: [],
      downvotes: []
    });

    await meme.save();
    res.status(201).json(meme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

// Vote on a meme (Protected)
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const { uid } = req.user;
    // Atomic update to avoid VersionError
    // 1. Remove user from both arrays
    await Meme.findByIdAndUpdate(req.params.id, {
      $pull: { upvotes: uid, downvotes: uid }
    });

    // 2. Add to target array if needed
    if (type === 'upvote') {
      await Meme.findByIdAndUpdate(req.params.id, {
        $addToSet: { upvotes: uid }
      });
    } else if (type === 'downvote') {
      await Meme.findByIdAndUpdate(req.params.id, {
        $addToSet: { downvotes: uid }
      });
    }

    // 3. Handle legacy fields in a separate update (only if missing) - purely for data hygiene
    // using updateOne to not fail if document not found (though previous calls would have failed)
    await Meme.updateOne(
      { _id: req.params.id, authorUID: { $exists: false } },
      { $set: { authorUID: 'legacy_user', authorName: 'Anonymous' } }
    );

    const updatedMeme = await Meme.findById(req.params.id);
    
    if (!updatedMeme) {
       return res.status(404).json({ error: 'Meme not found' });
    }

    res.json(updatedMeme);
  } catch (error) {
    console.error('Error voting on meme:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});


// DELETE meme by ID (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    // Check if user is author or admin
    if (meme.authorUID !== req.user.uid && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Meme.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

module.exports = router;
