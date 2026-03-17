// backend/src/routes/user.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const { v4: uuidv4 } = require('uuid');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/address', auth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { address: req.body },
      { new: true, upsert: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications', async (req, res) => {
  try {
    const { push, fcmToken, levels } = req.body;
    if (fcmToken) {
      await User.findOneAndUpdate(
        { 'notifications.fcmToken': fcmToken },
        
        {
          uid: uuidv4(),
          'notifications.push':     push ?? true,
          'notifications.fcmToken': fcmToken,
          'notifications.levels':   levels ?? { flood: true, risk: true, safe: false },
        },
        { upsert: true, new: true }
      );
      console.log(`[FCM] Token saved: ${fcmToken.slice(0, 20)}...`);
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'fcmToken required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── บันทึก Line User ID ────────────────────────────────────
router.put('/line-userid', async (req, res) => {
  try {
    const { lineUserId } = req.body;
    if (!lineUserId) return res.status(400).json({ error: 'lineUserId required' });

    await User.findOneAndUpdate(
      { lineUserId },

      { 
        uid: uuidv4(),
        lineUserId, 'notifications.push': true },
      { upsert: true, new: true }
    );
    console.log(`[Line] User saved: ${lineUserId.slice(0, 10)}...`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
