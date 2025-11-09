import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaStickyNote, 
  FaPlus, 
  FaSearch, 
  FaThumbtack, 
  FaFolder,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <FaStickyNote className="logo-icon" />
          <span>NotesApp</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActiveLink('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaStickyNote className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/notes" 
            className={`nav-link ${isActiveLink('/notes') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaFolder className="nav-icon" />
            <span>All Notes</span>
          </Link>
          
          <Link 
            to="/pinned" 
            className={`nav-link ${isActiveLink('/pinned') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaThumbtack className="nav-icon" />
            <span>Pinned</span>
          </Link>
          
          <Link 
            to="/categories" 
            className={`nav-link ${isActiveLink('/categories') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaFolder className="nav-icon" />
            <span>Categories</span>
          </Link>

          <Link 
            to="/notes/create" 
            className="nav-link create-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaPlus className="nav-icon" />
            <span>New Note</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="nav-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;