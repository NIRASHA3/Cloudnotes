import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaTag, FaFolder, FaEye, FaFileExport, FaExpand } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { notesAPI } from '../services/notesAPI';
import { exportNoteAsPDF, exportNoteAsHTML } from '../utils/exportUtils';
import './Pages.css';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Quill editor modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    }
  };

  // Quill editor formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    fetchNote();
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (!fetching && (formData.title || formData.content)) {
      setHasUnsavedChanges(true);
      
      const autoSaveTimer = setTimeout(() => {
        localStorage.setItem(`draft_${id}`, JSON.stringify({
          ...formData,
          lastSaved: new Date().toISOString()
        }));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, id, fetching]);

  // Calculate word count and reading time
  useEffect(() => {
    const plainText = formData.content.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = plainText.length;
    const readingTimeMinutes = Math.ceil(words.length / 200);
    
    setWordCount(words.length);
    setCharCount(characters);
    setReadingTime(readingTimeMinutes);
  }, [formData.content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            if (!loading) {
              handleSubmit(e);
            }
            break;
          case 'p':
            e.preventDefault();
            setShowPreview(!showPreview);
            break;
          case 'f':
            e.preventDefault();
            setFocusMode(!focusMode);
            break;
          case 'e':
            e.preventDefault();
            handleExport('pdf');
            break;
        }
      }
      
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [loading, showPreview, focusMode]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchNote = async () => {
    try {
      setFetching(true);
      setError('');
      
      // Check for draft first
      const draft = localStorage.getItem(`draft_${id}`);
      if (draft) {
        const draftData = JSON.parse(draft);
        if (window.confirm('Found unsaved changes for this note. Would you like to restore them?')) {
          setFormData(draftData);
          setFetching(false);
          return;
        } else {
          localStorage.removeItem(`draft_${id}`);
        }
      }

      const note = await notesAPI.getNote(id);
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: note.category || 'general',
        tags: note.tags?.join(', ') || ''
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Failed to load note. It may have been deleted.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category.toLowerCase(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await notesAPI.updateNote(id, noteData);
      
      // Clear draft after successful save
      localStorage.removeItem(`draft_${id}`);
      setHasUnsavedChanges(false);
      
      navigate('/notes');
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const exportData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
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

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear unsaved changes?')) {
      localStorage.removeItem(`draft_${id}`);
      fetchNote(); // Reload original note data
      setHasUnsavedChanges(false);
    }
  };

  const PreviewPanel = () => (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>Preview</h3>
        <button 
          onClick={() => setShowPreview(false)}
          className="btn btn-secondary btn-sm"
        >
          Close
        </button>
      </div>
      <div className="preview-content">
        <h1>{formData.title}</h1>
        <div 
          className="preview-text ql-editor"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />
      </div>
    </div>
  );

  if (fetching) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading note...
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-icon-wrapper">
              <FaTimes className="empty-icon" />
            </div>
            <h3>Error Loading Note</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/notes')}
              className="btn btn-primary"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-container ${focusMode ? 'focus-mode' : ''}`}>
      <div className="page-header">
        <div className="page-header-content">
          <h1>Edit Note</h1>
          <p className="page-subtitle">
            Update your note with new content and organization
            {lastSaved && (
              <span className="last-saved">
                • Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="unsaved-changes">• Unsaved changes</span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <div className="editor-controls">
            <button 
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`btn btn-secondary ${focusMode ? 'active' : ''}`}
              title="Focus Mode (Ctrl+F)"
            >
              <FaExpand className="btn-icon" />
            </button>
            <button 
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`btn btn-secondary ${showPreview ? 'active' : ''}`}
              title="Preview (Ctrl+P)"
            >
              <FaEye className="btn-icon" />
            </button>
            <div className="dropdown">
              <button className="btn btn-secondary" title="Export Options (Ctrl+E)">
                <FaFileExport className="btn-icon" />
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleExport('pdf')} className="dropdown-item">
                  Export as PDF
                </button>
                <button onClick={() => handleExport('html')} className="dropdown-item">
                  Export as HTML
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  localStorage.removeItem(`draft_${id}`);
                  navigate('/notes');
                }
              } else {
                navigate('/notes');
              }
            }}
            className="btn btn-secondary"
            disabled={loading}
          >
            <FaTimes className="btn-icon" />
            <span className="btn-text">Cancel</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-section">
          <div className="form-section-header">
            <h3>Note Details</h3>
            <p>Update the basic information about your note</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your note..."
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="editor-header">
              <label htmlFor="content" className="form-label">
                Content
              </label>
              <div className="editor-stats">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
            <div className="rich-text-editor-container">
              <ReactQuill
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Write your note content here... You can use the toolbar above to format your text."
                theme="snow"
                readOnly={loading}
              />
            </div>
          </div>
        </div>

        {!focusMode && (
          <>
            <div className="form-section">
              <div className="form-section-header">
                <h3>Organization</h3>
                <p>Update categorization and tags for better organization</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    <FaFolder className="label-icon" />
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-select"
                  >
                    <option value="general">General</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="ideas">Ideas</option>
                    <option value="important">Important</option>
                    <option value="study">Study</option>
                    <option value="projects">Projects</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tags" className="form-label">
                    <FaTag className="label-icon" />
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="work, meeting, important, project..."
                    disabled={loading}
                    className="form-input"
                  />
                  <div className="form-hint">
                    Separate tags with commas (e.g., work, meeting, important)
                  </div>
                </div>
              </div>
            </div>

            {showPreview && <PreviewPanel />}
          </>
        )}

        <div className="form-actions">
          {hasUnsavedChanges && (
            <button 
              type="button"
              onClick={clearDraft}
              className="btn btn-secondary"
              disabled={loading}
            >
              Clear Changes
            </button>
          )}
          <button 
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  localStorage.removeItem(`draft_${id}`);
                  navigate('/notes');
                }
              } else {
                navigate('/notes');
              }
            }}
            className="btn btn-secondary"
            disabled={loading}
          >
            <FaTimes className="btn-icon" />
            <span className="btn-text">Cancel</span>
          </button>
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.title.trim()}
          >
            <FaSave className="btn-icon" />
            <span className="btn-text">
              {loading ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNote;