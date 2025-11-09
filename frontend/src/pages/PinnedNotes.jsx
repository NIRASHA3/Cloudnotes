import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaThumbtack, FaEye } from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import './Pages.css';

const PinnedNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPinnedNotes();
  }, []);

  const fetchPinnedNotes = async () => {
    try {
      const data = await notesAPI.getNotes({ pinned: true });
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching pinned notes:', error);
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
      // Remove from pinned notes list when unpinned
      if (!updatedNote.pinned) {
        setNotes(notes.filter(note => note._id !== noteId));
      } else {
        setNotes(notes.map(note => 
          note._id === noteId ? updatedNote : note
        ));
      }
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading pinned notes...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pinned Notes</h1>
      </div>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">
            <FaThumbtack className="empty-icon" />
            <h3>No pinned notes</h3>
            <p>Pin important notes to see them here!</p>
            <Link to="/notes" className="btn btn-primary">
              View All Notes
            </Link>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note._id} 
              className="note-card pinned"
              onClick={() => handleViewNote(note._id)}
            >
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button 
                    className="icon-btn pinned"
                    onClick={(e) => handleTogglePin(note._id, e)}
                    title="Unpin"
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
          ))
        )}
      </div>
    </div>
  );
};

export default PinnedNotes;