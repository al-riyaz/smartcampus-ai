import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import TimetableEditor from './components/TimetableEditor';
import Substitution from './components/Substitution';
import ExamManager from './components/ExamManager';
import HallTicketPortal from './components/HallTicketPortal';
import { 
  FACULTY, 
  SUBJECTS, 
  ROOMS, 
  getInitialTimetable,
  DAYS,
  SLOTS,
  getDays,
  getSlots,
  getDepartments,
  getSubjectsData,
  getFacultyData
} from './data';
import {
  fetchFaculty,
  saveFacultyBulk,
  fetchTimetable,
  saveTimetable,
  fetchSeating,
  saveSeating
} from './api';
import { getDefaultConfig, generateSlots } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // ─── Configuration State ──────────────────────────────────────────
  const [config, setConfig] = useState(() => getDefaultConfig('college', 'morning'));

  // Computed values from config
  const configDays = getDays(config);
  const configSlots = getSlots(config);
  const configDepts = getDepartments(config);

  // Data State
  const [faculty, setFaculty] = useState(FACULTY);
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [rooms, setRooms] = useState(ROOMS);
  const [timetable, setTimetable] = useState(getInitialTimetable());
  const [conflicts, setConflicts] = useState([]);
  const [seatingArrangement, setSeatingArrangement] = useState({});
  const [seatingUtilization, setSeatingUtilization] = useState(0);
  const [apiConnected, setApiConnected] = useState(false);
  
  // Track whether initial load is done to avoid saving seed data back
  const initialLoadDone = useRef(false);

  // ─── Load persisted data from MongoDB on mount ───────────────────
  useEffect(() => {
    async function loadFromAPI() {
      const [apiFaculty, apiTimetable, apiSeating] = await Promise.all([
        fetchFaculty(),
        fetchTimetable(),
        fetchSeating()
      ]);

      if (apiFaculty && apiFaculty.length > 0) {
        setFaculty(apiFaculty);
        setApiConnected(true);
      }
      if (apiTimetable) {
        setTimetable(apiTimetable);
      }
      if (apiSeating && apiSeating.arrangement && Object.keys(apiSeating.arrangement).length > 0) {
        setSeatingArrangement(apiSeating.arrangement);
        setSeatingUtilization(apiSeating.utilization || 0);
      }

      // Mark initial load as complete after a tick
      setTimeout(() => { initialLoadDone.current = true; }, 500);
    }
    loadFromAPI();
  }, []);

  // ─── Update Mock Data on Mode Change ────────────────────────────────
  useEffect(() => {
    if (initialLoadDone.current) {
      setSubjects(getSubjectsData(config.institutionMode));
      // For faculty, if school mode, use school mock. If college, restore college mock.
      // (If API is connected for college, we still use mock for simplicity of toggle demo)
      setFaculty(getFacultyData(config.institutionMode));
    }
  }, [config.institutionMode]);

  // ─── Save data to MongoDB on changes (Debounced) ──────────────────────────
  useEffect(() => {
    if (!initialLoadDone.current) return;
    saveFacultyBulk(faculty);
  }, [faculty]);

  // ─── Persist timetable changes to MongoDB ────────────────────────
  useEffect(() => {
    if (!initialLoadDone.current) return;
    saveTimetable(timetable);
  }, [timetable]);

  // ─── Persist seating changes to MongoDB ──────────────────────────
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (Object.keys(seatingArrangement).length === 0) return;
    saveSeating(seatingArrangement, seatingUtilization);
  }, [seatingArrangement, seatingUtilization]);
  
  // System Notifications
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Toast builder
  const addNotification = (text, type = 'info') => {
    const newId = Date.now();
    const newNotif = { id: newId, text, type, timestamp: new Date() };
    setNotifications(prev => [newNotif, ...prev]);
    setToasts(prev => [...prev, newNotif]);
    
    // Auto clear toast after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newId));
    }, 4000);
  };

  // Conflict Auditor — uses config-driven days, slots, departments
  const auditConflicts = (currentTimetable) => {
    const list = [];
    
    configDays.forEach(day => {
      configSlots.forEach(slot => {
        const slotData = currentTimetable[day]?.[slot.id];
        if (!slotData) return;

        const facAssignments = {};
        const roomAssignments = {};

        configDepts.forEach(dept => {
          const assign = slotData[dept];
          if (!assign) return;

          // Check if faculty is on leave
          const fac = faculty.find(f => f.id === assign.facultyId);
          if (fac && fac.onLeave) {
            list.push({
              id: `${day}-${slot.id}-leave-${dept}`,
              day,
              slotId: slot.id,
              dept,
              type: 'Teacher On Leave',
              message: `${fac.name} assigned to S5 ${dept.toUpperCase()} is currently marked On Leave.`
            });
          }

          // Check double-booking for Faculty
          if (facAssignments[assign.facultyId]) {
            const otherDept = facAssignments[assign.facultyId];
            list.push({
              id: `${day}-${slot.id}-fac-${assign.facultyId}`,
              day,
              slotId: slot.id,
              dept,
              type: 'Double Booking (Faculty)',
              message: `${fac?.name || 'Faculty'} is scheduled for both ${dept.toUpperCase()} and ${otherDept.toUpperCase()} in Slot ${slot.id + 1}.`
            });
          } else {
            facAssignments[assign.facultyId] = dept;
          }

          // Check double-booking for Rooms
          if (roomAssignments[assign.roomId]) {
            const otherDept = roomAssignments[assign.roomId];
            const roomObj = ROOMS.find(r => r.id === assign.roomId);
            list.push({
              id: `${day}-${slot.id}-room-${assign.roomId}`,
              day,
              slotId: slot.id,
              dept,
              type: 'Double Booking (Room)',
              message: `${roomObj?.name || 'Room'} is double-booked for both ${dept.toUpperCase()} and ${otherDept.toUpperCase()} in Slot ${slot.id + 1}.`
            });
          } else {
            roomAssignments[assign.roomId] = dept;
          }
        });
      });
    });

    setConflicts(list);
  };

  // Run audit on load or leave status change
  useEffect(() => {
    auditConflicts(timetable);
  }, [faculty, config]);

  const resolveConflictsAutomatically = () => {
    // Clone timetable
    const newTimetable = JSON.parse(JSON.stringify(timetable));

    // Remove classes with conflict and auto-reassign
    conflicts.forEach(c => {
      if (c.type === 'Teacher On Leave') {
        // Find a substitute and assign
        const currentAssign = newTimetable[c.day]?.[c.slotId]?.[c.dept];
        const targetSub = faculty.filter(f => f.dept === c.dept && !f.onLeave)[0];
        if (targetSub && currentAssign) {
          newTimetable[c.day][c.slotId][c.dept].facultyId = targetSub.id;
        }
      } else {
        // Clear double bookings
        if (newTimetable[c.day]?.[c.slotId]) {
          newTimetable[c.day][c.slotId][c.dept] = null;
        }
      }
    });

    setTimetable(newTimetable);
    auditConflicts(newTimetable);
    addNotification('Resolved all timetable conflicts automatically.', 'success');
  };

  // Dynamic Notification Count (Leaves needing substitution)
  const leavesNeedSubstituteCount = faculty.filter(f => f.onLeave).length;

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        notificationCount={leavesNeedSubstituteCount}
        config={config}
      />

      {/* Main dashboard contents */}
      <main className="main-content">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            faculty={faculty}
            timetable={timetable}
            onLeaveCount={leavesNeedSubstituteCount}
            conflicts={conflicts}
            seatingUtilization={seatingUtilization}
            setActiveTab={setActiveTab}
            resolveConflictsAutomatically={resolveConflictsAutomatically}
            config={config}
          />
        )}

        {activeTab === 'setup' && (
          <Setup 
            faculty={faculty}
            setFaculty={setFaculty}
            subjects={subjects}
            setSubjects={setSubjects}
            rooms={rooms}
            setRooms={setRooms}
            config={config}
            setConfig={setConfig}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableEditor 
            timetable={timetable}
            setTimetable={setTimetable}
            faculty={faculty}
            rooms={rooms}
            subjects={subjects}
            conflicts={conflicts}
            setConflicts={setConflicts}
            addNotification={addNotification}
            config={config}
          />
        )}

        {activeTab === 'substitution' && (
          <Substitution 
            timetable={timetable}
            setTimetable={setTimetable}
            faculty={faculty}
            setFaculty={setFaculty}
            subjects={subjects}
            rooms={rooms}
            addNotification={addNotification}
            recalculateConflicts={auditConflicts}
            config={config}
          />
        )}

        {activeTab === 'exams' && (
          <ExamManager 
            seatingArrangement={seatingArrangement}
            setSeatingArrangement={setSeatingArrangement}
            seatingUtilization={seatingUtilization}
            setSeatingUtilization={setSeatingUtilization}
            faculty={faculty}
            addNotification={addNotification}
            config={config}
          />
        )}

        {activeTab === 'halltickets' && (
          <HallTicketPortal 
            seatingArrangement={seatingArrangement}
          />
        )}

      </main>

      {/* Toast Popup Notification System */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
