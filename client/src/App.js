import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ImagePage from './pages/ImagePage';
import VideoPage from './pages/VideoPage';

import AudioPage from './pages/AudioPage';
// import './App.css';
// import './theme.css';


function App() {
  return (
    <Router>
        <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/image" />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
