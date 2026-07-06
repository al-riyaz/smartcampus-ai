const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');

// GET /api/timetable — Get the current timetable grid
router.get('/', async (req, res) => {
  try {
    const doc = await Timetable.findOne().sort({ updatedAt: -1 });
    if (!doc) return res.json(null);
    res.json(doc.grid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/timetable — Save/replace the full timetable grid
router.put('/', async (req, res) => {
  try {
    const grid = req.body;
    // Upsert: update the single timetable doc or create it
    const doc = await Timetable.findOneAndUpdate(
      {},
      { grid },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
