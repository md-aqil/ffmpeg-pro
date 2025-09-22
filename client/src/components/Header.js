import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const location = useLocation();
  const [theme, setTheme] = useState('dark');

  // Set initial theme and apply it to the document
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

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9.333 13.267V10.667H11.333C11.687 10.667 12.026 10.526 12.276 10.276C12.526 10.026 12.667 9.687 12.667 9.333V8H3.333V9.333C3.333 10.067 3.933 10.667 4.667 10.667H6.667V13.267C6.667 13.62 6.807 13.959 7.057 14.209C7.307 14.46 7.646 14.6 8 14.6C8.354 14.6 8.693 14.46 8.943 14.209C9.193 13.959 9.333 13.62 9.333 13.267Z" stroke="white"/>
              <path d="M4 8V1.333H12V8" stroke="white"/>
              <path d="M9.333 1.333V4" stroke="white"/>
              <path d="M6.667 1.333V2.667" stroke="white"/>
            </svg>
          </div>
          <h1 className="app-title">PhotoVideo Convert</h1>
        </div>
        <nav className="nav-tabs">
          <div className="nav-tab">
            <Link 
              to="/video" 
              className={`nav-link ${location.pathname === '/video' ? 'active' : ''}`}
            >
              Video Converter
            </Link>
          </div>
          <div className="nav-tab">
            <Link 
              to="/audio" 
              className={`nav-link ${location.pathname === '/audio' ? 'active' : ''}`}
            >
              Audio Converter
            </Link>
          </div>
          <div className="nav-tab">
            <Link 
              to="/image" 
              className={`nav-link ${location.pathname === '/image' ? 'active' : ''}`}
            >
              Image Converter
            </Link>
          </div>
        </nav>
      </div>

      <div className="header-right">
        <div className="collaborators">
          <i className="ti ti-users"></i>
          <i className="ti ti-users"></i>
          <span>3 collaborators</span>
        </div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button className="icon-btn save-btn">
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M7.58209 8.96025 9.8136 11.1917l-1.61782 1.6178c-1.08305-.1811-2.23623.1454-3.07364.9828-1.1208 1.1208-1.32697 2.8069-.62368 4.1363.14842.2806.42122.474.73509.5213.06726.0101.1347.0133.20136.0098-.00351.0666-.00036.1341.00977.2013.04724.3139.24069.5867.52125.7351 1.32944.7033 3.01552.4971 4.13627-.6237.8375-.8374 1.1639-1.9906.9829-3.0736l4.8107-4.8108c1.0831.1811 2.2363-.1454 3.0737-.9828 1.1208-1.1208 1.3269-2.80688.6237-4.13632-.1485-.28056-.4213-.474-.7351-.52125-.0673-.01012-.1347-.01327-.2014-.00977.0035-.06666.0004-.13409-.0098-.20136-.0472-.31386-.2406-.58666-.5212-.73508-1.3294-.70329-3.0155-.49713-4.1363.62367-.8374.83741-1.1639 1.9906-.9828 3.07365l-1.7788 1.77875-2.23152-2.23148-1.41419 1.41424Zm1.31056-3.1394c-.04235-.32684-.24303-.61183-.53647-.76186l-1.98183-1.0133c-.38619-.19746-.85564-.12345-1.16234.18326l-.86321.8632c-.3067.3067-.38072.77616-.18326 1.16235l1.0133 1.98182c.15004.29345.43503.49412.76187.53647l1.1127.14418c.3076.03985.61628-.06528.8356-.28461l.86321-.8632c.21932-.21932.32446-.52801.2846-.83561l-.14417-1.1127ZM19.4448 16.4052l-3.1186-3.1187c-.7811-.781-2.0474-.781-2.8285 0l-.1719.172c-.7811.781-.7811 2.0474 0 2.8284l3.1186 3.1187c.7811.781 2.0474.781 2.8285 0l.1719-.172c.7811-.781.7811-2.0474 0-2.8284Z"/>
          </svg>
          <span>Convert</span>
        </button>
      </div>
    </header>
  );
};

export default Header;