const mongoose = require('mongoose');

// Stores all room seating arrangements as a single document.
// Shape: { 'room-101': { roomName, capacity, assignedSeats[][], allocatedCount, invigilator }, ... }
const seatingSchema = new mongoose.Schema({
  arrangement: { type: Object, required: true },
  utilization: { type: Number, default: 0 }
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('SeatingArrangement', seatingSchema);
