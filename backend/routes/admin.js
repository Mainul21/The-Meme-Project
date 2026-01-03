const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyToken, isAdmin);

// GET Admin Stats
router.get('/stats', async (req, res) => {
  try {
    const totalMemes = await Meme.countDocuments();
    const recentMemes = await Meme.countDocuments({
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Aggregate top active users (by number of memes)
    const topUsers = await Meme.aggregate([
      { $group: { _id: "$authorName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalMemes,
      recentMemes,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// DELETE any meme (Moderation)
router.delete('/memes/:id', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json({ message: 'Meme deleted by admin' });
  } catch (error) {
    console.error('Error deleting meme (admin):', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

module.exports = router;
