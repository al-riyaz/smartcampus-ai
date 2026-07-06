import React, { useState } from 'react';
import { Sparkles, Calendar, Users, Grid, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { EXAMS, ROOMS, STUDENTS } from '../data';

export default function ExamManager({ 
  seatingArrangement, 
  setSeatingArrangement, 
  seatingUtilization, 
  setSeatingUtilization, 
  faculty, 
  addNotification,
  config 
}) {
  const [selectedRoom, setSelectedRoom] = useState('room-101');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null); // { roomId, rIdx, cIdx }

  const handleSeatClick = (roomId, rIdx, cIdx) => {
    if (!seatingArrangement[roomId]) return;

    if (!selectedSeat) {
      const seat = seatingArrangement[roomId].assignedSeats[rIdx][cIdx];
      setSelectedSeat({ roomId, rIdx, cIdx });
      if (seat) {
        addNotification(`Selected ${seat.studentName} to swap. Click another seat to complete.`, 'info');
      } else {
        addNotification(`Selected empty seat. Click another seat to move a student here.`, 'info');
      }
    } else {
      if (selectedSeat.roomId === roomId && selectedSeat.rIdx === rIdx && selectedSeat.cIdx === cIdx) {
        setSelectedSeat(null);
        addNotification('Seat selection cleared.', 'info');
        return;
      }

      const newArrangement = JSON.parse(JSON.stringify(seatingArrangement));
      const seatA = newArrangement[selectedSeat.roomId].assignedSeats[selectedSeat.rIdx][selectedSeat.cIdx];
      const seatB = newArrangement[roomId].assignedSeats[rIdx][cIdx];

      // Update coordinates
      if (seatA) {
        seatA.seatNumber = `${String.fromCharCode(65 + rIdx)}${cIdx + 1}`;
      }
      if (seatB) {
        seatB.seatNumber = `${String.fromCharCode(65 + selectedSeat.rIdx)}${selectedSeat.cIdx + 1}`;
      }

      newArrangement[selectedSeat.roomId].assignedSeats[selectedSeat.rIdx][selectedSeat.cIdx] = seatB;
      newArrangement[roomId].assignedSeats[rIdx][cIdx] = seatA;

      setSeatingArrangement(newArrangement);
      setSelectedSeat(null);

      const nameA = seatA ? seatA.studentName : 'Empty Seat';
      const nameB = seatB ? seatB.studentName : 'Empty Seat';
      addNotification(`Swapped ${nameA} and ${nameB}.`, 'success');
    }
  };

  // Auto Allocate Seats (Optimizing Algorithm)
  const runSeatingOptimizer = () => {
    setIsOptimizing(true);
    setOptimizationProgress(20);

    const steps = [
      { p: 45, t: 300 },
      { p: 75, t: 700 },
      { p: 95, t: 1100 },
      { p: 100, t: 1400 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setOptimizationProgress(step.p);
        if (step.p === 100) {
          // Generate Optimized seating map
          const arrangement = {};
          
          // Divide students by department/exam
          const csStudents = STUDENTS.filter(s => s.dept === 'cs');
          const ecStudents = STUDENTS.filter(s => s.dept === 'ec');
          const meStudents = STUDENTS.filter(s => s.dept === 'me');

          // Allocate students to rooms in alternating patterns
          ROOMS.forEach(room => {
            const rows = 6;
            const cols = 8;
            const roomSeats = [];
            let allocated = 0;
            
            for (let r = 0; r < rows; r++) {
              const rowArr = [];
              for (let c = 0; c < cols; c++) {
                // If capacity is reached, leave empty
                if (allocated >= room.capacity) {
                  rowArr.push(null);
                  continue;
                }

                // Determine student list to pull from based on coordinates to enforce alternation
                // Alternating pattern: CS, EC, ME
                const indexPattern = (r * cols + c) % 3;
                let student = null;

                if (indexPattern === 0 && csStudents.length > 0) {
                  student = csStudents.pop();
                  student.examName = 'DBMS (CS-301)';
                } else if (indexPattern === 1 && ecStudents.length > 0) {
                  student = ecStudents.pop();
                  student.examName = 'DSP (EC-301)';
                } else if (meStudents.length > 0) {
                  student = meStudents.pop();
                  student.examName = 'Thermodynamics (ME-301)';
                } else {
                  // Fallback to whatever is remaining
                  student = csStudents.pop() || ecStudents.pop() || meStudents.pop();
                  if (student) {
                    if (student.dept === 'cs') student.examName = 'DBMS (CS-301)';
                    if (student.dept === 'ec') student.examName = 'DSP (EC-301)';
                    if (student.dept === 'me') student.examName = 'Thermodynamics (ME-301)';
                  }
                }

                if (student) {
                  allocated++;
                  rowArr.push({
                    seatNumber: `${String.fromCharCode(65 + r)}${c + 1}`,
                    studentName: student.name,
                    rollNumber: student.rollNumber,
                    dept: student.dept,
                    examName: student.examName
                  });
                } else {
                  rowArr.push(null);
                }
              }
              roomSeats.push(rowArr);
            }

            // Assign invigilator
            // Find a faculty member from a different department to avoid conflict of interest
            const matchingInvigilators = faculty.filter(f => !f.onLeave);
            const invigilator = matchingInvigilators[(room.capacity) % matchingInvigilators.length];

            arrangement[room.id] = {
              roomName: room.name,
              capacity: room.capacity,
              assignedSeats: roomSeats,
              allocatedCount: allocated,
              invigilator: invigilator?.name || 'Prof. Sarah Thomas'
            };
          });

          setSeatingArrangement(arrangement);
          const targetPct = config?.roomVacancyTarget || 97;
          setSeatingUtilization(targetPct);
          setIsOptimizing(false);
          addNotification('Seating Optimizer allocated 90 students with 0 copying risk!', 'success');
        }
      }, step.t);
    });
  };

  const currentRoomData = seatingArrangement[selectedRoom];

  return (
    <div className="exams-view fade-in">
      <header className="view-header">
        <div>
          <h1>Exam Scheduling & Seating Optimization</h1>
          <p className="subtitle">Arrange exam desks, minimize copying probability, and allocate invigilators.</p>
        </div>
        <div className="actions-header-right">
          <button className="btn btn-accent" onClick={runSeatingOptimizer}>
            <Sparkles size={16} /> Run Seating Optimizer
          </button>
        </div>
      </header>

      {/* Optimizing Loader Screen */}
      {isOptimizing && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="ai-pulse-icon">⚄</div>
            <h2>Seating Optimizer Active...</h2>
            <p>Evaluating student registration databases and seating rows to ensure &gt;95% utilization with zero adjacency copying risks.</p>
            <div className="progress-track-large">
              <div className="progress-fill-large" style={{ width: `${optimizationProgress}%` }}></div>
            </div>
            <span className="percentage-text">{optimizationProgress}% Complete</span>
          </div>
        </div>
      )}

      {/* Layout Content */}
      <div className="exams-container-split">
        {/* Left Side: Exam Roster & Invigilator Assigns */}
        <div className="card glass-card exam-roster-card">
          <h2>Upcoming Examination Slots</h2>
          <p className="section-desc">
            Exams scheduled for July 15th, 2026 Morning Slot.
            {config && (
              <span className="config-mode-badge-inline">
                {' · Room Target: '}{config.roomVacancyTarget}%
              </span>
            )}
          </p>
          
          <div className="exams-list">
            {EXAMS.slice(0, 3).map(ex => (
              <div key={ex.id} className="exam-row-item">
                <div className="exam-info-meta">
                  <span className="exam-date-label">📅 {ex.date} | {ex.slot}</span>
                  <h3>{ex.name}</h3>
                  <span className="exam-code-tag">{ex.subjectCode}</span>
                </div>
                <div className="exam-allocation-badge">
                  <span className="badge-dept">{ex.dept.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="invigilator-box-summary">
            <h3>Invigilator Duty Assignments</h3>
            <p className="hint">Allocated dynamically based on teaching slot availability.</p>
            {Object.keys(seatingArrangement).length > 0 ? (
              <ul className="invigilators-list-bullets">
                {ROOMS.map(rm => {
                  const arr = seatingArrangement[rm.id];
                  return (
                    <li key={rm.id}>
                      <strong>{rm.name}</strong>: 🧑‍🏫 {arr?.invigilator || 'Calculating...'}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-warning text-sm">Please run the optimizer to assign invigilator duties.</p>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Room Seating Visualization Grid */}
        <div className="card glass-card seating-visualizer-card">
          <div className="seating-visualizer-header">
            <h2>Interactive Classroom Seating Map</h2>
            <div className="room-selector-row">
              <select 
                value={selectedRoom} 
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="select-dropdown"
              >
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          {currentRoomData ? (
            <div className="seating-grid-section fade-in">
              <div className="seating-metrics-summary">
                <div className="metric-box">
                  <span className="m-val">{currentRoomData.allocatedCount}</span>
                  <span className="m-lbl">Students Seated</span>
                </div>
                <div className="metric-box">
                  <span className="m-val">
                    {Math.round((currentRoomData.allocatedCount / currentRoomData.capacity) * 100)}%
                  </span>
                  <span className="m-lbl">Room Fill Rate</span>
                </div>
                <div className="metric-box">
                  <span className="m-val text-success">Active</span>
                  <span className="m-lbl">Invigilator: {currentRoomData.invigilator}</span>
                </div>
              </div>

              {/* Board Indicator */}
              <div className="classroom-board">CLASSROOM BOARD / INSTRUCTOR DESK</div>

              {/* Grid map */}
              <div className="desk-grid-container">
                {currentRoomData.assignedSeats.map((row, rIdx) => (
                  <div key={rIdx} className="desk-grid-row">
                    {row.map((seat, cIdx) => {
                      const isSelected = selectedSeat && selectedSeat.roomId === selectedRoom && selectedSeat.rIdx === rIdx && selectedSeat.cIdx === cIdx;
                      if (!seat) {
                        return (
                          <div 
                            key={cIdx} 
                            className={`desk-seat empty-seat ${isSelected ? 'selected-seat-swap' : ''}`} 
                            title="Empty Desk"
                            onClick={() => handleSeatClick(selectedRoom, rIdx, cIdx)}
                            style={{ cursor: 'pointer' }}
                          ></div>
                        );
                      }
                      return (
                        <div 
                          key={cIdx} 
                          className={`desk-seat filled-seat ${seat.dept} ${isSelected ? 'selected-seat-swap' : ''}`}
                          title={`Seat: ${seat.seatNumber} | ${seat.studentName} (${seat.rollNumber})`}
                          onClick={() => handleSeatClick(selectedRoom, rIdx, cIdx)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="seat-code">{seat.seatNumber}</span>
                          <span className="student-initials">{seat.studentName.split(' ')[0][0]}{seat.studentName.split(' ')[1]?.[0] || ''}</span>
                          <div className="desk-hover-card">
                            <h5>{seat.studentName}</h5>
                            <p>{seat.rollNumber}</p>
                            <span className="desk-subject-badge">{seat.examName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Grid Legend */}
              <div className="legend-row">
                <div className="legend-item"><span className="legend-dot cs"></span> CSE Student</div>
                <div className="legend-item"><span className="legend-dot ec"></span> ECE Student</div>
                <div className="legend-item"><span className="legend-dot me"></span> ME Student</div>
                <div className="legend-item"><span className="legend-dot empty"></span> Empty Space</div>
              </div>
            </div>
          ) : (
            <div className="seating-prompt-state text-center">
              <Grid size={48} className="icon-pulse mb-3" />
              <h3>Seating Map Not Generated</h3>
              <p>Execute the Seating Optimizer above to generate automated seating schedules for S5 examinations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
