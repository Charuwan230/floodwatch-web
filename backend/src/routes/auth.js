// backend/src/routes/auth.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');

router.post('/signin', auth, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const user = await User.findOneAndUpdate(
      { uid },
      { uid, email, displayName: name||'', photoURL: picture||'' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
