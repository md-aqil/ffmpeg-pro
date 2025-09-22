import React from 'react';
import { Link } from 'react-router-dom';
import './LeftSidebar.css';

const LeftSidebar = () => {
  // Mock data for dashboard statistics
  const stats = {
    video: { count: 24, size: '2.4 GB', last: '2025-09-18' },
    audio: { count: 42, size: '856 MB', last: '2025-09-17' },
    image: { count: 128, size: '1.2 GB', last: '2025-09-18' }
  };

  const recentFiles = [
    { name: 'vacation.mp4', type: 'video', date: '2025-09-18', size: '120 MB' },
    { name: 'podcast.mp3', type: 'audio', date: '2025-09-17', size: '45 MB' },
    { name: 'screenshot.png', type: 'image', date: '2025-09-17', size: '2.1 MB' },
    { name: 'presentation.mp4', type: 'video', date: '2025-09-16', size: '850 MB' }
  ];

  return (


    <aside className="sidebar-left">

        <div className=" sidebar-section">
          <div>
  <i className="ti ti-target"></i>
                <span>Dashboard</span>
          </div>
              

                  <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.video.count}</div>
            <div className="stat-label">Videos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.audio.count}</div>
            <div className="stat-label">Audio Files</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.image.count}</div>
            <div className="stat-label">Images</div>
          </div>
        </div>

            </div>
         

   
      <div className="sidebar-section">
        <h3>Storage</h3>
        <div className="storage-info">
          <div className="storage-stats">
            <div className="storage-value">{stats.video.size}</div>
            <div className="storage-label">Total Used</div>
          </div>
          <div className="storage-bar">
            <div className="storage-progress" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Converters</h3>
        <nav className="converter-navigation">
          <Link to="/video" className="nav-item">
            <span className="nav-icon">🎬</span>
            <span className="nav-text">Video Converter</span>
          </Link>
          <Link to="/audio" className="nav-item">
            <span className="nav-icon">🎵</span>
            <span className="nav-text">Audio Converter</span>
          </Link>
          <Link to="/image" className="nav-item">
            <span className="nav-icon">🖼️</span>
            <span className="nav-text">Image Converter</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <h3>Recent Files</h3>
        <ul className="recent-files-list">
          {recentFiles.map((file, index) => (
            <li key={index} className="recent-file-item">
              <div className="file-icon">
                {file.type === 'video' && '🎬'}
                {file.type === 'audio' && '🎵'}
                {file.type === 'image' && '🖼️'}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">{file.size} • {file.date}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default LeftSidebar;