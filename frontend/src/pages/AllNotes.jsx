import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaThumbtack, FaEye, 
  FaList, FaTh, FaTable, FaCalendar, FaImage,
  FaColumns, FaMap, FaSort
} from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import './Pages.css';

const AllNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'table', 'kanban', 'calendar'
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getNotes();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleTogglePin = async (noteId, e) => {
    e.stopPropagation();
    try {
      const updatedNote = await notesAPI.togglePin(noteId);
      setNotes(notes.map(note => 
        note._id === noteId ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to toggle pin. Please try again.');
    }
  };

  const handleEditNote = (noteId, e) => {
    e.stopPropagation();
    navigate(`/notes/edit/${noteId}`);
  };

  // Function to strip HTML tags for plain text preview
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // Sort notes based on current sort criteria
  const sortedNotes = [...notes].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'title') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Grid View (Original)
  const renderGridView = () => (
    <div className="notes-grid">
      {sortedNotes.map(note => (
        <div 
          key={note._id} 
          className={`note-card ${note.pinned ? 'pinned' : ''}`}
          onClick={() => handleViewNote(note._id)}
        >
          <div className="note-header">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-actions">
              <button 
                className={`icon-btn ${note.pinned ? 'pinned' : ''}`}
                onClick={(e) => handleTogglePin(note._id, e)}
                title={note.pinned ? 'Unpin' : 'Pin'}
              >
                <FaThumbtack />
              </button>
              <button 
                className="icon-btn"
                onClick={(e) => handleEditNote(note._id, e)}
                title="Edit"
              >
                <FaEdit />
              </button>
              <button 
                className="icon-btn view-btn"
                onClick={() => handleViewNote(note._id)}
                title="View"
              >
                <FaEye />
              </button>
              <button 
                className="icon-btn delete-btn"
                onClick={(e) => handleDeleteNote(note._id, e)}
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          </div>
          
          <div className="note-content">
            <div 
              className="note-content-preview"
              dangerouslySetInnerHTML={{
                __html: stripHtml(note.content || '').substring(0, 150) + 
                        (stripHtml(note.content || '').length > 150 ? '...' : '')
              }}
            />
          </div>
          
          <div className="note-footer">
            <span className="note-category">{note.category}</span>
            <div className="note-tags">
              {note.tags?.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
            <span className="note-date">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // List View
  const renderListView = () => (
    <div className="notes-list">
      {sortedNotes.map(note => (
        <div 
          key={note._id} 
          className={`note-list-item ${note.pinned ? 'pinned' : ''}`}
          onClick={() => handleViewNote(note._id)}
        >
          <div className="list-item-main">
            <div className="list-item-header">
              <h3 className="note-title">{note.title}</h3>
              {note.pinned && <FaThumbtack className="pinned-indicator" />}
            </div>
            <div 
              className="note-content-preview"
              dangerouslySetInnerHTML={{
                __html: stripHtml(note.content || '').substring(0, 200) + 
                        (stripHtml(note.content || '').length > 200 ? '...' : '')
              }}
            />
            <div className="list-item-meta">
              <span className="note-category">{note.category}</span>
              <div className="note-tags">
                {note.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
              <span className="note-date">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="list-item-actions">
            <button 
              className={`icon-btn ${note.pinned ? 'pinned' : ''}`}
              onClick={(e) => handleTogglePin(note._id, e)}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <FaThumbtack />
            </button>
            <button 
              className="icon-btn"
              onClick={(e) => handleEditNote(note._id, e)}
              title="Edit"
            >
              <FaEdit />
            </button>
            <button 
              className="icon-btn delete-btn"
              onClick={(e) => handleDeleteNote(note._id, e)}
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Table View
  const renderTableView = () => (
    <div className="notes-table-container">
      <table className="notes-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('title')} className="sortable">
              Title <FaSort />
            </th>
            <th onClick={() => toggleSort('category')} className="sortable">
              Category <FaSort />
            </th>
            <th>Tags</th>
            <th onClick={() => toggleSort('updatedAt')} className="sortable">
              Last Updated <FaSort />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedNotes.map(note => (
            <tr key={note._id} className={note.pinned ? 'pinned' : ''}>
              <td>
                <div className="table-title" onClick={() => handleViewNote(note._id)}>
                  {note.pinned && <FaThumbtack className="pinned-indicator" />}
                  <span className="title-text">{note.title}</span>
                </div>
              </td>
              <td>{note.category}</td>
              <td>
                <div className="table-tags">
                  {note.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                  {note.tags && note.tags.length > 2 && (
                    <span className="more-tags">+{note.tags.length - 2}</span>
                  )}
                </div>
              </td>
              <td>{new Date(note.updatedAt).toLocaleDateString()}</td>
              <td>
                <div className="table-actions">
                  <button 
                    className="icon-btn small"
                    onClick={() => handleViewNote(note._id)}
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="icon-btn small"
                    onClick={() => navigate(`/notes/edit/${note._id}`)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="icon-btn small"
                    onClick={(e) => handleTogglePin(note._id, { stopPropagation: () => {} })}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <FaThumbtack />
                  </button>
                  <button 
                    className="icon-btn small delete-btn"
                    onClick={() => handleDeleteNote(note._id, { stopPropagation: () => {} })}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Kanban View
  const renderKanbanView = () => {
    const categories = [...new Set(notes.map(note => note.category))];
    
    return (
      <div className="kanban-container">
        <div className="kanban-board">
          {categories.map(category => {
            const categoryNotes = sortedNotes.filter(note => note.category === category);
            return (
              <div key={category} className="kanban-column">
                <div className="kanban-header">
                  <h3>{category}</h3>
                  <span className="note-count">{categoryNotes.length}</span>
                </div>
                <div className="kanban-cards">
                  {categoryNotes.map(note => (
                    <div 
                      key={note._id} 
                      className={`kanban-card ${note.pinned ? 'pinned' : ''}`}
                      onClick={() => handleViewNote(note._id)}
                    >
                      <div className="kanban-card-header">
                        <h4>{note.title}</h4>
                        {note.pinned && <FaThumbtack className="pinned-indicator" />}
                      </div>
                      <div 
                        className="kanban-card-content"
                        dangerouslySetInnerHTML={{
                          __html: stripHtml(note.content || '').substring(0, 100) + 
                                  (stripHtml(note.content || '').length > 100 ? '...' : '')
                        }}
                      />
                      <div className="kanban-card-footer">
                        <div className="kanban-tags">
                          {note.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="tag">#{tag}</span>
                          ))}
                        </div>
                        <div className="kanban-actions">
                          <button 
                            className="icon-btn small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note._id, e);
                            }}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Calendar View (Simplified - shows notes by creation date)
  const renderCalendarView = () => {
    const notesByDate = sortedNotes.reduce((acc, note) => {
      const date = new Date(note.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(note);
      return acc;
    }, {});

    return (
      <div className="calendar-view">
        {Object.entries(notesByDate).map(([date, dateNotes]) => (
          <div key={date} className="calendar-day">
            <div className="calendar-date">
              <h3>{date}</h3>
              <span className="notes-count">{dateNotes.length} notes</span>
            </div>
            <div className="calendar-notes">
              {dateNotes.map(note => (
                <div 
                  key={note._id} 
                  className={`calendar-note ${note.pinned ? 'pinned' : ''}`}
                  onClick={() => handleViewNote(note._id)}
                >
                  <div className="calendar-note-content">
                    <h4>{note.title}</h4>
                    <span className="note-category">{note.category}</span>
                    <div 
                      className="note-preview"
                      dangerouslySetInnerHTML={{
                        __html: stripHtml(note.content || '').substring(0, 80) + 
                                (stripHtml(note.content || '').length > 80 ? '...' : '')
                      }}
                    />
                  </div>
                  <div className="calendar-note-actions">
                    <button 
                      className="icon-btn small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note._id, e);
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1>All Notes</h1>
          <p className="page-subtitle">Manage and organize all your notes in one place</p>
        </div>
        <div className="page-header-actions">
          <div className="view-controls">
            <div className="view-mode-selector">
              <span className="view-label">View:</span>
              <div className="view-mode-buttons">
                <button 
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FaTh />
                  <span>Grid</span>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FaList />
                  <span>List</span>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <FaTable />
                  <span>Table</span>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                  title="Kanban View"
                >
                  <FaColumns />
                  <span>Kanban</span>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewMode('calendar')}
                  title="Calendar View"
                >
                  <FaCalendar />
                  <span>Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-icon-wrapper">
              <FaPlus className="empty-icon" />
            </div>
            <h3>No notes yet</h3>
            <p>Create your first note to get started!</p>
            <Link to="/notes/create" className="btn btn-primary btn-large">
              <FaPlus className="btn-icon" />
              Create Your First Note
            </Link>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'kanban' && renderKanbanView()}
          {viewMode === 'calendar' && renderCalendarView()}
        </>
      )}
    </div>
  );
};

export default AllNotes;