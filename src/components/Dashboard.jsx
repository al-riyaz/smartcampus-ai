import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  DoorOpen, 
  Zap, 
  Calendar, 
  UserX,
  Percent
} from 'lucide-react';

export default function Dashboard({ 
  faculty, 
  timetable, 
  onLeaveCount, 
  conflicts, 
  seatingUtilization, 
  setActiveTab,
  resolveConflictsAutomatically,
  config 
}) {
  
  const leavesCount = faculty.filter(f => f.onLeave).length;
  const activeConflictsCount = conflicts.length;

  // Room usage estimation based on current slot assignments
  let assignedRooms = 0;
  let totalSlotsFilled = 0;
  Object.values(timetable).forEach(dayGrid => {
    Object.values(dayGrid).forEach(classes => {
      if (classes) {
        ['cs', 'ec', 'me'].forEach(c => {
          if (classes[c]) {
            totalSlotsFilled++;
            if (classes[c].roomId) assignedRooms++;
          }
        });
      }
    });
  });

  // Calculate dynamic stats for SVG Charts
  const deptHours = { cs: 0, ec: 0, me: 0 };
  faculty.forEach(f => {
    if (!f.onLeave) {
      deptHours[f.dept] += f.currentHours;
    }
  });
  
  // Total possible slots: dynamic from config
  const numDays = config?.workingDays?.length || 5;
  const numSlots = config?.slotsPerDay || 4;
  const numDepts = 3; // departments remain fixed for now
  const totalPossibleSlots = numDays * numSlots * numDepts;
  const roomOccupancyPct = totalPossibleSlots > 0 ? Math.round((totalSlotsFilled / totalPossibleSlots) * 100) : 0;
  
  const maxDeptHours = Math.max(deptHours.cs, deptHours.ec, deptHours.me, 1);
  const csBarWidth = Math.round((deptHours.cs / maxDeptHours) * 280);
  const ecBarWidth = Math.round((deptHours.ec / maxDeptHours) * 280);
  const meBarWidth = Math.round((deptHours.me / maxDeptHours) * 280);
  
  const radialUtilPct = seatingUtilization > 0 ? seatingUtilization : roomOccupancyPct;
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.8
  const dashOffset = circumference - (radialUtilPct / 100) * circumference;

  return (
    <div className="dashboard-view fade-in">
      <header className="view-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">
            Real-time status of AIGENXT SmartCampus scheduling engines.
            {config && (
              <span className="config-mode-badge-inline">
                {' · '}{config.institutionMode === 'school' ? '🏫 School' : '🎓 College'}
                {config.institutionMode === 'college' && ` (${config.collegeShift})`}
              </span>
            )}
          </p>
        </div>
        <div className="header-status">
          <span className="pulse-dot"></span>
          <span>Engine: Active</span>
        </div>
      </header>

      {/* Grid of Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card border-accent">
          <div className="stat-header">
            <span className="stat-title">Conflicts Resolved</span>
            <CheckCircle className="stat-icon text-success" />
          </div>
          <div className="stat-value">{activeConflictsCount === 0 ? 'Zero' : activeConflictsCount}</div>
          <p className="stat-footer text-success">
            {activeConflictsCount === 0 ? '✓ Timetable fully optimized' : `⚠ ${activeConflictsCount} conflicts detected`}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Seating Utilization</span>
            <Percent className="stat-icon text-info" />
          </div>
          <div className="stat-value">{seatingUtilization}%</div>
          <p className="stat-footer text-info">Target exceeded (&gt;95% optimization)</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Leaves</span>
            <UserX className="stat-icon text-warning" />
          </div>
          <div className="stat-value">{leavesCount}</div>
          <p className="stat-footer text-warning">
            {leavesCount > 0 ? `${leavesCount} substitutions pending approval` : 'All slots fully staffed'}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Room Occupancy</span>
            <DoorOpen className="stat-icon text-primary" />
          </div>
          <div className="stat-value">{roomOccupancyPct}%</div>
          <p className="stat-footer text-primary">{assignedRooms} rooms scheduled</p>
        </div>
      </section>

      {/* Conflicts warning ribbon */}
      {activeConflictsCount > 0 && (
        <div className="alert-ribbon warning fade-in">
          <div className="alert-content">
            <AlertTriangle className="alert-icon" />
            <div>
              <h3>Schedule Conflicts Detected ({activeConflictsCount})</h3>
              <p>Manual edits or teacher absences have introduced structural overlaps. Please check the planner.</p>
            </div>
          </div>
          <button className="btn btn-warning" onClick={resolveConflictsAutomatically}>
            <Zap size={16} /> Auto-Resolve
          </button>
        </div>
      )}

      {/* Visual Analytics Hub */}
      <section className="analytics-section card glass-card mb-4 fade-in">
        <div className="setup-card-header">
          <h2>Departmental Heuristics & Utilization Analytics</h2>
          <p className="subtitle">Real-time load balancing and room occupancy curves generated by the scheduler.</p>
        </div>
        <div className="analytics-charts-container">
          {/* SVG Bar Chart: Faculty Hours by Department */}
          <div className="chart-wrapper">
            <h3>Scheduled Weekly Hours by Department</h3>
            <div className="svg-chart-container">
              <svg viewBox="0 0 400 180" className="svg-bar-chart">
                <line x1="60" y1="20" x2="360" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="60" y1="70" x2="360" y2="70" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="60" y1="120" x2="360" y2="120" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="60" y1="160" x2="360" y2="160" stroke="var(--border-color)" />

                {/* CS Bar */}
                <g className="chart-bar-group cs">
                  <rect x="60" y="35" width={csBarWidth} height="20" rx="6" fill="url(#cs-gradient)" className="chart-rect" />
                  <text x="370" y="50" className="chart-val-text">{deptHours.cs}h</text>
                  <text x="15" y="50" className="chart-label-text">CSE</text>
                </g>

                {/* EC Bar */}
                <g className="chart-bar-group ec">
                  <rect x="60" y="85" width={ecBarWidth} height="20" rx="6" fill="url(#ec-gradient)" className="chart-rect" />
                  <text x="370" y="100" className="chart-val-text">{deptHours.ec}h</text>
                  <text x="15" y="100" className="chart-label-text">ECE</text>
                </g>

                {/* ME Bar */}
                <g className="chart-bar-group me">
                  <rect x="60" y="135" width={meBarWidth} height="20" rx="6" fill="url(#me-gradient)" className="chart-rect" />
                  <text x="370" y="150" className="chart-val-text">{deptHours.me}h</text>
                  <text x="15" y="150" className="chart-label-text">ME</text>
                </g>

                <defs>
                  <linearGradient id="cs-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <linearGradient id="ec-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="me-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* SVG Donut / Radial Chart: Room Occupancy Distribution */}
          <div className="chart-wrapper radial">
            <h3>Overall Campus Utilization Rate</h3>
            <div className="svg-chart-container radial">
              <svg viewBox="0 0 200 200" className="svg-radial-chart">
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="var(--border-color)" strokeWidth="12" />
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="url(#radial-gradient)" strokeWidth="12" 
                  strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="radial-circle-fill" />
                <defs>
                  <linearGradient id="radial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <text x="100" y="105" textAnchor="middle" className="radial-percentage-text">{radialUtilPct}%</text>
                <text x="100" y="125" textAnchor="middle" className="radial-caption-text">Optimal Allocation</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Lower grid content */}
      <div className="dashboard-content-split">
        {/* Left Side: Faculty Workload Analytics */}
        <div className="card glass-card workload-analytics">
          <div className="card-header">
            <h2>Faculty Workload Distribution</h2>
            <span className="badge">Max Limit: 18h/wk</span>
          </div>
          <div className="workload-list">
            {faculty.map(f => {
              const pct = Math.min(100, Math.round((f.currentHours / f.maxHours) * 100));
              let statusClass = 'progress-bar-success';
              if (pct > 85) statusClass = 'progress-bar-danger';
              else if (pct > 65) statusClass = 'progress-bar-warning';

              return (
                <div key={f.id} className="workload-item">
                  <div className="workload-info">
                    <div className="faculty-meta">
                      <img src={f.image} alt={f.name} className="faculty-thumb" />
                      <div>
                        <span className="faculty-name-bold">{f.name}</span>
                        <span className="faculty-dept-code">{f.dept.toUpperCase()} ({f.role})</span>
                      </div>
                    </div>
                    <span className="hours-label">
                      <strong>{f.currentHours}h</strong> / {f.maxHours}h max
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${statusClass}`} 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick Action Hub */}
        <div className="quick-actions-card">
          <div className="card glass-card">
            <h2>Smart Operations Hub</h2>
            <p className="card-description">Trigger scheduling heuristic algorithms directly in the browser.</p>
            
            <div className="action-buttons-vertical">
              <button className="action-btn-item" onClick={() => setActiveTab('timetable')}>
                <div className="action-btn-icon-wrapper cs-bg">
                  <Calendar size={20} />
                </div>
                <div className="action-btn-details">
                  <h3>Timetable Optimizer</h3>
                  <p>Re-evaluate all constraints and generate conflict-free slots in &lt;1s.</p>
                </div>
              </button>

              <button className="action-btn-item" onClick={() => setActiveTab('substitution')}>
                <div className="action-btn-icon-wrapper ec-bg">
                  <Users size={20} />
                </div>
                <div className="action-btn-details">
                  <h3>Run Substitution Engine</h3>
                  <p>{leavesCount} active leaves are evaluated for substitute compatibility.</p>
                </div>
              </button>

              <button className="action-btn-item" onClick={() => setActiveTab('exams')}>
                <div className="action-btn-icon-wrapper me-bg">
                  <DoorOpen size={20} />
                </div>
                <div className="action-btn-details">
                  <h3>Seating &amp; Invigilator Setup</h3>
                  <p>Configure layouts, minimize copying risks, and maximize hall capacity.</p>
                </div>
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
