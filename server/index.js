require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const facultyRoutes = require('./routes/faculty');
const timetableRoutes = require('./routes/timetable');
const seatingRoutes = require('./routes/seating');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/seating', seatingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(`🚀 SmartCampus API server running on http://localhost:${PORT}`);
});
