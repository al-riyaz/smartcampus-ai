import React, { useState } from 'react';
import { Search, Printer, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { STUDENTS, EXAMS } from '../data';

export default function HallTicketPortal({ seatingArrangement }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);

  // Filter students based on search
  const filteredStudents = STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find seating and schedule details for selected student
  const getExamScheduleForStudent = (student) => {
    // Look up in seating arrangements
    const schedules = [];

    // Find student exams
    const studentExams = EXAMS.filter(ex => ex.dept === student.dept);

    studentExams.forEach(ex => {
      // Find room and seat
      let assignedRoom = null;
      let assignedSeat = null;

      Object.entries(seatingArrangement).forEach(([roomId, data]) => {
        data.assignedSeats.forEach((row) => {
          row.forEach(seat => {
            if (seat && seat.rollNumber === student.rollNumber && seat.examName.includes(ex.subjectCode)) {
              assignedRoom = data.roomName;
              assignedSeat = seat.seatNumber;
            }
          });
        });
      });

      schedules.push({
        ...ex,
        room: assignedRoom,
        seat: assignedSeat
      });
    });

    return schedules;
  };

  const currentSchedule = selectedStudent ? getExamScheduleForStudent(selectedStudent) : [];

  const handlePrint = () => {
    // Open a simple window print style
    window.print();
  };

  return (
    <div className="hall-ticket-view fade-in">
      <header className="view-header print-hide">
        <div>
          <h1>Hall Ticket Portal</h1>
          <p className="subtitle">Search, preview, and print system-generated hall tickets for semester exams.</p>
        </div>
      </header>

      <div className="hall-ticket-layout-grid">
        {/* Left Side: Search Student list (print-hide) */}
        <div className="card glass-card student-search-card print-hide">
          <h2>Student Registrar Directory</h2>
          <div className="search-bar-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="students-scroll-list">
            {filteredStudents.map(student => (
              <button
                key={student.rollNumber}
                className={`student-list-item-btn ${selectedStudent?.rollNumber === student.rollNumber ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-profile-bubble">
                  {student.name.split(' ')[0][0]}{student.name.split(' ')[1]?.[0] || ''}
                </div>
                <div className="student-list-info">
                  <h4>{student.name}</h4>
                  <span>{student.rollNumber} • {student.dept.toUpperCase()} ({student.semester})</span>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-center text-warning py-4">No students matching search.</p>
            )}
          </div>
        </div>

        {/* Right Side: Printable Hall Ticket Card */}
        {selectedStudent ? (
          <div className="hall-ticket-preview-panel">
            <div className="print-actions print-hide">
              <button className="btn btn-accent" onClick={handlePrint}>
                <Printer size={16} /> Print Hall Ticket
              </button>
            </div>

            {/* Hall Ticket Document Layout */}
            <div className="hall-ticket-document">
              <div className="document-header">
                <div className="header-branding">
                  <div className="branding-logo">▲</div>
                  <div>
                    <h2>AIGENXT INSTITUTIONS</h2>
                    <p>SMARTCAMPUS EXAM CELL CONTROL</p>
                  </div>
                </div>
                <div className="header-ticket-title">
                  <h3>SEMESTER HALL TICKET</h3>
                  <span>JULY 2026 EXAMINATION CYCLE</span>
                </div>
              </div>

              <div className="document-body">
                {/* Profile Grid */}
                <div className="profile-details-grid">
                  <div className="profile-photo-box">
                    <span>STUDENT PHOTO</span>
                  </div>
                  
                  <div className="details-labels-cols">
                    <div className="detail-row">
                      <span className="lbl">Student Name:</span>
                      <span className="val">{selectedStudent.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Roll Number:</span>
                      <span className="val code-font">{selectedStudent.rollNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Academic Term:</span>
                      <span className="val">Semester 5 ({selectedStudent.semester})</span>
                    </div>
                    <div className="detail-row">
                      <span className="lbl">Department:</span>
                      <span className="val">{selectedStudent.dept === 'cs' ? 'Computer Science (CSE)' : selectedStudent.dept === 'ec' ? 'Electronics (ECE)' : 'Mechanical (ME)'}</span>
                    </div>
                  </div>

                  {/* QR code container */}
                  <div className="qr-code-box">
                    <div className="simulated-qr">
                      <div className="qr-pixel-grid"></div>
                    </div>
                    <span className="qr-caption">Scan to Verify</span>
                  </div>
                </div>

                {/* Exam Schedule Table */}
                <div className="exam-schedule-table-wrapper">
                  <h4>Academic Examination Schedule</h4>
                  <table className="doc-schedule-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Time Slot</th>
                        <th>Exam Room</th>
                        <th>Seat Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSchedule.map(sched => (
                        <tr key={sched.id}>
                          <td>{sched.date}</td>
                          <td><strong className="code-font">{sched.subjectCode}</strong></td>
                          <td>{sched.name}</td>
                          <td>{sched.slot.split(' ')[0]} (3 hrs)</td>
                          <td>
                            {sched.room ? (
                              <span className="text-success-bold">{sched.room}</span>
                            ) : (
                              <span className="text-danger-bold">Pending Setup</span>
                            )}
                          </td>
                          <td>
                            {sched.seat ? (
                              <span className="badge-seat">{sched.seat}</span>
                            ) : (
                              <span className="badge-seat-pending">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Seating optimizer warning if missing */}
                {currentSchedule.some(s => !s.seat) && (
                  <div className="document-warning-alert print-hide">
                    <AlertTriangle size={16} />
                    <p>
                      <strong>Room Allocation Pending:</strong> Seating Optimizer must be executed in the "Exam & Seating" page to output classroom seat coordinates.
                    </p>
                  </div>
                )}

                {/* Rules Footer */}
                <div className="document-rules-footer">
                  <h5>EXAMINATION GUIDELINES &amp; CODE OF CONDUCT</h5>
                  <ul>
                    <li>1. Candidates must present this Hall Ticket and their Valid Institution ID Card to enter the examination room.</li>
                    <li>2. Cell phones, smart watches, programable calculators, and loose sheets are strictly prohibited inside the room.</li>
                    <li>3. Candidates must report to their assigned desk at least 15 minutes before the start of the examination.</li>
                    <li>4. Any form of communication, copying, or malpractice will lead to immediate disqualification and disciplinary actions.</li>
                  </ul>
                </div>
              </div>

              <div className="document-footer-signatures">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <span>Student Signature</span>
                </div>
                <div className="signature-box">
                  <div className="signature-line-fac">Exam Cell</div>
                  <span>Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card glass-card text-center no-actions py-5">
            <FileText size={48} className="mb-3" />
            <h2>Select Student to Preview Ticket</h2>
            <p>Choose a student profile from the registry search index to load candidate tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
