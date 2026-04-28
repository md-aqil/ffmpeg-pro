import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const StudioTopNav = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  return (
    <header className="studio-topbar inner-glow-top" style={{ justifyContent: 'center' }}>
      {/* <nav className="studio-switcher" aria-label="Media type">
        <Link className={`studio-switcher-pill ${location.pathname === '/image' ? 'active' : ''}`} to="/image">Image</Link>
        <Link className={`studio-switcher-pill ${location.pathname === '/video' ? 'active' : ''}`} to="/video">Video</Link>
        <Link className={`studio-switcher-pill ${location.pathname === '/audio' ? 'active' : ''}`} to="/audio">Audio</Link>
      </nav> */}
    </header>
  );
};

export default StudioTopNav;
