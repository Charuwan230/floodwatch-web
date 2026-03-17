// backend/src/routes/flood.js
const express   = require('express');
const router    = express.Router();
const FloodData = require('../models/FloodData');

// GET /api/flood — ล่าสุดทุกอำเภอ
router.get('/', async (req, res) => {
  try {
    const latest = await FloodData.aggregate([
      { $sort: { fetchedAt: -1 } },
      { $group: { _id: '$districtId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { districtId: 1 } },
    ]);
    res.json({ data: latest, updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flood/:id
router.get('/:districtId', async (req, res) => {
  try {
    const data = await FloodData
      .findOne({ districtId: req.params.districtId })
      .sort({ fetchedAt: -1 });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flood/:id/history
router.get('/:districtId/history', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await FloodData.find({
      districtId: req.params.districtId,
      fetchedAt: { $gte: since },
    }).sort({ fetchedAt: 1 }).limit(300);
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
