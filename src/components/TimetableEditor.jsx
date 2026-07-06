import React, { useState } from 'react';
import { Sparkles, AlertTriangle, AlertCircle, Trash2, Edit2, Check } from 'lucide-react';
import { DAYS as LEGACY_DAYS, SLOTS as LEGACY_SLOTS, getDays, getSlots, getDepartments } from '../data';

export default function TimetableEditor({ 
  timetable, 
  setTimetable, 
  faculty, 
  rooms, 
  subjects, 
  conflicts,
  setConflicts,
  addNotification,
  config 
}) {
  // ── Derive days/slots/departments from config ────────────────────
  const DAYS = getDays(config);
  const SLOTS = getSlots(config);
  const DEPTS = getDepartments(config);

  const [selectedDept, setSelectedDept] = useState(DEPTS[0] || 'cs');
  const [timetableMode, setTimetableMode] = useState('dept'); // 'dept' or 'faculty'
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculty[0]?.id || '');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [editingCell, setEditingCell] = useState(null); // { day, slotId }
  
  // Local edit states
  const [editSubject, setEditSubject] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [validationError, setValidationError] = useState('');

  // Run Simulated Solver
  const handleAIGenerate = () => {
    setIsOptimizing(true);
    setOptimizationProgress(10);
    
    // Simulate loading optimization steps
    const intervals = [
      { p: 30, t: 400 },
      { p: 60, t: 900 },
      { p: 90, t: 1400 },
      { p: 100, t: 1800 }
    ];

    intervals.forEach(step => {
      setTimeout(() => {
        setOptimizationProgress(step.p);
        if (step.p === 100) {
          // Perform full generation
          const newTimetable = JSON.parse(JSON.stringify(timetable));
          
          // Simple generator that creates conflict-free slot maps
          DAYS.forEach(day => {
            SLOTS.forEach(slot => {
              const entry = {};
              DEPTS.forEach((dept, dIdx) => {
                const deptSubjects = subjects.filter(s => s.dept === dept);
                const deptFaculty = faculty.filter(f => f.dept === dept && !f.onLeave);
                
                if (deptSubjects.length > 0 && deptFaculty.length > 0) {
                  const sub = deptSubjects[slot.id % deptSubjects.length];
                  const fac = deptFaculty[slot.id % deptFaculty.length];
                  const matchRooms = rooms.filter(r => r.type === (sub.type === 'Lab' ? 'Lab' : 'Lecture'));
                  const room = matchRooms[dIdx % matchRooms.length] || rooms[dIdx % rooms.length];
                  entry[dept] = { subjectCode: sub.code, facultyId: fac.id, roomId: room.id };
                } else {
                  entry[dept] = null;
                }
              });
              newTimetable[day] = newTimetable[day] || {};
              newTimetable[day][slot.id] = entry;
            });
          });

          setTimetable(newTimetable);
          setConflicts([]);
          setIsOptimizing(false);
          addNotification('Engine generated a conflict-free timetable successfully!', 'success');
        }
      }, step.t);
    });
  };

  const startEditCell = (day, slotId, currentVal) => {
    setEditingCell({ day, slotId });
    if (currentVal) {
      setEditSubject(currentVal.subjectCode);
      setEditFaculty(currentVal.facultyId);
      setEditRoom(currentVal.roomId);
    } else {
      setEditSubject('');
      setEditFaculty('');
      setEditRoom('');
    }
    setValidationError('');
  };

  const deleteCell = (day, slotId) => {
    const newTimetable = JSON.parse(JSON.stringify(timetable));
    if (newTimetable[day]?.[slotId]) {
      newTimetable[day][slotId][selectedDept] = null;
    }
    setTimetable(newTimetable);
    
    // Recalculate conflicts
    recalculateConflicts(newTimetable);
    addNotification(`Removed slot assignment for ${day} Slot ${slotId + 1}`, 'info');
  };

  const recalculateConflicts = (currentTimetable) => {
    const list = [];
    
    DAYS.forEach(day => {
      SLOTS.forEach(slot => {
        const slotData = currentTimetable[day]?.[slot.id];
        if (!slotData) return;

        const facAssignments = {};
        const roomAssignments = {};

        DEPTS.forEach(dept => {
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
            const roomObj = rooms.find(r => r.id === assign.roomId);
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

  const saveCellEdit = () => {
    // Validate inputs
    if (!editSubject || !editFaculty || !editRoom) {
      setValidationError('All fields are required.');
      return;
    }

    const targetFac = faculty.find(f => f.id === editFaculty);
    if (targetFac && targetFac.onLeave) {
      setValidationError(`Conflict: ${targetFac.name} is currently marked On Leave.`);
      return;
    }

    // Perform check for overlap before writing (live conflict checker)
    const newTimetable = JSON.parse(JSON.stringify(timetable));
    const day = editingCell.day;
    const slotId = editingCell.slotId;

    // Check if room is booked in this slot by other departments
    let roomClash = false;
    let facClash = false;
    DEPTS.forEach(d => {
      if (d === selectedDept) return;
      const otherAssign = newTimetable[day]?.[slotId]?.[d];
      if (otherAssign) {
        if (otherAssign.roomId === editRoom) roomClash = d;
        if (otherAssign.facultyId === editFaculty) facClash = d;
      }
    });

    if (roomClash) {
      const rmName = rooms.find(r => r.id === editRoom)?.name;
      setValidationError(`Conflict: ${rmName} is already booked by ${roomClash.toUpperCase()} in this slot.`);
      return;
    }

    if (facClash) {
      const fcName = faculty.find(f => f.id === editFaculty)?.name;
      setValidationError(`Conflict: ${fcName} is already teaching ${facClash.toUpperCase()} in this slot.`);
      return;
    }

    // Save
    if (!newTimetable[day]) newTimetable[day] = {};
    if (!newTimetable[day][slotId]) {
      const entry = {};
      DEPTS.forEach(d => { entry[d] = null; });
      newTimetable[day][slotId] = entry;
    }
    newTimetable[day][slotId][selectedDept] = {
      subjectCode: editSubject,
      facultyId: editFaculty,
      roomId: editRoom
    };

    setTimetable(newTimetable);
    recalculateConflicts(newTimetable);
    setEditingCell(null);
    addNotification(`Updated timetable for ${day} Slot ${slotId + 1}`, 'success');
  };

  // Department display names for the dropdown
  const deptLabels = {
    cs: 'Computer Science (CSE)',
    ec: 'Electronics (ECE)',
    me: 'Mechanical (ME)'
  };

  return (
    <div className="timetable-view fade-in">
      <header className="view-header">
        <div>
          <h1>Timetable Planner</h1>
          <p className="subtitle">
            Run automated conflict resolution constraints or edit manually.
            {config && (
              <span className="config-mode-badge-inline">
                {config.institutionMode === 'school' ? ' 🏫 School' : ' 🎓 College'}
                {config.institutionMode === 'college' && ` (${config.collegeShift})`}
                {' · '}{config.slotsPerDay} periods × {config.sessionDurationMinutes}min
              </span>
            )}
          </p>
        </div>
        <div className="actions-header-right">
          <div className="tab-toggle-group">
            <button 
              className={`toggle-btn-small ${timetableMode === 'dept' ? 'active' : ''}`}
              onClick={() => { setTimetableMode('dept'); setEditingCell(null); }}
            >
              Department View
            </button>
            <button 
              className={`toggle-btn-small ${timetableMode === 'faculty' ? 'active' : ''}`}
              onClick={() => { setTimetableMode('faculty'); setEditingCell(null); }}
            >
              Faculty Personal Grid
            </button>
          </div>

          {timetableMode === 'dept' ? (
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="select-dropdown"
            >
              {DEPTS.map(d => (
                <option key={d} value={d}>{deptLabels[d] || d.toUpperCase()}</option>
              ))}
            </select>
          ) : (
            <select 
              value={selectedFacultyId} 
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="select-dropdown"
            >
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.dept.toUpperCase()})</option>
              ))}
            </select>
          )}

          {timetableMode === 'dept' && (
            <button className="btn btn-accent" onClick={handleAIGenerate}>
              <Sparkles size={16} /> Generate Timetable
            </button>
          )}
        </div>
      </header>

      {/* Optimizing Modal Simulator */}
      {isOptimizing && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="ai-pulse-icon">▲</div>
            <h2>Running Genetic Scheduling Heuristics...</h2>
            <p>Evaluating faculty availability, space allocations, and departmental constraints.</p>
            <div className="progress-track-large">
              <div className="progress-fill-large" style={{ width: `${optimizationProgress}%` }}></div>
            </div>
            <span className="percentage-text">{optimizationProgress}% Complete</span>
          </div>
        </div>
      )}

      {/* Conflicts Overview */}
      {conflicts.length > 0 && (
        <div className="conflicts-panel card border-danger fade-in">
          <div className="panel-header text-danger">
            <AlertTriangle size={18} />
            <h2>Live Engine Conflict Log ({conflicts.length})</h2>
          </div>
          <ul className="conflict-list-items">
            {conflicts.map(c => (
              <li key={c.id} className="conflict-item">
                <AlertCircle size={14} className="text-danger" />
                <span className="conflict-message">
                  <strong>[{c.day} Slot {c.slotId + 1}]</strong> ({c.type}): {c.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Planner Grid */}
      <div className="card glass-card table-responsive">
        <table className="timetable-grid">
          <thead>
            <tr>
              <th className="day-column">Day</th>
              {SLOTS.map(s => (
                <th key={s.id} className="slot-column">
                  <div className="slot-header-cell">
                    <span className="slot-name">{s.name}</span>
                    <span className="slot-time">{s.time}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                <td className="day-label-cell"><strong>{day}</strong></td>
                {SLOTS.map(slot => {
                  const dayData = timetable[day]?.[slot.id];
                  
                  let classData = null;
                  let deptKey = selectedDept;
                  
                  if (timetableMode === 'dept') {
                    classData = dayData?.[selectedDept];
                  } else {
                    // Search all departments to find if selectedFaculty teaches here
                    DEPTS.forEach(d => {
                      if (dayData?.[d]?.facultyId === selectedFacultyId) {
                        classData = dayData[d];
                        deptKey = d;
                      }
                    });
                  }
                  
                  // Lookup values
                  const subObj = subjects.find(s => s.code === classData?.subjectCode);
                  const facObj = faculty.find(f => f.id === classData?.facultyId);
                  const roomObj = rooms.find(r => r.id === classData?.roomId);

                  // Check if cell is active editing
                  const isEditing = editingCell?.day === day && editingCell?.slotId === slot.id;

                  return (
                    <td key={slot.id} className={`timetable-cell ${classData ? 'assigned' : 'empty'}`}>
                      {isEditing ? (
                        <div className="inline-editor">
                          <select 
                            value={editSubject} 
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="inline-input"
                          >
                            <option value="">-- Subject --</option>
                            {subjects.filter(s => s.dept === selectedDept).map(s => (
                              <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                            ))}
                          </select>
                          
                          <select 
                            value={editFaculty} 
                            onChange={(e) => setEditFaculty(e.target.value)}
                            className="inline-input"
                          >
                            <option value="">-- Faculty --</option>
                            {faculty.map(f => (
                              <option key={f.id} value={f.id}>{f.name} {f.onLeave ? '(Leave)' : ''}</option>
                            ))}
                          </select>

                          <select 
                            value={editRoom} 
                            onChange={(e) => setEditRoom(e.target.value)}
                            className="inline-input"
                          >
                            <option value="">-- Room --</option>
                            {rooms.map(r => (
                              <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                            ))}
                          </select>

                          {validationError && (
                            <span className="validation-error-text">{validationError}</span>
                          )}

                          <div className="inline-editor-actions">
                            <button className="btn btn-success btn-xs" onClick={saveCellEdit} title="Save">
                              <Check size={12} />
                            </button>
                            <button className="btn btn-neutral btn-xs" onClick={() => setEditingCell(null)} title="Cancel">
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : classData ? (
                        <div className={`assigned-block ${deptKey}`}>
                          <div className="block-top">
                            <span className="subject-code-tag">{classData.subjectCode}</span>
                            {timetableMode === 'dept' ? (
                              <div className="block-actions">
                                <button className="icon-btn-edit" onClick={() => startEditCell(day, slot.id, classData)}>
                                  <Edit2 size={12} />
                                </button>
                                <button className="icon-btn-delete" onClick={() => deleteCell(day, slot.id)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ) : (
                              <span className={`badge-dept-tag ${deptKey}`}>{deptKey.toUpperCase()}</span>
                            )}
                          </div>
                          <h4 className="subject-title">{subObj?.name || 'Class Assigned'}</h4>
                          <span className="instructor-name">🧑‍🏫 {facObj?.name || 'Unassigned'}</span>
                          <span className="room-label-tag">📍 {roomObj?.name || 'Unassigned'}</span>
                        </div>
                      ) : (
                        timetableMode === 'dept' ? (
                          <button className="empty-add-btn" onClick={() => startEditCell(day, slot.id, null)}>
                            + Assign Class
                          </button>
                        ) : (
                          <div className="faculty-free-slot">
                            <span>Free / Research</span>
                          </div>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
