import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaStickyNote, 
  FaThumbtack, 
  FaFolder, 
  FaPlus, 
  FaSearch, 
  FaEye,
  FaDatabase,
  FaCalendarAlt,
  FaTags,
  FaExclamationTriangle
} from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import './Pages.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pinned: 0,
    usedMB: 0,
    limitMB: 1024,
    categoriesList: []
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, notesData] = await Promise.all([
        notesAPI.getStats(),
        notesAPI.getNotes({ limit: 8 })
      ]);

      setStats(statsData);
      setRecentNotes(notesData.notes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  // Function to strip HTML tags for plain text preview
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // Calculate storage percentage
  const storagePercentage = (stats.usedMB / stats.limitMB) * 100;
  const isStorageCritical = storagePercentage > 90;
  const isStorageWarning = storagePercentage > 75;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome to NotesApp!</h1>
          <p>Manage your notes efficiently and stay organized</p>
          {isStorageCritical && (
            <div className="storage-alert critical">
              <FaExclamationTriangle />
              <span>Storage almost full! {Math.round(storagePercentage)}% used - Please delete some notes.</span>
            </div>
          )}
          {isStorageWarning && !isStorageCritical && (
            <div className="storage-alert warning">
              <FaExclamationTriangle />
              <span>Storage getting full! {Math.round(storagePercentage)}% used</span>
            </div>
          )}
        </div>
        <div className="quick-create">
          <Link to="/notes/create" className="btn btn-primary btn-large">
            <FaPlus className="btn-icon" />
            New Note
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card stat-primary">
          <div className="stat-icon-wrapper">
            <FaStickyNote className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Notes</h3>
            <div className="stat-number">{stats.total}</div>
            <p className="stat-description">All your notes in one place</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon-wrapper">
            <FaThumbtack className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Pinned Notes</h3>
            <div className="stat-number">{stats.pinned}</div>
            <p className="stat-description">Important notes</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon-wrapper">
            <FaFolder className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Categories</h3>
            <div className="stat-number">{stats.categoriesList?.length || 0}</div>
            <p className="stat-description">Organized by category</p>
          </div>
        </div>

        <div className={`stat-card stat-info ${isStorageCritical ? 'stat-critical' : isStorageWarning ? 'stat-warning' : ''}`}>
          <div className="stat-icon-wrapper">
            <FaDatabase className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Storage Used</h3>
            <div className="stat-number">{stats.usedMB.toFixed(2)}MB</div>
            <div className="storage-progress">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${
                    isStorageCritical ? 'progress-danger' : 
                    isStorageWarning ? 'progress-warning' : ''
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
              <span className="storage-text">
                {stats.usedMB.toFixed(2)}MB of {stats.limitMB}MB ({Math.round(storagePercentage)}%)
                {isStorageCritical && (
                  <span className="storage-warning"> - Almost full!</span>
                )}
                {isStorageWarning && !isStorageCritical && (
                  <span className="storage-warning"> - Getting full</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-section quick-actions-section">
          <div className="section-header">
            <div className="section-title-content">
              <FaPlus className="section-icon" />
              <div className="section-text">
                <h2>Quick Actions</h2>
                <p className="section-subtitle">Quick access to frequently used features</p>
              </div>
            </div>
          </div>
          <div className="quick-actions-grid">
            <Link to="/notes/create" className="quick-action primary">
              <div className="action-icon">
                <FaPlus />
              </div>
              <div className="action-content">
                <h4>New Note</h4>
                <p>Create a new note</p>
              </div>
            </Link>
            
            <Link to="/pinned" className="quick-action warning">
              <div className="action-icon">
                <FaThumbtack />
              </div>
              <div className="action-content">
                <h4>Pinned Notes</h4>
                <p>View pinned notes</p>
              </div>
            </Link>
            
            <Link to="/categories" className="quick-action success">
              <div className="action-icon">
                <FaFolder />
              </div>
              <div className="action-content">
                <h4>Categories</h4>
                <p>Browse by category</p>
              </div>
            </Link>
            
            <Link to="/search" className="quick-action info">
              <div className="action-icon">
                <FaSearch />
              </div>
              <div className="action-content">
                <h4>Search Notes</h4>
                <p>Find notes quickly</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="dashboard-section recent-notes-section">
          <div className="section-header">
            <div className="section-title-content">
              <FaCalendarAlt className="section-icon" />
              <div className="section-text">
                <h2>Recent Notes</h2>
                <div className="section-meta">
                  <span className="notes-count">{recentNotes.length} notes</span>
                </div>
              </div>
            </div>
            <Link to="/notes" className="view-all-btn">
              View All
            </Link>
          </div>
          
          <div className="recent-notes-grid">
            {recentNotes.length === 0 ? (
              <div className="empty-recent-notes">
                <div className="empty-icon-wrapper">
                  <FaStickyNote className="empty-icon" />
                </div>
                <h3>No recent notes</h3>
                <p>Create your first note to get started!</p>
                <Link to="/notes/create" className="btn btn-primary">
                  Create Note
                </Link>
              </div>
            ) : (
              recentNotes.map(note => (
                <div 
                  key={note._id} 
                  className={`recent-note-card ${note.pinned ? 'pinned' : ''}`}
                  onClick={() => handleViewNote(note._id)}
                >
                  <div className="note-header">
                    <div className="note-title-section">
                      <h3 className="note-title">{note.title}</h3>
                      {note.pinned && (
                        <span className="pinned-indicator" title="Pinned">
                          <FaThumbtack />
                        </span>
                      )}
                    </div>
                    <button 
                      className="icon-btn small view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewNote(note._id);
                      }}
                      title="View note"
                    >
                      <FaEye />
                    </button>
                  </div>
                  
                  <div className="note-content-preview">
                    {stripHtml(note.content || '').substring(0, 120)}
                    {stripHtml(note.content || '').length > 120 && '...'}
                  </div>
                  
                  <div className="note-meta">
                    <span className="note-category-badge">
                      <FaFolder className="category-icon" />
                      {note.category}
                    </span>
                    <div className="note-tags">
                      {note.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">
                          <FaTags className="tag-icon" />
                          {tag}
                        </span>
                      ))}
                      {note.tags && note.tags.length > 2 && (
                        <span className="more-tags">+{note.tags.length - 2}</span>
                      )}
                    </div>
                    <span className="note-date">
                      <FaCalendarAlt className="date-icon" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;