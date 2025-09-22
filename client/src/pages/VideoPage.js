import React, { useState, useRef } from 'react';
import VideoConverter from '../components/VideoConverter';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import '../components/layout.css';

const VideoPage = () => {
  const [conversionResult, setConversionResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleConversionComplete = (result) => {
    setConversionResult(result);
  };

  const handleFileSelect = (file) => {
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      // Handle error - you might want to show this in the UI
      console.error('Please select a video file');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDownload = async (result) => {
    try {
      await fetch(`http://localhost:3001/api/download/${result.filename}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="page-layout">
      <LeftSidebar />
      <div className="converter-content main-area">
         <div className="toolbar" bis_skin_checked="1">
          <div className="toolbar-left" bis_skin_checked="1">
           
             <div class="tool-group normal-text success" >
              <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd"/>
</svg>
1 file(s) uploaded successfully</div>
          </div>
          <div className="toolbar-right" bis_skin_checked="1">
            <div className="view-btn" bis_skin_checked="1">Fit Screen</div>
            <div className="view-btn" bis_skin_checked="1">100%</div>
            <div className="tool-btn" bis_skin_checked="1">
              <i className="ti ti-grid-3x3"></i>
            </div>
            <div className="tool-btn" bis_skin_checked="1">
              <i className="ti ti-ruler"></i>
            </div>
          </div>
        </div>

       
         <h4 className='text-center my-6'>Video Converter</h4>
         
        <VideoConverter 
          onConversionComplete={handleConversionComplete} 
          selectedFile={selectedFile}
        />
      </div>
      <RightSidebar 
        activeConverter="video" 
        conversionResult={conversionResult}
        onDownload={handleDownload}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        isDragOver={isDragOver}
        setIsDragOver={setIsDragOver}
      />
      <input
        id="file-input"
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files[0])}
        accept="video/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default VideoPage;