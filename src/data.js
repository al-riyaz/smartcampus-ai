// SmartCampus Mock Database Setup
import { generateSlots } from './config';

export const DEPARTMENTS = [
  { id: 'cs', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'ec', name: 'Electronics & Communication', code: 'ECE' },
  { id: 'me', name: 'Mechanical Engineering', code: 'ME' }
];

export const COLLEGE_SUBJECTS = [
  { id: 'sub-cs1', code: 'CS-301', name: 'Database Management Systems', dept: 'cs', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-cs2', code: 'CS-302', name: 'Design & Analysis of Algorithms', dept: 'cs', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-cs3', code: 'CS-303', name: 'Web Technology Lab', dept: 'cs', type: 'Lab', hoursPerWeek: 3 },
  { id: 'sub-cs4', code: 'CS-304', name: 'Artificial Intelligence', dept: 'cs', type: 'Theory', hoursPerWeek: 3 },
  
  { id: 'sub-ec1', code: 'EC-301', name: 'Digital Signal Processing', dept: 'ec', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-ec2', code: 'EC-302', name: 'Microcontrollers & IoT', dept: 'ec', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-ec3', code: 'EC-303', name: 'Embedded Systems Lab', dept: 'ec', type: 'Lab', hoursPerWeek: 3 },
  { id: 'sub-ec4', code: 'EC-304', name: 'Wireless Communication', dept: 'ec', type: 'Theory', hoursPerWeek: 3 },

  { id: 'sub-me1', code: 'ME-301', name: 'Thermodynamics & Heat Transfer', dept: 'me', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-me2', code: 'ME-302', name: 'Fluid Mechanics', dept: 'me', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-me3', code: 'ME-303', name: 'CAD/CAM Laboratory', dept: 'me', type: 'Lab', hoursPerWeek: 3 },
  { id: 'sub-me4', code: 'ME-304', name: 'Automobile Engineering', dept: 'me', type: 'Theory', hoursPerWeek: 3 }
];

export const SCHOOL_SUBJECTS = [
  { id: 'sub-sch1', code: 'MAT-101', name: 'Advanced Mathematics', dept: 'cs', type: 'Theory', hoursPerWeek: 5 },
  { id: 'sub-sch2', code: 'PHY-101', name: 'Physics', dept: 'ec', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-sch3', code: 'PHY-LAB', name: 'Physics Lab', dept: 'ec', type: 'Lab', hoursPerWeek: 2 },
  { id: 'sub-sch4', code: 'CHEM-101', name: 'Chemistry', dept: 'me', type: 'Theory', hoursPerWeek: 4 },
  { id: 'sub-sch5', code: 'CHEM-LAB', name: 'Chemistry Lab', dept: 'me', type: 'Lab', hoursPerWeek: 2 },
  { id: 'sub-sch6', code: 'ENG-101', name: 'English Literature', dept: 'cs', type: 'Theory', hoursPerWeek: 4 }
];

export const getSubjectsData = (mode) => mode === 'school' ? SCHOOL_SUBJECTS : COLLEGE_SUBJECTS;
export const SUBJECTS = COLLEGE_SUBJECTS;

export const ROOMS = [
  { id: 'room-101', name: 'Lecture Hall 101', capacity: 60, type: 'Lecture' },
  { id: 'room-102', name: 'Lecture Hall 102', capacity: 40, type: 'Lecture' },
  { id: 'room-103', name: 'Lecture Hall 103', capacity: 45, type: 'Lecture' },
  { id: 'room-lab-a', name: 'Advanced Computing Lab A', capacity: 30, type: 'Lab' },
  { id: 'room-lab-b', name: 'IoT & Microcontroller Lab', capacity: 30, type: 'Lab' },
  { id: 'room-lab-c', name: 'CAD/CAM Workshop Lab', capacity: 25, type: 'Lab' }
];

// Initial availability slot matrix: 5 days (Mon-Fri), 4 slots per day
// Slot index 0: 09:00 - 10:30, Slot 1: 10:45 - 12:15, Slot 2: 13:30 - 15:00, Slot 3: 15:15 - 16:45
const createAvailabilityMatrix = (exceptions = []) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const matrix = {};
  days.forEach(day => {
    matrix[day] = [true, true, true, true]; // Default: Available in all 4 slots
  });
  exceptions.forEach(([day, slot]) => {
    if (matrix[day]) matrix[day][slot] = false;
  });
  return matrix;
};

export const COLLEGE_FACULTY = [
  {
    id: 'fac-1',
    name: 'Dr. Amit Sharma',
    email: 'amit.sharma@smartcampus.edu',
    dept: 'cs',
    role: 'Professor',
    phone: '+91 98765 43210',
    maxHours: 16,
    currentHours: 12,
    subjects: ['CS-301', 'CS-304'],
    availability: createAvailabilityMatrix([['Tuesday', 2], ['Friday', 3]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-2',
    name: 'Prof. Neha Gupta',
    email: 'neha.gupta@smartcampus.edu',
    dept: 'cs',
    role: 'Associate Professor',
    phone: '+91 98765 43211',
    maxHours: 16,
    currentHours: 14,
    subjects: ['CS-302', 'CS-303'],
    availability: createAvailabilityMatrix([['Monday', 0], ['Thursday', 1]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-3',
    name: 'Dr. Rohan Deshmukh',
    email: 'rohan.deshmukh@smartcampus.edu',
    dept: 'cs',
    role: 'Assistant Professor',
    phone: '+91 98765 43212',
    maxHours: 18,
    currentHours: 11,
    subjects: ['CS-301', 'CS-303'],
    availability: createAvailabilityMatrix([['Wednesday', 3]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-4',
    name: 'Prof. Sarah Thomas',
    email: 'sarah.thomas@smartcampus.edu',
    dept: 'ec',
    role: 'Professor',
    phone: '+91 98765 43213',
    maxHours: 14,
    currentHours: 10,
    subjects: ['EC-301', 'EC-304'],
    availability: createAvailabilityMatrix([['Tuesday', 0], ['Wednesday', 1]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-5',
    name: 'Dr. Vikram Kapoor',
    email: 'vikram.kapoor@smartcampus.edu',
    dept: 'ec',
    role: 'Associate Professor',
    phone: '+91 98765 43214',
    maxHours: 16,
    currentHours: 11,
    subjects: ['EC-302', 'EC-303'],
    availability: createAvailabilityMatrix([['Monday', 2], ['Friday', 1]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-6',
    name: 'Prof. David Miller',
    email: 'david.miller@smartcampus.edu',
    dept: 'me',
    role: 'Professor',
    phone: '+91 98765 43215',
    maxHours: 12,
    currentHours: 8,
    subjects: ['ME-301', 'ME-304'],
    availability: createAvailabilityMatrix([['Thursday', 2]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-7',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@smartcampus.edu',
    dept: 'me',
    role: 'Associate Professor',
    phone: '+91 98765 43216',
    maxHours: 16,
    currentHours: 11,
    subjects: ['ME-302', 'ME-303'],
    availability: createAvailabilityMatrix([['Tuesday', 1], ['Wednesday', 2]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-8',
    name: 'Prof. James Carter',
    email: 'james.carter@smartcampus.edu',
    dept: 'me',
    role: 'Assistant Professor',
    phone: '+91 98765 43217',
    maxHours: 18,
    currentHours: 10,
    subjects: ['ME-302', 'ME-303'],
    availability: createAvailabilityMatrix([['Monday', 3]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
  }
];

export const SCHOOL_FACULTY = [
  {
    id: 'fac-s1',
    name: 'Mr. Robert Smith',
    email: 'robert.smith@smartcampus.edu',
    dept: 'cs',
    role: 'Math Teacher',
    phone: '+91 98765 00001',
    maxHours: 25,
    currentHours: 15,
    subjects: ['MAT-101'],
    availability: createAvailabilityMatrix([]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-s2',
    name: 'Ms. Emily Davis',
    email: 'emily.davis@smartcampus.edu',
    dept: 'ec',
    role: 'Science Teacher',
    phone: '+91 98765 00002',
    maxHours: 20,
    currentHours: 12,
    subjects: ['PHY-101', 'PHY-LAB'],
    availability: createAvailabilityMatrix([['Monday', 0]]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'fac-s3',
    name: 'Mr. John Wilson',
    email: 'john.wilson@smartcampus.edu',
    dept: 'cs',
    role: 'English Teacher',
    phone: '+91 98765 00003',
    maxHours: 25,
    currentHours: 18,
    subjects: ['ENG-101'],
    availability: createAvailabilityMatrix([]),
    onLeave: false,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

export const getFacultyData = (mode) => mode === 'school' ? SCHOOL_FACULTY : COLLEGE_FACULTY;
export const FACULTY = COLLEGE_FACULTY;

// Mock Students data for Seating Allocation
export const STUDENTS = Array.from({ length: 90 }, (_, index) => {
  const deptCode = index < 35 ? 'CS' : index < 65 ? 'EC' : 'ME';
  const semester = 'S5';
  const idNum = String(index + 1).padStart(3, '0');
  const names = [
    'Aarav', 'Ananya', 'Aditya', 'Diya', 'Ishaan', 'Kavya', 'Rahul', 'Sneha', 'Vihaan', 'Riya',
    'Arjun', 'Meera', 'Rohan', 'Tanvi', 'Kabir', 'Zara', 'Dev', 'Alisha', 'Neil', 'Pooja',
    'Sid', 'Sanya', 'Yash', 'Shruti', 'Aryan', 'Neha', 'Karan', 'Kriti', 'Rishi', 'Tara',
    'Kunal', 'Kiara', 'Vivek', 'Nisha', 'Vijay', 'Shreya', 'Amit', 'Richa', 'Anil', 'Preeti',
    'Sam', 'Rina', 'Vikram', 'Divya', 'Sanjay', 'Gita', 'Harsh', 'Radha', 'Akash', 'Swati',
    'Abhay', 'Maya', 'Nitin', 'Reema', 'Sunil', 'Jyoti', 'Pankaj', 'Komal', 'Rajesh', 'Uma',
    'Vijay', 'Lata', 'Ramesh', 'Asha', 'Suresh', 'Hema', 'Naresh', 'Suman', 'Mahesh', 'Aruna',
    'Gopal', 'Lalita', 'Dinesh', 'Rekha', 'Jitendra', 'Kiran', 'Pradeep', 'Sarita', 'Sanjay', 'Manju'
  ];
  return {
    rollNumber: `${deptCode}-2024-${idNum}`,
    name: `${names[index % names.length]} ${String.fromCharCode(65 + (index % 26))}.`,
    dept: deptCode.toLowerCase(),
    semester
  };
});

// Default Mock Exams scheduled
export const EXAMS = [
  { id: 'exam-1', subjectCode: 'CS-301', name: 'Database Management Systems', dept: 'cs', date: '2026-07-15', slot: 'Morning (09:30 - 12:30)' },
  { id: 'exam-2', subjectCode: 'EC-301', name: 'Digital Signal Processing', dept: 'ec', date: '2026-07-15', slot: 'Morning (09:30 - 12:30)' },
  { id: 'exam-3', subjectCode: 'ME-301', name: 'Thermodynamics & Heat Transfer', dept: 'me', date: '2026-07-15', slot: 'Morning (09:30 - 12:30)' },
  { id: 'exam-4', subjectCode: 'CS-302', name: 'Design & Analysis of Algorithms', dept: 'cs', date: '2026-07-17', slot: 'Afternoon (14:00 - 17:00)' },
  { id: 'exam-5', subjectCode: 'EC-302', name: 'Microcontrollers & IoT', dept: 'ec', date: '2026-07-17', slot: 'Afternoon (14:00 - 17:00)' },
  { id: 'exam-6', subjectCode: 'ME-302', name: 'Fluid Mechanics', dept: 'me', date: '2026-07-17', slot: 'Afternoon (14:00 - 17:00)' }
];

// Initial Empty Timetable Grid structure
// Weekly slot configurations: 5 days, 4 slots
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const SLOTS = [
  { id: 0, time: '09:00 - 10:30', name: 'Slot 1' },
  { id: 1, time: '10:45 - 12:15', name: 'Slot 2' },
  { id: 2, time: '13:30 - 15:00', name: 'Slot 3' },
  { id: 3, time: '15:15 - 16:45', name: 'Slot 4' }
];

export const getInitialTimetable = () => {
  const timetable = {};
  DAYS.forEach(day => {
    timetable[day] = {};
    SLOTS.forEach(slot => {
      timetable[day][slot.id] = {
        cs: null,
        ec: null,
        me: null
      };
    });
  });
  
  // Seed a few initial conflict-free items
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
};

// ─── Config-Aware Helpers ──────────────────────────────────────────────
// These accept a resolved config object and produce dynamic days/slots/timetables

/**
 * Returns the working days from config, falling back to legacy DAYS.
 */
export function getDays(config) {
  return config?.workingDays || DAYS;
}

/**
 * Returns computed time slots from config, falling back to legacy SLOTS.
 */
export function getSlots(config) {
  if (!config) return SLOTS;
  return generateSlots(config);
}

/**
 * Returns a department key list from config.
 * Falls back to the 3 built-in departments.
 */
export function getDepartments(config) {
  if (config?.departments && config.departments.length > 0) {
    return config.departments.map(d => d.id);
  }
  return DEPARTMENTS.map(d => d.id);
}

/**
 * Builds an empty timetable grid from config-derived days, slots, and departments.
 */
export function getInitialTimetableFromConfig(config) {
  const days = getDays(config);
  const slots = getSlots(config);
  const depts = getDepartments(config);

  const timetable = {};
  days.forEach(day => {
    timetable[day] = {};
    slots.forEach(slot => {
      const entry = {};
      depts.forEach(d => { entry[d] = null; });
      timetable[day][slot.id] = entry;
    });
  });

  return timetable;
}

