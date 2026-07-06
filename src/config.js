/**
 * SmartCampus — Centralized Configuration System
 * 
 * Every scheduling factor lives here. Nothing is hardcoded elsewhere.
 * Components receive config via props and adapt dynamically.
 */

// ─── Institution Mode ────────────────────────────────────────────────
export const INSTITUTION_MODES = {
  school: 'school',
  college: 'college'
};

// ─── College Shift Types ─────────────────────────────────────────────
export const COLLEGE_SHIFTS = {
  morning: 'morning',
  evening: 'evening'
};

// ─── All Available Days ──────────────────────────────────────────────
export const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Session Duration Options (in minutes) ───────────────────────────
export const SESSION_DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

// ─── Preset Defaults ─────────────────────────────────────────────────
export const SCHOOL_DEFAULTS = {
  institutionMode: 'school',
  collegeShift: null,
  sessionDurationMinutes: 45,
  slotsPerDay: 8,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  startTime: '08:00',
  endTime: '15:30',
  breakAfterSlot: 4,       // Lunch break after the 4th slot
  breakDurationMinutes: 30, // Lunch break duration
  shortBreakMinutes: 5,     // Gap between regular slots
  roomVacancyTarget: 85,    // Target room occupancy %
  maxStudentsPerRoomOverride: null, // null = use room's own capacity
  factorWeights: {
    expertise: 40,
    availability: 40,
    workload: 20
  }
};

export const COLLEGE_DEFAULTS = {
  institutionMode: 'college',
  collegeShift: 'morning',
  sessionDurationMinutes: 90,
  slotsPerDay: 4,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  breakAfterSlot: 2,
  breakDurationMinutes: 75,
  shortBreakMinutes: 15,
  roomVacancyTarget: 95,
  maxStudentsPerRoomOverride: null,
  factorWeights: {
    expertise: 40,
    availability: 40,
    workload: 20
  }
};

export const COLLEGE_EVENING_OVERRIDES = {
  collegeShift: 'evening',
  startTime: '14:00',
  endTime: '21:00'
};

// ─── Helper: Generate Time Slots from Config ─────────────────────────
/**
 * Dynamically generates time slot objects from the config.
 * Returns an array of { id, time, name } objects.
 */
export function generateSlots(config) {
  const {
    startTime,
    sessionDurationMinutes,
    slotsPerDay,
    shortBreakMinutes,
    breakAfterSlot,
    breakDurationMinutes
  } = config;

  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  let currentMinutes = startHour * 60 + startMin;

  for (let i = 0; i < slotsPerDay; i++) {
    const fromH = Math.floor(currentMinutes / 60);
    const fromM = currentMinutes % 60;
    const endMinutes = currentMinutes + sessionDurationMinutes;
    const toH = Math.floor(endMinutes / 60);
    const toM = endMinutes % 60;

    const formatTime = (h, m) =>
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    slots.push({
      id: i,
      time: `${formatTime(fromH, fromM)} - ${formatTime(toH, toM)}`,
      name: `Period ${i + 1}`
    });

    // Advance: session duration + appropriate break
    currentMinutes = endMinutes;
    if (i + 1 === breakAfterSlot) {
      currentMinutes += breakDurationMinutes; // Lunch / long break
    } else {
      currentMinutes += shortBreakMinutes; // Short inter-period gap
    }
  }

  return slots;
}

// ─── Helper: Get Default Config ──────────────────────────────────────
export function getDefaultConfig(mode = 'college', shift = 'morning') {
  if (mode === 'school') {
    return { ...SCHOOL_DEFAULTS };
  }
  const base = { ...COLLEGE_DEFAULTS };
  if (shift === 'evening') {
    return { ...base, ...COLLEGE_EVENING_OVERRIDES };
  }
  return base;
}

// ─── Helper: Build a full resolved config with computed slots ────────
export function resolveConfig(config) {
  return {
    ...config,
    days: config.workingDays,
    slots: generateSlots(config)
  };
}
