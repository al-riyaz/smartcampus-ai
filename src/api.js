/**
 * API Helper — Centralized fetch calls to the Express backend.
 * 
 * The backend runs on port 5000. All endpoints return JSON.
 * If the backend is unreachable, functions return null so the
 * app can fall back to its local in-memory state from data.js.
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Faculty ─────────────────────────────────────────────────────────

export async function fetchFaculty() {
  try {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.warn('API unreachable: fetchFaculty — using local data');
    return null;
  }
}

export async function saveFacultyBulk(facultyArray) {
  try {
    await fetch(`${API_BASE}/faculty`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyArray)
    });
  } catch {
    console.warn('API unreachable: saveFacultyBulk');
  }
}

export async function updateFaculty(id, updates) {
  try {
    await fetch(`${API_BASE}/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch {
    console.warn('API unreachable: updateFaculty');
  }
}

// ─── Timetable ───────────────────────────────────────────────────────

export async function fetchTimetable() {
  try {
    const res = await fetch(`${API_BASE}/timetable`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.warn('API unreachable: fetchTimetable — using local data');
    return null;
  }
}

export async function saveTimetable(grid) {
  try {
    await fetch(`${API_BASE}/timetable`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grid)
    });
  } catch {
    console.warn('API unreachable: saveTimetable');
  }
}

// ─── Seating ─────────────────────────────────────────────────────────

export async function fetchSeating() {
  try {
    const res = await fetch(`${API_BASE}/seating`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.warn('API unreachable: fetchSeating — using local data');
    return null;
  }
}

export async function saveSeating(arrangement, utilization) {
  try {
    await fetch(`${API_BASE}/seating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arrangement, utilization })
    });
  } catch {
    console.warn('API unreachable: saveSeating');
  }
}
