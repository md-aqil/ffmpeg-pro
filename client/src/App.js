import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ImagePage from './pages/ImagePage';
import VideoPage from './pages/VideoPage';
import AudioPage from './pages/AudioPage';
import './App.css';
import './theme.css';

function App() {
  return (
    <Router>
      <div className="App main-container">
        <Header />
        <main className="">
          <Routes>
            <Route path="/video" element={<VideoPage />} />
            <Route path="/audio" element={<AudioPage />} />
            <Route path="/image" element={<ImagePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;