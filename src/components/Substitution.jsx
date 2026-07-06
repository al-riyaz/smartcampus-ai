import React from 'react';
import { UserCheck, HelpCircle, Check, AlertCircle, AlertTriangle } from 'lucide-react';

export default function Substitution({ 
  timetable, 
  setTimetable, 
  faculty, 
  setFaculty, 
  subjects, 
  rooms, 
  addNotification,
  recalculateConflicts,
  config
}) {
  
  // Find classes taught by faculty who are currently on leave
  const leaves = faculty.filter(f => f.onLeave);
  const classesToSubstitute = [];
  const absentFacultyWithNoClasses = [];

  // Department list from config or fallback
  const depts = (config?.departments && config.departments.length > 0)
    ? config.departments.map(d => d.id)
    : ['cs', 'ec', 'me'];

  leaves.forEach(absentFaculty => {
    let hasClasses = false;
    Object.entries(timetable).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([slotId, classes]) => {
        if (!classes) return;
        depts.forEach(dept => {
          const assign = classes[dept];
          if (assign && assign.facultyId === absentFaculty.id) {
            hasClasses = true;
            classesToSubstitute.push({
              day,
              slotId: parseInt(slotId),
              dept,
              subjectCode: assign.subjectCode,
              roomId: assign.roomId,
              absenteeFaculty: absentFaculty
            });
          }
        });
      });
    });
    if (!hasClasses) {
      absentFacultyWithNoClasses.push(absentFaculty);
    }
  });

  const handleSimulateLeaves = () => {
    // 1. Mark Dr. Amit Sharma on leave
    setFaculty(prev => prev.map(f => {
      if (f.id === 'fac-1') {
        return { ...f, onLeave: true };
      }
      return f;
    }));

    // 2. Restore default assignments for Dr. Amit Sharma in timetable
    const newTimetable = JSON.parse(JSON.stringify(timetable));
    newTimetable['Monday'][0].cs = { subjectCode: 'CS-301', facultyId: 'fac-1', roomId: 'room-101' };
    newTimetable['Wednesday'][0].cs = { subjectCode: 'CS-304', facultyId: 'fac-1', roomId: 'room-101' };
    
    setTimetable(newTimetable);
    if (recalculateConflicts) recalculateConflicts(newTimetable);
    addNotification('Simulated active leave and restored lecture slots for Dr. Amit Sharma.', 'warning');
  };

  // Calculate recommendation candidates for a slot
  const getSubstitutes = (day, slotId, subjectCode, dept) => {
    const targetSubject = subjects.find(s => s.code === subjectCode);
    // Use configurable factor weights
    const weights = config?.factorWeights || { expertise: 40, availability: 40, workload: 20 };
    const candidates = faculty
      .filter(f => !f.onLeave && f.id !== 'unassigned') // Available faculty
      .map(fac => {
        let score = 0;
        const reasons = [];

        // 1. Expertise Match
        const teachesSubject = fac.subjects.includes(subjectCode);
        const teachesDept = fac.dept === dept;
        if (teachesSubject) {
          score += weights.expertise;
          reasons.push(`Expertise: Matches subject specialty (+${weights.expertise}%)`);
        } else if (teachesDept) {
          score += Math.round(weights.expertise / 2);
          reasons.push(`Expertise: Department match (+${Math.round(weights.expertise / 2)}%)`);
        } else {
          reasons.push('Expertise: No subject/dept overlap (+0%)');
        }

        // 2. Availability Match
        // Check if available in availability matrix
        const isFreeInAvailability = fac.availability[day]?.[slotId] !== false;
        // Check if already teaching in this slot
        let isAlreadyTeaching = false;
        const slotClasses = timetable[day]?.[slotId];
        if (slotClasses) {
          ['cs', 'ec', 'me'].forEach(d => {
            if (slotClasses[d]?.facultyId === fac.id) {
              isAlreadyTeaching = true;
            }
          });
        }

        if (isFreeInAvailability && !isAlreadyTeaching) {
          score += weights.availability;
          reasons.push(`Availability: Free in requested slot (+${weights.availability}%)`);
        } else if (!isFreeInAvailability && !isAlreadyTeaching) {
          score += Math.round(weights.availability * 0.375);
          reasons.push(`Availability: Preference conflict but slot free (+${Math.round(weights.availability * 0.375)}%)`);
        } else {
          reasons.push('Availability: Already scheduled to teach (+0%)');
        }

        // 3. Workload Match
        const currentWorkload = fac.currentHours;
        const maxWorkload = fac.maxHours;
        const remainingCapacity = maxWorkload - currentWorkload;
        if (remainingCapacity >= 3) {
          score += weights.workload;
          reasons.push(`Workload: Ample weekly hours available (+${weights.workload}%)`);
        } else if (remainingCapacity > 0) {
          score += Math.round(weights.workload / 2);
          reasons.push(`Workload: Near threshold limit (+${Math.round(weights.workload / 2)}%)`);
        } else {
          reasons.push('Workload: At maximum weekly hours (+0%)');
        }

        return {
          faculty: fac,
          score,
          reasons,
          isAvailable: !isAlreadyTeaching
        };
      })
      .filter(c => c.isAvailable)
      .sort((a, b) => b.score - a.score);

    return candidates;
  };

  const handleAssignSubstitute = (day, slotId, dept, substituteId, originalId) => {
    // 1. Update timetable with new faculty ID
    const newTimetable = JSON.parse(JSON.stringify(timetable));
    newTimetable[day][slotId][dept].facultyId = substituteId;
    setTimetable(newTimetable);

    // 2. Adjust workloads
    setFaculty(prev => prev.map(f => {
      if (f.id === substituteId) {
        return { ...f, currentHours: f.currentHours + 1.5 };
      }
      if (f.id === originalId) {
        return { ...f, currentHours: Math.max(0, f.currentHours - 1.5) };
      }
      return f;
    }));

    // 3. Recheck conflicts
    if (recalculateConflicts) recalculateConflicts(newTimetable);

    const subName = faculty.find(f => f.id === substituteId)?.name;
    const origName = faculty.find(f => f.id === originalId)?.name;
    addNotification(`Assigned ${subName} as substitute for ${origName} on ${day} Slot ${slotId + 1}`, 'success');
  };

  return (
    <div className="substitution-view fade-in">
      <header className="view-header">
        <div>
          <h1>Teacher Substitution Engine</h1>
          <p className="subtitle">Recommend and allocate substitutes for absent teachers in real-time.</p>
        </div>
        <div className="actions-header-right">
          <button className="btn btn-neutral btn-sm" onClick={handleSimulateLeaves}>
            ⚡ Simulate Leaves & Duties
          </button>
        </div>
      </header>

      {/* Main Substitution Manager */}
      {classesToSubstitute.length === 0 ? (
        <div className="card glass-card text-center no-actions fade-in mb-4">
          <div className="success-checkmark-wrapper">✓</div>
          <h2>All Scheduled Lectures Staffed</h2>
          <p>There are no active faculty leaves or vacant lecture slots requiring substitutes in the current timetable.</p>
          <p className="hint">Tip: Click the "Simulate Leaves &amp; Duties" button to simulate absences and restore class coordinates.</p>
        </div>
      ) : (
        <div className="substitution-list-container mb-4">
          <div className="alert-ribbon info mb-4">
            <AlertCircle size={16} />
            <p>
              <strong>{classesToSubstitute.length} class slots</strong> currently require substitution assignments.
            </p>
          </div>

          {classesToSubstitute.map((item, idx) => {
            const candidates = getSubstitutes(item.day, item.slotId, item.subjectCode, item.dept);
            const bestCandidate = candidates[0];
            const roomName = rooms.find(r => r.id === item.roomId)?.name;

            return (
              <div key={`${item.day}-${item.slotId}-${item.dept}`} className="card glass-card substitution-panel-card fade-in mb-3">
                <div className="substitution-panel-header">
                  <div className="absentee-details">
                    <span className="badge-dept danger">ABSENTEE</span>
                    <h3>{item.absenteeFaculty.name}</h3>
                    <p className="faculty-role">{item.absenteeFaculty.role}</p>
                  </div>
                  
                  <div className="class-details-badge">
                    <span className="class-label">Target Class Slot</span>
                    <h4>{item.day} — Slot {item.slotId + 1}</h4>
                    <p className="subject-meta">{item.subjectCode} in {roomName}</p>
                  </div>
                </div>

                <div className="substitution-candidates-section">
                  <h4>Substitute Recommendations (Heuristics Rank)</h4>
                  
                  <div className="candidates-list">
                    {candidates.slice(0, 3).map((cand, cIdx) => (
                      <div key={cand.faculty.id} className={`candidate-row ${cIdx === 0 ? 'recommended-highlight' : ''}`}>
                        <div className="candidate-meta">
                          <img src={cand.faculty.image} alt={cand.faculty.name} className="candidate-avatar" />
                          <div className="candidate-info">
                            <div className="name-and-rank">
                              <span className="candidate-name">{cand.faculty.name}</span>
                              {cIdx === 0 && <span className="best-badge">Rank #1</span>}
                            </div>
                            <span className="candidate-dept">{cand.faculty.dept.toUpperCase()} • Workload: {cand.faculty.currentHours}h/{cand.faculty.maxHours}h</span>
                          </div>
                        </div>

                        {/* Match Progress Score */}
                        <div className="match-score-block">
                          <div className="score-details">
                            <span className="score-percentage">{cand.score}%</span>
                            <span className="score-label">Compatibility</span>
                          </div>
                          
                          {/* Hover Reasons Tooltip */}
                          <div className="reasons-tooltip">
                            <h5>Score Breakdown:</h5>
                            <ul>
                              {cand.reasons.map((r, rIdx) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <button 
                          className={`btn ${cIdx === 0 ? 'btn-accent' : 'btn-neutral'} btn-sm`}
                          onClick={() => handleAssignSubstitute(item.day, item.slotId, item.dept, cand.faculty.id, item.absenteeFaculty.id)}
                        >
                          <UserCheck size={14} /> Assign Duty
                        </button>
                      </div>
                    ))}

                    {candidates.length === 0 && (
                      <div className="no-candidates-msg">
                        <AlertTriangle size={14} /> No free faculty found for this slot. Clear existing assignments or adjust schedule.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Absent Staff with No Classes Section */}
      {absentFacultyWithNoClasses.length > 0 && (
        <div className="card glass-card absent-no-class-card fade-in">
          <div className="setup-card-header">
            <h2>Absent Faculty (No Scheduled Duties)</h2>
            <p className="subtitle">These teachers are marked "On Leave" in the setup roster, but do not have active lectures scheduled in the timetable grid.</p>
          </div>
          <div className="absent-no-class-list mt-3">
            {absentFacultyWithNoClasses.map(f => (
              <div key={f.id} className="absent-no-class-item mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="absent-no-class-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={f.image} alt={f.name} className="candidate-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="absent-no-class-details">
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-title)' }}>{f.name}</h4>
                    <span className="faculty-role" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.role} • <span className={`badge-dept-tag ${f.dept}`}>{f.dept.toUpperCase()}</span></span>
                  </div>
                </div>
                <div className="absent-no-class-status-badge" style={{ textAlign: 'right' }}>
                  <span className="status-badge inactive" style={{ display: 'inline-block', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>On Leave</span>
                  <span className="status-subtext" style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>No timetable conflicts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
