const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// GET /api/faculty — List all faculty
router.get('/', async (req, res) => {
  try {
    const docs = await Faculty.find().sort({ dept: 1, name: 1 });
    // Map MongoDB docs back to the shape the frontend expects (using facultyId as 'id')
    const faculty = docs.map(doc => ({
      id: doc.facultyId,
      name: doc.name,
      email: doc.email,
      dept: doc.dept,
      role: doc.role,
      phone: doc.phone,
      maxHours: doc.maxHours,
      currentHours: doc.currentHours,
      subjects: doc.subjects,
      availability: doc.availability,
      onLeave: doc.onLeave,
      image: doc.image
    }));
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty/:id — Update a single faculty member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const doc = await Faculty.findOneAndUpdate(
      { facultyId: id },
      { $set: update },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ success: true, faculty: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty — Bulk update all faculty (used after operations that modify multiple records)
router.put('/', async (req, res) => {
  try {
    const facultyArray = req.body;
    const ops = facultyArray.map(f => ({
      updateOne: {
        filter: { facultyId: f.id },
        update: {
          $set: {
            name: f.name,
            email: f.email,
            dept: f.dept,
            role: f.role,
            phone: f.phone,
            maxHours: f.maxHours,
            currentHours: f.currentHours,
            subjects: f.subjects,
            availability: f.availability,
            onLeave: f.onLeave,
            image: f.image
          }
        },
        upsert: true
      }
    }));
    await Faculty.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
