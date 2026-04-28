import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = ({ 
  selectedFile, 
  isConverting, 
  conversionResult, 
  onConvert, 
  onDownload,
  activeConverter
}) => {
  const location = useLocation();
  const [theme, setTheme] = useState('dark'); // Default to dark for premium feel

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const getButtonProps = () => {
    if (!selectedFile) {
      return {
        disabled: true,
        text: 'Convert',
        className: 'save-btn disabled',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20"/>
          </svg>
        )
      };
    }
    
    if (isConverting) {
      return {
        disabled: true,
        text: 'Converting...',
        className: 'save-btn converting',
        icon: (
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        )
      };
    }
    
    if (conversionResult) {
      return {
        disabled: false,
        text: 'Download',
        className: 'save-btn download',
        onClick: onDownload,
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        )
      };
    }
    
    return {
      disabled: false,
      text: 'Convert Now',
      className: 'save-btn',
      onClick: onConvert,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      )
    };
  };

  const buttonProps = getButtonProps();

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <h1 className="app-title">FFmpeg Studio</h1>
        </div>
        <nav className="nav-tabs">
          <Link to="/image" className={`nav-link ${location.pathname === '/image' ? 'active' : ''}`}>Image</Link>
          <Link to="/video" className={`nav-link ${location.pathname === '/video' ? 'active' : ''}`}>Video</Link>
          <Link to="/audio" className={`nav-link ${location.pathname === '/audio' ? 'active' : ''}`}>Audio</Link>
        </nav>
      </div>

      <div className="header-right">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button 
          className={buttonProps.className}
          onClick={buttonProps.onClick}
          disabled={buttonProps.disabled}
        >
          {buttonProps.icon}
          <span>{buttonProps.text}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;