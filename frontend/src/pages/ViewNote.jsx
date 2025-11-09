import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaEdit, FaTrash, FaThumbtack, FaArrowLeft, FaTag, FaFolder, 
  FaFileExport, FaEllipsisV, FaBook, FaFont, FaPalette,
  FaMoon, FaSun, FaBookOpen, FaPrint, FaCopy, FaClock, FaUser
} from 'react-icons/fa';
import { notesAPI } from '../services/notesAPI';
import { exportNoteAsPDF, exportNoteAsHTML } from '../utils/exportUtils';
import './Pages.css';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tableOfContents, setTableOfContents] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Reading Mode States
  const [readingMode, setReadingMode] = useState('comfortable'); // 'comfortable', 'compact', 'novel'
  const [theme, setTheme] = useState('light'); // 'light', 'sepia', 'dark'
  const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'
  const [fontFamily, setFontFamily] = useState('serif'); // 'serif', 'sans', 'mono'
  const [lineHeight, setLineHeight] = useState('relaxed'); // 'compact', 'normal', 'relaxed'
  const [showReadingSettings, setShowReadingSettings] = useState(false);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (note?.content) {
      generateTableOfContents(note.content);
      calculateReadingTime(note.content);
    }
  }, [note]);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector('.note-content-view');
      if (element) {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setReadingProgress(progress);
        
        // Auto-hide reading settings when scrolling
        if (showReadingSettings) {
          setShowReadingSettings(false);
        }
      }
    };

    const contentElement = document.querySelector('.note-content-view');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [note, showReadingSettings]);

  // Apply reading settings to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--reading-font-size', getFontSizeValue());
    root.style.setProperty('--reading-line-height', getLineHeightValue());
    
    document.body.className = document.body.className.replace(/\breading-theme-\w+/g, '');
    document.body.classList.add(`reading-theme-${theme}`);
    
    document.body.className = document.body.className.replace(/\breading-font-\w+/g, '');
    document.body.classList.add(`reading-font-${fontFamily}`);
    
    document.body.className = document.body.className.replace(/\breading-mode-\w+/g, '');
    document.body.classList.add(`reading-mode-${readingMode}`);
  }, [theme, fontFamily, fontSize, lineHeight, readingMode]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError('');
      const noteData = await notesAPI.getNote(id);
      setNote(noteData);
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Failed to load note. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const generateTableOfContents = (content) => {
    const headings = content.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || [];
    const toc = headings.map((heading, index) => {
      const level = heading.match(/<h([1-6])/)?.[1] || '1';
      const text = heading.replace(/<[^>]*>/g, '');
      return { 
        level: parseInt(level), 
        text, 
        id: `heading-${index}`,
        element: heading.replace(/<h([1-6])/, '<h$1 id="heading-' + index + '"')
      };
    });
    setTableOfContents(toc);
  };

  const calculateReadingTime = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    setEstimatedReadingTime(readingTimeMinutes);
  };

  const getFontSizeValue = () => {
    switch(fontSize) {
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  };

  const getLineHeightValue = () => {
    switch(lineHeight) {
      case 'compact': return '1.4';
      case 'normal': return '1.6';
      case 'relaxed': return '1.8';
      default: return '1.6';
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.deleteNote(id);
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleTogglePin = async () => {
    try {
      const updatedNote = await notesAPI.togglePin(id);
      setNote(updatedNote);
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to toggle pin. Please try again.');
    }
  };

  const handleExport = async (format) => {
    if (!note) return;

    try {
      const exportData = {
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || []
      };

      if (format === 'pdf') {
        await exportNoteAsPDF(exportData);
      } else if (format === 'html') {
        exportNoteAsHTML(exportData);
      }
    } catch (error) {
      console.error('Error exporting note:', error);
      alert('Failed to export note. Please try again.');
    }
  };

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to safely render HTML content with TOC anchors
  const createMarkup = (htmlContent) => {
    let contentWithAnchors = htmlContent;
    tableOfContents.forEach(heading => {
      contentWithAnchors = contentWithAnchors.replace(heading.element, heading.element);
    });
    return { __html: contentWithAnchors };
  };

  // Reading Settings Panel
  const ReadingSettingsPanel = () => (
    <div className="reading-settings-panel">
      <div className="settings-header">
        <h4>
          <FaFont className="settings-icon" />
          Reading Settings
        </h4>
        <button 
          onClick={() => setShowReadingSettings(false)}
          className="btn-close"
        >
          ×
        </button>
      </div>

      <div className="settings-sections">
        {/* Theme */}
        <div className="settings-section">
          <h5>Theme</h5>
          <div className="theme-options reading-themes">
            <button 
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <FaSun />
              <span>Light</span>
            </button>
            <button 
              className={`theme-option ${theme === 'sepia' ? 'active' : ''}`}
              onClick={() => setTheme('sepia')}
            >
              <FaBook />
              <span>Sepia</span>
            </button>
            <button 
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <FaMoon />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Font Family */}
        <div className="settings-section">
          <h5>Font</h5>
          <div className="font-options reading-fonts">
            <button 
              className={`font-option ${fontFamily === 'serif' ? 'active' : ''}`}
              onClick={() => setFontFamily('serif')}
            >
              Serif
            </button>
            <button 
              className={`font-option ${fontFamily === 'sans' ? 'active' : ''}`}
              onClick={() => setFontFamily('sans')}
            >
              Sans
            </button>
            <button 
              className={`font-option ${fontFamily === 'mono' ? 'active' : ''}`}
              onClick={() => setFontFamily('mono')}
            >
              Mono
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="settings-section">
          <h5>Size</h5>
          <div className="size-options reading-sizes">
            <button 
              className={`size-option ${fontSize === 'small' ? 'active' : ''}`}
              onClick={() => setFontSize('small')}
            >
              A
            </button>
            <button 
              className={`size-option ${fontSize === 'medium' ? 'active' : ''}`}
              onClick={() => setFontSize('medium')}
            >
              A
            </button>
            <button 
              className={`size-option ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => setFontSize('large')}
            >
              A
            </button>
          </div>
        </div>

        {/* Reading Mode */}
        <div className="settings-section">
          <h5>Layout</h5>
          <div className="mode-options reading-modes">
            <button 
              className={`mode-option ${readingMode === 'comfortable' ? 'active' : ''}`}
              onClick={() => setReadingMode('comfortable')}
            >
              Comfortable
            </button>
            <button 
              className={`mode-option ${readingMode === 'compact' ? 'active' : ''}`}
              onClick={() => setReadingMode('compact')}
            >
              Compact
            </button>
            <button 
              className={`mode-option ${readingMode === 'novel' ? 'active' : ''}`}
              onClick={() => setReadingMode('novel')}
            >
              Novel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading note...
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <FaFolder className="empty-icon" />
          </div>
          <h3>Error</h3>
          <p>{error || 'Note not found'}</p>
          <Link to="/notes" className="btn btn-primary">
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container reading-enhanced">
      {/* Enhanced Reading Progress Bar */}
      <div className="reading-progress-bar">
        <div 
          className="reading-progress-fill" 
          style={{ width: `${readingProgress}%` }}
        />
        <div className="progress-stats">
          <span>{Math.round(readingProgress)}% read</span>
          <span>{estimatedReadingTime} min</span>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="mobile-note-header">
        <button 
          onClick={() => navigate('/notes')}
          className="btn btn-icon mobile-back-btn"
        >
          <FaArrowLeft />
        </button>
        <div className="mobile-title-container">
          <h1 className="mobile-note-title">{note.title}</h1>
          {note.pinned && <FaThumbtack className="pinned-badge" />}
        </div>
        <button 
          className="btn btn-icon mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaEllipsisV />
        </button>
      </div>

      {/* Mobile Action Menu */}
      {showMobileMenu && (
        <div className="mobile-action-menu">
          <button 
            className="mobile-action-item"
            onClick={() => navigate(`/notes/edit/${note._id}`)}
          >
            <FaEdit />
            <span>Edit</span>
          </button>
          <button 
            className="mobile-action-item"
            onClick={handleTogglePin}
          >
            <FaThumbtack />
            <span>{note.pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button 
            className="mobile-action-item"
            onClick={() => setShowReadingSettings(true)}
          >
            <FaPalette />
            <span>Reading Mode</span>
          </button>
          <div className="dropdown">
            <button className="mobile-action-item">
              <FaFileExport />
              <span>Export</span>
            </button>
            <div className="dropdown-menu mobile-dropdown">
              <button onClick={() => handleExport('pdf')} className="dropdown-item">
                Export as PDF
              </button>
              <button onClick={() => handleExport('html')} className="dropdown-item">
                Export as HTML
              </button>
            </div>
          </div>
          <button 
            className="mobile-action-item delete"
            onClick={handleDeleteNote}
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div className="page-header desktop-header">
        <div className="page-header-left">
          <button 
            onClick={() => navigate('/notes')}
            className="btn btn-secondary"
          >
            <FaArrowLeft className="btn-icon" />
            <span className="btn-text">Back</span>
          </button>
          <div className="reading-info">
            <span className="reading-category">{note.category}</span>
            <span className="reading-time">
              <FaClock />
              {estimatedReadingTime} min read
            </span>
          </div>
        </div>
        <div className="note-actions-group">
          <button 
            className="btn btn-theme"
            onClick={() => setShowReadingSettings(!showReadingSettings)}
            title="Reading Settings"
          >
            <FaPalette className="btn-icon" />
            <span className="btn-text">Reading Mode</span>
          </button>
          <div className="dropdown">
            <button className="btn btn-secondary" title="Export Options">
              <FaFileExport className="btn-icon" />
              <span className="btn-text">Export</span>
            </button>
            <div className="dropdown-menu">
              <button onClick={() => handleExport('pdf')} className="dropdown-item">
                <FaFileExport />
                Export as PDF
              </button>
              <button onClick={() => handleExport('html')} className="dropdown-item">
                <FaCopy />
                Export as HTML
              </button>
            </div>
          </div>
          <button 
            className={`btn ${note.pinned ? 'btn-warning' : 'btn-secondary'}`}
            onClick={handleTogglePin}
          >
            <FaThumbtack className="btn-icon" />
            <span className="btn-text">{note.pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/notes/edit/${note._id}`)}
          >
            <FaEdit className="btn-icon" />
            <span className="btn-text">Edit</span>
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDeleteNote}
          >
            <FaTrash className="btn-icon" />
            <span className="btn-text">Delete</span>
          </button>
        </div>
      </div>

      {/* Reading Settings Panel */}
      {showReadingSettings && <ReadingSettingsPanel />}

      <div className="note-view-container reading-enhanced">
        <div className="note-view-header">
          <div className="note-title-section">
            <h1 className="note-view-title">{note.title}</h1>
            {note.pinned && (
              <div className="pinned-indicator">
                <FaThumbtack />
              </div>
            )}
          </div>
          
          <div className="note-meta-grid">
            <div className="meta-group">
              <div className="meta-item category">
                <FaFolder className="meta-icon" />
                <div className="meta-content">
                  <span className="meta-label">Category</span>
                  <span className="note-category-large">{note.category}</span>
                </div>
              </div>
              
              <div className="meta-item date">
                <FaClock className="meta-icon" />
                <div className="meta-content">
                  <span className="meta-label">Reading Time</span>
                  <span>{estimatedReadingTime} minutes</span>
                </div>
              </div>
              
              <div className="meta-item date">
                <div className="meta-content">
                  <span className="meta-label">Last Updated</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="note-tags-section">
            <div className="tags-header">
              <FaTag className="tags-icon" />
              <h3 className="tags-title">Tags</h3>
            </div>
            <div className="tags-list">
              {note.tags.map(tag => (
                <span key={tag} className="tag-large">
                  <FaTag className="tag-icon" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <div className="table-of-contents reading-toc">
            <div className="toc-header">
              <FaBookOpen className="toc-icon" />
              <h3>Table of Contents</h3>
            </div>
            <div className="toc-items reading-toc-items">
              {tableOfContents.map((heading, index) => (
                <a
                  key={index}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(heading.id);
                  }}
                  className="toc-item reading-toc-item"
                  style={{ paddingLeft: `${(heading.level - 1) * 20}px` }}
                >
                  <span className="toc-bullet"></span>
                  {heading.text}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="note-content-view reading-content">
          {note.content ? (
            <div 
              className="content-text ql-editor reading-content-text"
              dangerouslySetInnerHTML={createMarkup(note.content)}
            />
          ) : (
            <div className="empty-content">
              <div className="empty-icon-wrapper">
                <FaEdit className="empty-icon" />
              </div>
              <h3>No Content</h3>
              <p>This note doesn't have any content yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/notes/edit/${note._id}`)}
              >
                <FaEdit className="btn-icon" />
                Add Content
              </button>
            </div>
          )}
        </div>

        {/* Reading Completion */}
        {readingProgress > 90 && (
          <div className="reading-completion">
            <div className="completion-content">
              <FaBookOpen className="completion-icon" />
              <h3>You've reached the end!</h3>
              <p>Great job completing this note.</p>
              <div className="completion-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/notes')}
                >
                  Browse More Notes
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/notes/edit/${note._id}`)}
                >
                  Edit This Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNote;