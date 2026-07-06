const express = require('express');
const router = express.Router();
const SeatingArrangement = require('../models/SeatingArrangement');

// GET /api/seating — Get seating arrangement and utilization
router.get('/', async (req, res) => {
  try {
    const doc = await SeatingArrangement.findOne().sort({ updatedAt: -1 });
    if (!doc) return res.json({ arrangement: {}, utilization: 0 });
    res.json({ arrangement: doc.arrangement, utilization: doc.utilization });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seating — Save/replace seating arrangements
router.put('/', async (req, res) => {
  try {
    const { arrangement, utilization } = req.body;
    await SeatingArrangement.findOneAndUpdate(
      {},
      { arrangement, utilization },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
