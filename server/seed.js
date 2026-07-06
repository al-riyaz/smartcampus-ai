/**
 * Seed Script — Populates MongoDB with initial SmartCampus mock data.
 * 
 * Usage: cd server && npm run seed
 * Requires: MongoDB running on localhost:27017
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Timetable = require('./models/Timetable');
const SeatingArrangement = require('./models/SeatingArrangement');

// ─── Faculty Seed Data ───────────────────────────────────────────────
const createAvailabilityMatrix = (exceptions = []) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const matrix = {};
  days.forEach(day => {
    matrix[day] = [true, true, true, true];
  });
  exceptions.forEach(([day, slot]) => {
    if (matrix[day]) matrix[day][slot] = false;
  });
  return matrix;
};

const FACULTY_SEED = [
  {
    facultyId: 'fac-1', name: 'Dr. Amit Sharma', email: 'amit.sharma@smartcampus.edu',
    dept: 'cs', role: 'Professor', phone: '+91 98765 43210',
    maxHours: 16, currentHours: 12, subjects: ['CS-301', 'CS-304'],
    availability: createAvailabilityMatrix([['Tuesday', 2], ['Friday', 3]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-2', name: 'Prof. Neha Gupta', email: 'neha.gupta@smartcampus.edu',
    dept: 'cs', role: 'Associate Professor', phone: '+91 98765 43211',
    maxHours: 16, currentHours: 14, subjects: ['CS-302', 'CS-303'],
    availability: createAvailabilityMatrix([['Monday', 0], ['Thursday', 1]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-3', name: 'Dr. Rohan Deshmukh', email: 'rohan.deshmukh@smartcampus.edu',
    dept: 'cs', role: 'Assistant Professor', phone: '+91 98765 43212',
    maxHours: 18, currentHours: 11, subjects: ['CS-301', 'CS-303'],
    availability: createAvailabilityMatrix([['Wednesday', 3]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-4', name: 'Prof. Sarah Thomas', email: 'sarah.thomas@smartcampus.edu',
    dept: 'ec', role: 'Professor', phone: '+91 98765 43213',
    maxHours: 14, currentHours: 10, subjects: ['EC-301', 'EC-304'],
    availability: createAvailabilityMatrix([['Tuesday', 0], ['Wednesday', 1]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-5', name: 'Dr. Vikram Kapoor', email: 'vikram.kapoor@smartcampus.edu',
    dept: 'ec', role: 'Associate Professor', phone: '+91 98765 43214',
    maxHours: 16, currentHours: 11, subjects: ['EC-302', 'EC-303'],
    availability: createAvailabilityMatrix([['Monday', 2], ['Friday', 1]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-6', name: 'Prof. David Miller', email: 'david.miller@smartcampus.edu',
    dept: 'me', role: 'Professor', phone: '+91 98765 43215',
    maxHours: 12, currentHours: 8, subjects: ['ME-301', 'ME-304'],
    availability: createAvailabilityMatrix([['Thursday', 2]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-7', name: 'Dr. Priya Nair', email: 'priya.nair@smartcampus.edu',
    dept: 'me', role: 'Associate Professor', phone: '+91 98765 43216',
    maxHours: 16, currentHours: 11, subjects: ['ME-302', 'ME-303'],
    availability: createAvailabilityMatrix([['Tuesday', 1], ['Wednesday', 2]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    facultyId: 'fac-8', name: 'Prof. James Carter', email: 'james.carter@smartcampus.edu',
    dept: 'me', role: 'Assistant Professor', phone: '+91 98765 43217',
    maxHours: 18, currentHours: 10, subjects: ['ME-302', 'ME-303'],
    availability: createAvailabilityMatrix([['Monday', 3]]),
    onLeave: false, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  }
];

// ─── Timetable Seed Data ─────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = [0, 1, 2, 3];

function getInitialTimetable() {
  const timetable = {};
  DAYS.forEach(day => {
    timetable[day] = {};
    SLOTS.forEach(slot => {
      timetable[day][slot] = { cs: null, ec: null, me: null };
    });
  });
  timetable['Monday'][0] = {
    cs: { subjectCode: 'CS-301', facultyId: 'fac-1', roomId: 'room-101' },
    ec: { subjectCode: 'EC-301', facultyId: 'fac-4', roomId: 'room-102' },
    me: { subjectCode: 'ME-301', facultyId: 'fac-6', roomId: 'room-103' }
  };
  timetable['Monday'][1] = {
    cs: { subjectCode: 'CS-302', facultyId: 'fac-2', roomId: 'room-101' },
    ec: { subjectCode: 'EC-302', facultyId: 'fac-5', roomId: 'room-lab-b' },
    me: { subjectCode: 'ME-302', facultyId: 'fac-7', roomId: 'room-103' }
  };
  timetable['Tuesday'][1] = {
    cs: { subjectCode: 'CS-303', facultyId: 'fac-3', roomId: 'room-lab-a' },
    ec: null,
    me: { subjectCode: 'ME-303', facultyId: 'fac-8', roomId: 'room-lab-c' }
  };
  timetable['Wednesday'][0] = {
    cs: { subjectCode: 'CS-304', facultyId: 'fac-1', roomId: 'room-101' },
    ec: { subjectCode: 'EC-304', facultyId: 'fac-4', roomId: 'room-102' },
    me: null
  };
  return timetable;
}

// ─── Main Seed Function ──────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Faculty.deleteMany({});
    await Timetable.deleteMany({});
    await SeatingArrangement.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed faculty
    await Faculty.insertMany(FACULTY_SEED);
    console.log(`👥 Seeded ${FACULTY_SEED.length} faculty members`);

    // Seed timetable
    const grid = getInitialTimetable();
    await Timetable.create({ grid });
    console.log('📅 Seeded initial timetable');

    console.log('\n✅ Seed complete! You can now start the server with: npm start');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
