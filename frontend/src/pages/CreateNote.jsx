import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSave, FaTimes, FaTag, FaFolder, FaEye, FaFileExport, FaExpand,
  FaPalette, 
  FaMoon, FaSun, FaFeather, FaBook} from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { notesAPI } from '../services/notesAPI';
import { exportNoteAsPDF, exportNoteAsHTML } from '../utils/exportUtils';
import { noteTemplates } from '../utils/templates';
import './Pages.css';

const CreateNote = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Enhanced Focus Mode States
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'sepia', 'blue'
  const [fontFamily, setFontFamily] = useState('inter'); // 'inter', 'serif', 'mono', 'modern'
  const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'
  const [accentColor, setAccentColor] = useState('#667eea'); // Primary accent color
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [writingMode, setWritingMode] = useState('normal'); // 'normal', 'typewriter', 'zen'

  // Color Palettes
  const colorPalettes = [
    { name: 'Ocean Blue', value: '#667eea', bg: '#f0f4ff' },
    { name: 'Forest Green', value: '#48bb78', bg: '#f0fff4' },
    { name: 'Sunset Orange', value: '#ed8936', bg: '#fffaf0' },
    { name: 'Berry Purple', value: '#9f7aea', bg: '#faf5ff' },
    { name: 'Coral Pink', value: '#ed64a6', bg: '#fff5f7' },
    { name: 'Slate Gray', value: '#4a5568', bg: '#f7fafc' }
  ];

  // Font Options
  const fontOptions = [
    { name: 'Inter', value: 'inter', class: 'font-inter' },
    { name: 'Serif', value: 'serif', class: 'font-serif' },
    { name: 'Mono', value: 'mono', class: 'font-mono' },
    { name: 'Modern', value: 'modern', class: 'font-modern' }
  ];

  // Enhanced Quill editor modules configuration
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

  // Auto-save functionality
  useEffect(() => {
    const hasContent = formData.title || formData.content;
    if (hasContent) {
      setHasUnsavedChanges(true);
      
      const autoSaveTimer = setTimeout(() => {
        localStorage.setItem('draft_new_note', JSON.stringify({
          ...formData,
          lastSaved: new Date().toISOString()
        }));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('draft_new_note');
    if (draft) {
      const draftData = JSON.parse(draft);
      if (window.confirm('Found a saved draft. Would you like to restore it?')) {
        setFormData(draftData);
      } else {
        // Clear the draft if user doesn't want it
        localStorage.removeItem('draft_new_note');
      }
    }
  }, []);

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

  // Apply theme and styling
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--theme-bg', getThemeBackground());
    
    // Apply theme class
    document.body.className = document.body.className.replace(/\btheme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Apply font family
    document.body.className = document.body.className.replace(/\bfont-\w+/g, '');
    document.body.classList.add(`font-${fontFamily}`);
    
    // Apply writing mode
    document.body.className = document.body.className.replace(/\bmode-\w+/g, '');
    document.body.classList.add(`mode-${writingMode}`);
    
  }, [theme, fontFamily, accentColor, writingMode]);

  const getThemeBackground = () => {
    const palette = colorPalettes.find(p => p.value === accentColor);
    return palette ? palette.bg : '#f8f9fa';
  };

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
          case 't':
            e.preventDefault();
            setShowTemplates(!showTemplates);
            break;
          case 'm':
            e.preventDefault();
            setShowThemePanel(!showThemePanel);
            break;
        }
      }
      
      // Escape key to exit focus mode
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [loading, showPreview, focusMode, showTemplates, showThemePanel]);

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
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const noteData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await notesAPI.createNote(noteData);
      
      // Clear draft after successful save
      localStorage.removeItem('draft_new_note');
      setHasUnsavedChanges(false);
      
      navigate('/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!formData.title.trim() && !formData.content) {
      alert('Please add some content before exporting.');
      return;
    }

    try {
      const exportData = {
        title: formData.title || 'Untitled Note',
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
    if (window.confirm('Are you sure you want to clear the current draft?')) {
      localStorage.removeItem('draft_new_note');
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: ''
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleUseTemplate = (template) => {
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags.join(', ')
    });
    setShowTemplates(false);
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
        <h1>{formData.title || 'Untitled Note'}</h1>
        <div 
          className="preview-text ql-editor"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />
      </div>
    </div>
  );

  // Theme Customization Panel
  const ThemePanel = () => (
    <div className="theme-panel">
      <div className="theme-header">
        <h4>
          <FaPalette className="theme-icon" />
          Customize Appearance
        </h4>
        <button 
          onClick={() => setShowThemePanel(false)}
          className="btn-close"
        >
          <FaTimes />
        </button>
      </div>

      <div className="theme-sections">
        {/* Theme Selection */}
        <div className="theme-section">
          <h5>Theme</h5>
          <div className="theme-options">
            <button 
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <FaSun />
              <span>Light</span>
            </button>
            <button 
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <FaMoon />
              <span>Dark</span>
            </button>
            <button 
              className={`theme-option ${theme === 'sepia' ? 'active' : ''}`}
              onClick={() => setTheme('sepia')}
            >
              <FaBook />
              <span>Sepia</span>
            </button>
            <button 
              className={`theme-option ${theme === 'blue' ? 'active' : ''}`}
              onClick={() => setTheme('blue')}
            >
              <FaFeather />
              <span>Blue Light</span>
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="theme-section">
          <h5>Accent Color</h5>
          <div className="color-palette">
            {colorPalettes.map(palette => (
              <button
                key={palette.value}
                className={`color-option ${accentColor === palette.value ? 'active' : ''}`}
                onClick={() => setAccentColor(palette.value)}
                style={{
                  backgroundColor: palette.value,
                  ['--color-bg']: palette.bg
                }}
                title={palette.name}
              />
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="theme-section">
          <h5>Font Family</h5>
          <div className="font-options">
            {fontOptions.map(font => (
              <button
                key={font.value}
                className={`font-option ${fontFamily === font.value ? 'active' : ''} ${font.class}`}
                onClick={() => setFontFamily(font.value)}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* Writing Mode */}
        <div className="theme-section">
          <h5>Writing Mode</h5>
          <div className="mode-options">
            <button 
              className={`mode-option ${writingMode === 'normal' ? 'active' : ''}`}
              onClick={() => setWritingMode('normal')}
            >
              Normal
            </button>
            <button 
              className={`mode-option ${writingMode === 'typewriter' ? 'active' : ''}`}
              onClick={() => setWritingMode('typewriter')}
            >
              Typewriter
            </button>
            <button 
              className={`mode-option ${writingMode === 'zen' ? 'active' : ''}`}
              onClick={() => setWritingMode('zen')}
            >
              Zen Mode
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="theme-section">
          <h5>Font Size</h5>
          <div className="size-options">
            <button 
              className={`size-option ${fontSize === 'small' ? 'active' : ''}`}
              onClick={() => setFontSize('small')}
            >
              Small
            </button>
            <button 
              className={`size-option ${fontSize === 'medium' ? 'active' : ''}`}
              onClick={() => setFontSize('medium')}
            >
              Medium
            </button>
            <button 
              className={`size-option ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => setFontSize('large')}
            >
              Large
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`page-container ${focusMode ? 'focus-mode' : ''} creative-theme`}>
      <div className="page-header">
        <div className="page-header-content">
          <h1>Create New Note</h1>
          <p className="page-subtitle">
            Create a new note with rich text formatting
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
            {/* Theme Customization */}
            <button 
              type="button"
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`btn btn-theme ${showThemePanel ? 'active' : ''}`}
              title="Customize Theme (Ctrl+M)"
            >
              <FaPalette className="btn-icon" />
              Style
            </button>

            {/* Templates */}
            <button 
              type="button"
              onClick={() => setShowTemplates(true)}
              className="btn btn-secondary"
              title="Use Template (Ctrl+T)"
            >
              Use Template
            </button>

            {/* Focus Mode */}
            <button 
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`btn btn-secondary ${focusMode ? 'active' : ''}`}
              title="Focus Mode (Ctrl+F)"
            >
              <FaExpand className="btn-icon" />
            </button>

            {/* Preview */}
            <button 
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`btn btn-secondary ${showPreview ? 'active' : ''}`}
              title="Preview (Ctrl+P)"
            >
              <FaEye className="btn-icon" />
            </button>

            {/* Export */}
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
                  localStorage.removeItem('draft_new_note');
                  navigate('/notes');
                }
              } else {
                navigate('/notes');
              }
            }}
            className="btn btn-secondary"
          >
            <FaTimes className="btn-icon" />
            <span className="btn-text">Cancel</span>
          </button>
        </div>
      </div>

      {/* Theme Customization Panel */}
      {showThemePanel && <ThemePanel />}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="templates-modal">
          <div className="templates-content">
            <h3>Choose a Template</h3>
            <p className="templates-subtitle">Start with a pre-designed template</p>
            <div className="templates-grid">
              {Object.entries(noteTemplates).map(([key, template]) => {
                const IconComponent = template.icon;
                return (
                  <div 
                    key={key}
                    className="template-card"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="template-icon">
                      <IconComponent />
                    </div>
                    <h4>{template.title}</h4>
                    <p className="template-description">{template.description}</p>
                    <div className="template-tags">
                      {template.tags.map(tag => (
                        <span key={tag} className="template-tag">{tag}</span>
                      ))}
                    </div>
                    <span className="template-category">{template.category}</span>
                  </div>
                );
              })}
            </div>
            <div className="templates-actions">
              <button 
                onClick={() => setShowTemplates(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-section">
          <div className="form-section-header">
            <h3>Note Details</h3>
            <p>Basic information about your note</p>
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
                <p>Categorize and tag your note for better organization</p>
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
                    <option value="travel">Travel</option>
                    <option value="finance">Finance</option>
                    <option value="health">Health</option>
                    <option value="shopping">Shopping</option>
                    <option value="others">Others</option>
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
              Clear Draft
            </button>
          )}
          <button 
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  localStorage.removeItem('draft_new_note');
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
              {loading ? 'Creating...' : 'Create Note'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;