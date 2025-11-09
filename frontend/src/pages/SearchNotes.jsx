import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaThumbtack, FaEye, FaTimes } from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import './Pages.css';

const SearchNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setNotes([]);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await notesAPI.searchNotes(query);
      setNotes(results || []);
    } catch (error) {
      console.error('Error searching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
      performSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setNotes([]);
    setHasSearched(false);
    navigate('/search', { replace: true });
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

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Search Notes</h1>
          <p className="page-subtitle">Find your notes quickly and efficiently</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-page-form">
        <div className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through your notes by title, content, tags, or category..."
              className="search-input"
            />
            {searchQuery && (
              <button 
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          Searching notes...
        </div>
      ) : (
        <>
          {hasSearched && searchQuery && (
            <div className="search-results-info">
              <h2>
                {notes.length} result{notes.length !== 1 ? 's' : ''} for "{searchQuery}"
                {notes.length > 0 && (
                  <button 
                    className="btn-link"
                    onClick={handleClearSearch}
                  >
                    Clear results
                  </button>
                )}
              </h2>
            </div>
          )}

          <div className="notes-grid">
            {notes.length === 0 && hasSearched ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon-wrapper">
                    <FaSearch className="empty-icon" />
                  </div>
                  <h3>No results found</h3>
                  <p>Try different keywords or check your spelling</p>
                  <div className="search-suggestions">
                    <p><strong>Search tips:</strong></p>
                    <ul>
                      <li>Try using more general keywords</li>
                      <li>Check for typos in your search</li>
                      <li>Search by title, content, tags, or category</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              notes.map(note => (
                <div 
                  key={note._id} 
                  className={`note-card ${note.pinned ? 'pinned' : ''}`}
                  onClick={() => handleViewNote(note._id)}
                >
                  <div className="note-header">
                    <h3 className="note-title">
                      {searchQuery ? highlightText(note.title, searchQuery) : note.title}
                    </h3>
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
                    <span className="note-category">
                      {searchQuery ? highlightText(note.category, searchQuery) : note.category}
                    </span>
                    <div className="note-tags">
                      {note.tags?.map(tag => (
                        <span key={tag} className="tag">
                          {searchQuery ? highlightText(`#${tag}`, searchQuery) : `#${tag}`}
                        </span>
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

          {!hasSearched && (
            <div className="search-initial-state">
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-icon-wrapper">
                    <FaSearch className="empty-icon" />
                  </div>
                  <h3>Search Your Notes</h3>
                  <p>Enter keywords to search through your notes by title, content, tags, or category</p>
                  <div className="search-examples">
                    <p><strong>Examples:</strong></p>
                    <ul>
                      <li>"Meeting notes" - Search by title</li>
                      <li>"#important" - Search by tag</li>
                      <li>"Work" - Search by category</li>
                      <li>"Project deadline" - Search by content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchNotes;