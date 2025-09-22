import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Multimedia Converter Pro
      </div>
      <div className="navbar-links">
        <NavLink to="/" className="navbar-link">Home</NavLink>
        <NavLink to="/video" className="navbar-link">Video</NavLink>
        <NavLink to="/audio" className="navbar-link">Audio</NavLink>
        <NavLink to="/image" className="navbar-link">Image</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;