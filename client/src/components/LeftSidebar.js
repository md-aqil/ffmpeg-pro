import React from 'react';
import { NavLink } from 'react-router-dom';
import './LeftSidebar.css';

const LeftSidebar = () => {
  return (
    <aside className="sidebar-left">
      <div className="sidebar-section">
        <h3>Converters</h3>
        <nav className="converter-navigation">
          <NavLink to="/video" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🎬</span>
            <span className="nav-text">Video Converter</span>
          </NavLink>
          <NavLink to="/audio" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🎵</span>
            <span className="nav-text">Audio Converter</span>
          </NavLink>
          <NavLink to="/image" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🖼️</span>
            <span className="nav-text">Image Converter</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default LeftSidebar;
