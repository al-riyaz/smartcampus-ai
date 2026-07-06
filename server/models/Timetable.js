const mongoose = require('mongoose');

// Stores the entire timetable as a single document for simplicity.
// The grid structure: { Monday: { 0: { cs: {...}, ec: {...}, me: {...} }, 1: {...} }, ... }
const timetableSchema = new mongoose.Schema({
  grid: { type: Object, required: true }   // The full week×slot×dept grid
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('Timetable', timetableSchema);
