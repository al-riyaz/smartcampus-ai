const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true },  // e.g. 'fac-1'
  name: { type: String, required: true },
  email: String,
  dept: { type: String, enum: ['cs', 'ec', 'me'], required: true },
  role: String,
  phone: String,
  maxHours: { type: Number, default: 16 },
  currentHours: { type: Number, default: 0 },
  subjects: [String],                     // e.g. ['CS-301', 'CS-304']
  availability: { type: Object, default: {} },  // { Monday: [true,true,true,true], ... }
  onLeave: { type: Boolean, default: false },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
