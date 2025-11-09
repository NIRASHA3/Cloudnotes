import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFolder, FaPlus, FaEdit, FaTrash, FaThumbtack, FaEye } from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import './Pages.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryNotes, setCategoryNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, allNotes] = await Promise.all([
        notesAPI.getStats(),
        notesAPI.getNotes()
      ]);

      setCategories(statsData.categoriesList || []);
      
      // Group notes by category
      const notesByCategory = {};
      (allNotes.notes || []).forEach(note => {
        if (!notesByCategory[note.category]) {
          notesByCategory[note.category] = [];
        }
        notesByCategory[note.category].push(note);
      });
      
      setCategoryNotes(notesByCategory);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleTogglePin = async (noteId, e) => {
    e.stopPropagation();
    try {
      await notesAPI.togglePin(noteId);
      fetchData(); // Refresh data
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
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Categories</h1>
          <p className="page-subtitle">Organize your notes by categories</p>
        </div>
      </div>

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-icon-wrapper">
                <FaFolder className="empty-icon" />
              </div>
              <h3>No categories yet</h3>
              <p>Create notes with different categories to organize them</p>
              <Link to="/notes/create" className="btn btn-primary btn-large">
                <FaPlus className="btn-icon" />
                Create Note
              </Link>
            </div>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">
                <FaFolder className="category-icon" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="note-count">
                  ({categoryNotes[category]?.length || 0})
                </span>
              </h2>
              
              <div className="notes-grid">
                {categoryNotes[category]?.length > 0 ? (
                  categoryNotes[category].map(note => (
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
                ) : (
                  <div className="empty-category">
                    <p>No notes in this category</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;