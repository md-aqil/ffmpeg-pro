import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ImagePage from './pages/ImagePage';
import VideoPage from './pages/VideoPage';
import AudioPage from './pages/AudioPage';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
        <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/image" />} />
          <Route path="/image" element={<ImagePage theme={theme} setTheme={setTheme} />} />
          <Route path="/video" element={<VideoPage theme={theme} setTheme={setTheme} />} />
          <Route path="/audio" element={<AudioPage theme={theme} setTheme={setTheme} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
