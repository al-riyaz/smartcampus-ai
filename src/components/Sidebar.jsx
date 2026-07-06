import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Sun, 
  Moon, 
  Bell, 
  Settings 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, darkMode, setDarkMode, notificationCount, config }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'setup', label: 'Institution Setup', icon: Settings },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'substitution', label: 'Substitution', icon: UserCheck },
    { id: 'exams', label: 'Exam & Seating', icon: BookOpen },
    { id: 'halltickets', label: 'Hall Tickets', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">▲</div>
        <div className="logo-text">
          <h2>SmartCampus</h2>
          <span>PLATFORM</span>
        </div>
      </div>

      {/* Institution Mode Badge */}
      {config && (
        <div className={`sidebar-mode-badge ${config.institutionMode}`}>
          <span className="mode-badge-icon">{config.institutionMode === 'school' ? '🏫' : '🎓'}</span>
          <span className="mode-badge-text">
            {config.institutionMode === 'school' ? 'School Mode' : 'College Mode'}
            {config.institutionMode === 'college' && (
              <span className="shift-indicator"> · {config.collegeShift === 'morning' ? '☀️' : '🌙'}</span>
            )}
          </span>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.id === 'substitution' && notificationCount > 0 && (
                    <span className="badge-count">{notificationCount}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <div className="user-profile">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
            alt="User avatar"
            className="user-avatar"
          />
          <div className="user-info">
            <span className="user-name">Sarah Thomas</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
