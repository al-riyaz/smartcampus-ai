import React, { useState } from 'react';
import { Users, BookOpen, DoorOpen, Plus, UserX, UserCheck, Sliders, School, GraduationCap, Sun, Moon as MoonIcon, Clock, BarChart3 } from 'lucide-react';
import {
  ALL_DAYS,
  SESSION_DURATION_OPTIONS,
  SCHOOL_DEFAULTS,
  COLLEGE_DEFAULTS,
  COLLEGE_EVENING_OVERRIDES
} from '../config';

export default function Setup({ faculty, setFaculty, subjects, setSubjects, rooms, setRooms, config, setConfig }) {
  const [setupTab, setSetupTab] = useState('faculty');

  // Form states for creation
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', dept: 'cs', role: 'Professor', subjects: '', maxHours: 16 });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: '', name: '', dept: 'cs', type: 'Lecture', hoursPerWeek: 4 });

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 60, type: 'Lecture' });

  const handleAddFaculty = (e) => {
    e.preventDefault();
    const subjectsArray = newFaculty.subjects.split(',').map(s => s.trim()).filter(Boolean);
    const added = {
      id: `fac-${Date.now()}`,
      name: newFaculty.name,
      email: newFaculty.email,
      dept: newFaculty.dept,
      role: newFaculty.role,
      subjects: subjectsArray,
      maxHours: parseInt(newFaculty.maxHours),
      currentHours: 0,
      onLeave: false,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newFaculty.name)}&background=random`,
      availability: { Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {} }
    };
    setFaculty(prev => [...prev, added]);
    setShowAddFaculty(false);
    setNewFaculty({ name: '', email: '', dept: 'cs', role: 'Professor', subjects: '', maxHours: 16 });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const added = {
      id: `sub-${Date.now()}`,
      code: newSubject.code,
      name: newSubject.name,
      dept: newSubject.dept,
      type: newSubject.type,
      hoursPerWeek: parseInt(newSubject.hoursPerWeek)
    };
    setSubjects(prev => [...prev, added]);
    setShowAddSubject(false);
    setNewSubject({ code: '', name: '', dept: 'cs', type: 'Lecture', hoursPerWeek: 4 });
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    const added = {
      id: `room-${Date.now()}`,
      name: newRoom.name,
      capacity: parseInt(newRoom.capacity),
      type: newRoom.type
    };
    setRooms(prev => [...prev, added]);
    setShowAddRoom(false);
    setNewRoom({ name: '', capacity: 60, type: 'Lecture' });
  };

  const toggleLeave = (facultyId) => {
    setFaculty(prev => prev.map(f => {
      if (f.id === facultyId) {
        return { ...f, onLeave: !f.onLeave };
      }
      return f;
    }));
  };

  // ─── Config Handlers ─────────────────────────────────────────────────
  const handleModeToggle = (mode) => {
    if (mode === 'school') {
      setConfig({ ...SCHOOL_DEFAULTS });
    } else {
      const base = { ...COLLEGE_DEFAULTS };
      if (config.collegeShift === 'evening') {
        setConfig({ ...base, ...COLLEGE_EVENING_OVERRIDES });
      } else {
        setConfig(base);
      }
    }
  };

  const handleShiftToggle = (shift) => {
    if (shift === 'evening') {
      setConfig(prev => ({ ...prev, ...COLLEGE_EVENING_OVERRIDES }));
    } else {
      setConfig(prev => ({
        ...prev,
        collegeShift: 'morning',
        startTime: COLLEGE_DEFAULTS.startTime,
        endTime: COLLEGE_DEFAULTS.endTime
      }));
    }
  };

  const handleDayToggle = (day) => {
    setConfig(prev => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b));
      // Ensure at least one day is selected
      if (days.length === 0) return prev;
      return { ...prev, workingDays: days };
    });
  };

  const handleWeightChange = (factor, value) => {
    const num = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      factorWeights: { ...prev.factorWeights, [factor]: num }
    }));
  };

  const totalWeight = config
    ? (config.factorWeights.expertise + config.factorWeights.availability + config.factorWeights.workload)
    : 100;

  return (
    <div className="setup-view fade-in">
      <header className="view-header">
        <div>
          <h1>Institution Setup</h1>
          <p className="subtitle">Configure academics, rooms, faculty schedules, and scheduling parameters.</p>
        </div>
        <div className="setup-tabs">
          <button 
            className={`tab-toggle-btn ${setupTab === 'config' ? 'active' : ''}`}
            onClick={() => setSetupTab('config')}
          >
            <Sliders size={16} /> Configuration
          </button>
          <button 
            className={`tab-toggle-btn ${setupTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setSetupTab('faculty')}
          >
            <Users size={16} /> Faculty Staff ({faculty.length})
          </button>
          <button 
            className={`tab-toggle-btn ${setupTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setSetupTab('subjects')}
          >
            <BookOpen size={16} /> Subjects Catalog ({subjects.length})
          </button>
          <button 
            className={`tab-toggle-btn ${setupTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setSetupTab('rooms')}
          >
            <DoorOpen size={16} /> Room Inventory ({rooms.length})
          </button>
        </div>
      </header>

      {/* SETUP CONTENT */}
      <div className="setup-container">

        {/* ═══ CONFIGURATION PANEL ═══ */}
        {setupTab === 'config' && config && (
          <div className="config-panel fade-in">

            {/* ── Institution Mode Toggle ── */}
            <div className="card glass-card config-card">
              <div className="config-card-header">
                <h2>Institution Mode</h2>
                <p>Toggle between School and College mode. Each applies optimized presets.</p>
              </div>
              <div className="mode-toggle-container">
                <button
                  className={`mode-toggle-btn ${config.institutionMode === 'school' ? 'active school-active' : ''}`}
                  onClick={() => handleModeToggle('school')}
                >
                  <School size={22} />
                  <span className="mode-label">School</span>
                  <span className="mode-hint">8 periods · 45 min · Mon–Sat</span>
                </button>
                <button
                  className={`mode-toggle-btn ${config.institutionMode === 'college' ? 'active college-active' : ''}`}
                  onClick={() => handleModeToggle('college')}
                >
                  <GraduationCap size={22} />
                  <span className="mode-label">College</span>
                  <span className="mode-hint">4 sessions · 90 min · Mon–Fri</span>
                </button>
              </div>

              {/* College Shift Sub-toggle */}
              {config.institutionMode === 'college' && (
                <div className="shift-toggle-row fade-in">
                  <span className="shift-label">College Shift:</span>
                  <div className="shift-toggle-group">
                    <button
                      className={`shift-btn ${config.collegeShift === 'morning' ? 'active' : ''}`}
                      onClick={() => handleShiftToggle('morning')}
                    >
                      <Sun size={14} /> Morning
                    </button>
                    <button
                      className={`shift-btn ${config.collegeShift === 'evening' ? 'active' : ''}`}
                      onClick={() => handleShiftToggle('evening')}
                    >
                      <MoonIcon size={14} /> Evening
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Session & Timing Settings ── */}
            <div className="config-cards-grid">
              
              {/* Session Duration & Slots */}
              <div className="card glass-card config-card">
                <div className="config-card-header">
                  <Clock size={18} />
                  <h3>Session Settings</h3>
                </div>
                <div className="config-field">
                  <label>Session Duration</label>
                  <select
                    className="select-dropdown config-select"
                    value={config.sessionDurationMinutes}
                    onChange={(e) => setConfig(prev => ({ ...prev, sessionDurationMinutes: parseInt(e.target.value) }))}
                  >
                    {SESSION_DURATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="config-field">
                  <label>Periods / Slots per Day</label>
                  <div className="stepper-control">
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, slotsPerDay: Math.max(1, prev.slotsPerDay - 1) }))}>−</button>
                    <span className="stepper-value">{config.slotsPerDay}</span>
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, slotsPerDay: Math.min(12, prev.slotsPerDay + 1) }))}>+</button>
                  </div>
                </div>
                <div className="config-field">
                  <label>Short Break Between Periods</label>
                  <div className="stepper-control">
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, shortBreakMinutes: Math.max(0, prev.shortBreakMinutes - 5) }))}>−</button>
                    <span className="stepper-value">{config.shortBreakMinutes} min</span>
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, shortBreakMinutes: Math.min(30, prev.shortBreakMinutes + 5) }))}>+</button>
                  </div>
                </div>
                <div className="config-field">
                  <label>Long Break (Lunch) Duration</label>
                  <div className="stepper-control">
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, breakDurationMinutes: Math.max(15, prev.breakDurationMinutes - 5) }))}>−</button>
                    <span className="stepper-value">{config.breakDurationMinutes} min</span>
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, breakDurationMinutes: Math.min(120, prev.breakDurationMinutes + 5) }))}>+</button>
                  </div>
                </div>
                <div className="config-field">
                  <label>Lunch Break After Period #</label>
                  <div className="stepper-control">
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, breakAfterSlot: Math.max(1, prev.breakAfterSlot - 1) }))}>−</button>
                    <span className="stepper-value">{config.breakAfterSlot}</span>
                    <button className="stepper-btn" onClick={() => setConfig(prev => ({ ...prev, breakAfterSlot: Math.min(prev.slotsPerDay, prev.breakAfterSlot + 1) }))}>+</button>
                  </div>
                </div>
              </div>

              {/* Schedule Timing */}
              <div className="card glass-card config-card">
                <div className="config-card-header">
                  <Sun size={18} />
                  <h3>Schedule Timing</h3>
                </div>
                <div className="config-field">
                  <label>Start Time</label>
                  <input
                    type="time"
                    className="config-time-input"
                    value={config.startTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="config-field">
                  <label>End Time (Reference)</label>
                  <input
                    type="time"
                    className="config-time-input"
                    value={config.endTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <div className="config-field">
                  <label>Working Days</label>
                  <div className="days-checkbox-grid">
                    {ALL_DAYS.map(day => (
                      <label key={day} className={`day-checkbox ${config.workingDays.includes(day) ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={config.workingDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                        />
                        <span>{day.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Room & Capacity + Factor Weights ── */}
            <div className="config-cards-grid">

              {/* Room Vacancy */}
              <div className="card glass-card config-card">
                <div className="config-card-header">
                  <DoorOpen size={18} />
                  <h3>Room & Capacity</h3>
                </div>
                <div className="config-field">
                  <label>Room Occupancy Target</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={config.roomVacancyTarget}
                      className="config-slider"
                      onChange={(e) => setConfig(prev => ({ ...prev, roomVacancyTarget: parseInt(e.target.value) }))}
                    />
                    <div className="slider-labels">
                      <span>50%</span>
                      <span className="slider-current-value">{config.roomVacancyTarget}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="config-hint">Target fill-rate for exam seating optimization.</p>
                </div>
                <div className="config-field">
                  <label>Max Students Per Room Override</label>
                  <div className="stepper-control">
                    <button className="stepper-btn" onClick={() => setConfig(prev => {
                      const current = prev.maxStudentsPerRoomOverride || 60;
                      return { ...prev, maxStudentsPerRoomOverride: Math.max(10, current - 5) };
                    })}>−</button>
                    <span className="stepper-value">{config.maxStudentsPerRoomOverride || 'Auto'}</span>
                    <button className="stepper-btn" onClick={() => setConfig(prev => {
                      const current = prev.maxStudentsPerRoomOverride || 55;
                      return { ...prev, maxStudentsPerRoomOverride: Math.min(200, current + 5) };
                    })}>+</button>
                  </div>
                  <p className="config-hint">"Auto" uses each room's individual capacity.</p>
                </div>
              </div>

              {/* Factor Weights */}
              <div className="card glass-card config-card">
                <div className="config-card-header">
                  <BarChart3 size={18} />
                  <h3>Substitution Factor Weights</h3>
                </div>
                <p className="config-hint mb-3">Adjust how the system scores substitute candidates. Weights should sum to 100%.</p>
                
                <div className="factor-weight-item">
                  <div className="factor-label-row">
                    <span className="factor-name">Expertise Match</span>
                    <span className="factor-value">{config.factorWeights.expertise}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.factorWeights.expertise}
                    className="config-slider factor-slider expertise"
                    onChange={(e) => handleWeightChange('expertise', e.target.value)}
                  />
                </div>

                <div className="factor-weight-item">
                  <div className="factor-label-row">
                    <span className="factor-name">Availability Match</span>
                    <span className="factor-value">{config.factorWeights.availability}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.factorWeights.availability}
                    className="config-slider factor-slider availability"
                    onChange={(e) => handleWeightChange('availability', e.target.value)}
                  />
                </div>

                <div className="factor-weight-item">
                  <div className="factor-label-row">
                    <span className="factor-name">Workload Balance</span>
                    <span className="factor-value">{config.factorWeights.workload}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.factorWeights.workload}
                    className="config-slider factor-slider workload"
                    onChange={(e) => handleWeightChange('workload', e.target.value)}
                  />
                </div>

                <div className={`factor-total-row ${totalWeight !== 100 ? 'warning' : 'ok'}`}>
                  <span>Total Weight:</span>
                  <span className="total-value">{totalWeight}%</span>
                  {totalWeight !== 100 && <span className="total-warning">⚠ Should sum to 100%</span>}
                </div>
              </div>
            </div>

            {/* ── Live Preview Strip ── */}
            <div className="card glass-card config-preview-card">
              <div className="config-card-header">
                <h3>📋 Configuration Preview</h3>
              </div>
              <div className="preview-chips-row">
                <div className="preview-chip">
                  <span className="chip-label">Mode</span>
                  <span className="chip-value">{config.institutionMode === 'school' ? '🏫 School' : '🎓 College'}</span>
                </div>
                {config.institutionMode === 'college' && (
                  <div className="preview-chip">
                    <span className="chip-label">Shift</span>
                    <span className="chip-value">{config.collegeShift === 'morning' ? '☀️ Morning' : '🌙 Evening'}</span>
                  </div>
                )}
                <div className="preview-chip">
                  <span className="chip-label">Periods</span>
                  <span className="chip-value">{config.slotsPerDay} × {config.sessionDurationMinutes}min</span>
                </div>
                <div className="preview-chip">
                  <span className="chip-label">Hours</span>
                  <span className="chip-value">{config.startTime} — {config.endTime}</span>
                </div>
                <div className="preview-chip">
                  <span className="chip-label">Days</span>
                  <span className="chip-value">{config.workingDays.map(d => d.substring(0, 3)).join(', ')}</span>
                </div>
                <div className="preview-chip">
                  <span className="chip-label">Room Target</span>
                  <span className="chip-value">{config.roomVacancyTarget}%</span>
                </div>
              </div>
            </div>

          </div>
        )}
        
        {/* FACULTY SECTION */}
        {setupTab === 'faculty' && (
          <div className="card glass-card fade-in">
            <div className="setup-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>Faculty Roster & Leave Management</h2>
                  <p>Set teaching thresholds and toggle leave to trigger real-time substitution recommendations.</p>
                </div>
                <button className="btn btn-accent" onClick={() => setShowAddFaculty(!showAddFaculty)}>
                  {showAddFaculty ? 'Cancel' : <><Plus size={16} /> Add Faculty</>}
                </button>
              </div>
            </div>

            {showAddFaculty && (
              <form className="inline-add-form card mb-4" onSubmit={handleAddFaculty} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Add New Faculty</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <input className="inline-input" type="text" placeholder="Full Name" required value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} />
                  <input className="inline-input" type="email" placeholder="Email Address" required value={newFaculty.email} onChange={e => setNewFaculty({...newFaculty, email: e.target.value})} />
                  <select className="inline-input" value={newFaculty.dept} onChange={e => setNewFaculty({...newFaculty, dept: e.target.value})}>
                    <option value="cs">Computer Science (CSE)</option>
                    <option value="ec">Electronics (ECE)</option>
                    <option value="me">Mechanical (ME)</option>
                  </select>
                  <input className="inline-input" type="text" placeholder="Role (e.g., Professor)" required value={newFaculty.role} onChange={e => setNewFaculty({...newFaculty, role: e.target.value})} />
                  <input className="inline-input" type="text" placeholder="Subjects (comma separated codes, e.g., CS501, CS502)" required value={newFaculty.subjects} onChange={e => setNewFaculty({...newFaculty, subjects: e.target.value})} />
                  <input className="inline-input" type="number" placeholder="Max Weekly Hours" min="1" max="40" required value={newFaculty.maxHours} onChange={e => setNewFaculty({...newFaculty, maxHours: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-success">Save Faculty</button>
              </form>
            )}
            
            <div className="table-responsive">
              <table className="setup-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Subjects Expertise</th>
                    <th>Workload Limit</th>
                    <th>Status</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(f => (
                    <tr key={f.id} className={f.onLeave ? 'row-on-leave' : ''}>
                      <td>
                        <div className="faculty-cell">
                          <img src={f.image} alt={f.name} className="table-avatar" />
                          <div className="faculty-meta-text">
                            <span className="faculty-bold-name">{f.name}</span>
                            <span className="faculty-subtext">{f.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge-dept ${f.dept}`}>{f.dept.toUpperCase()}</span></td>
                      <td>{f.role}</td>
                      <td>
                        <div className="tags-container">
                          {f.subjects.map(sub => (
                            <span key={sub} className="tag-subject">{sub}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="workload-stat">
                          <strong>{f.currentHours}h</strong> / {f.maxHours}h max
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${f.onLeave ? 'inactive' : 'active'}`}>
                          {f.onLeave ? 'On Leave' : 'Active'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className={`btn ${f.onLeave ? 'btn-success' : 'btn-danger'} btn-sm`}
                          onClick={() => toggleLeave(f.id)}
                        >
                          {f.onLeave ? (
                            <>
                              <UserCheck size={14} /> Resume Duty
                            </>
                          ) : (
                            <>
                              <UserX size={14} /> Mark Leave
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBJECTS SECTION */}
        {setupTab === 'subjects' && (
          <div className="card glass-card fade-in">
            <div className="setup-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>Academic Subjects Catalog</h2>
                  <p>Standardized curriculum subjects with credit hours and session type limits.</p>
                </div>
                <button className="btn btn-accent" onClick={() => setShowAddSubject(!showAddSubject)}>
                  {showAddSubject ? 'Cancel' : <><Plus size={16} /> Add Subject</>}
                </button>
              </div>
            </div>

            {showAddSubject && (
              <form className="inline-add-form card mb-4" onSubmit={handleAddSubject} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Add New Subject</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <input className="inline-input" type="text" placeholder="Course Code (e.g., CS505)" required value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} />
                  <input className="inline-input" type="text" placeholder="Subject Name" required value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                  <select className="inline-input" value={newSubject.dept} onChange={e => setNewSubject({...newSubject, dept: e.target.value})}>
                    <option value="cs">Computer Science (CSE)</option>
                    <option value="ec">Electronics (ECE)</option>
                    <option value="me">Mechanical (ME)</option>
                  </select>
                  <select className="inline-input" value={newSubject.type} onChange={e => setNewSubject({...newSubject, type: e.target.value})}>
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>
                  <input className="inline-input" type="number" placeholder="Hours Per Week" min="1" max="10" required value={newSubject.hoursPerWeek} onChange={e => setNewSubject({...newSubject, hoursPerWeek: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-success">Save Subject</button>
              </form>
            )}
            
            <div className="table-responsive">
              <table className="setup-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Name</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Hours Per Week</th>
                    <th>Target Class</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(s => (
                    <tr key={s.id}>
                      <td><strong className="code-font">{s.code}</strong></td>
                      <td>{s.name}</td>
                      <td><span className={`badge-dept ${s.dept}`}>{s.dept.toUpperCase()}</span></td>
                      <td>
                        <span className={`tag-type ${s.type.toLowerCase()}`}>{s.type}</span>
                      </td>
                      <td>{s.hoursPerWeek} Hours</td>
                      <td>S5 CSE / ECE / ME</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROOMS SECTION */}
        {setupTab === 'rooms' && (
          <div className="card glass-card fade-in">
            <div className="setup-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2>Smart Classroom & Laboratory Inventory</h2>
                  <p>Verify seating capacities, ventilation properties, and specialization filters.</p>
                </div>
                <button className="btn btn-accent" onClick={() => setShowAddRoom(!showAddRoom)}>
                  {showAddRoom ? 'Cancel' : <><Plus size={16} /> Add Room</>}
                </button>
              </div>
            </div>

            {showAddRoom && (
              <form className="inline-add-form card mb-4" onSubmit={handleAddRoom} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Add New Room</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <input className="inline-input" type="text" placeholder="Room Name (e.g., Room 105)" required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
                  <input className="inline-input" type="number" placeholder="Seating Capacity" min="10" max="300" required value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} />
                  <select className="inline-input" value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                    <option value="Lecture">Theoretical Lectures (Lecture)</option>
                    <option value="Lab">Practical Sessions (Lab)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success">Save Room</button>
              </form>
            )}
            
            <div className="table-responsive">
              <table className="setup-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Seating Capacity</th>
                    <th>Session Suitability</th>
                    <th>Assigned Infrastructure</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.capacity} Students</td>
                      <td>
                        <span className={`tag-type ${r.type.toLowerCase()}`}>
                          {r.type === 'Lab' ? 'Practical Sessions' : 'Theoretical Lectures'}
                        </span>
                      </td>
                      <td>
                        {r.type === 'Lab' ? 'Workstation Terminals, Power Outlets' : 'Smartboard, Acoustic Panels'}
                      </td>
                      <td>
                        <span className="status-badge active">Operational</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
