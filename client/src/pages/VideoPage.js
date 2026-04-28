import React, { useState, useRef, useEffect } from 'react';
import VideoConverter from '../components/VideoConverter';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import '../components/layout.css';

const VideoPage = () => {
  const [conversionResult, setConversionResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const videoConverterRef = useRef(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on initial load
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleConversionComplete = (result) => {
    setConversionResult(result);
    setIsConverting(false);
  };

  const handleFileSelect = (file) => {
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      // Show error toast
      setToast({ message: 'Please select a valid video file', type: 'error' });
      return;
    }
    
    setSelectedFile(file);
    // Reset conversion result when new file is selected
    setConversionResult(null);
    // Show success toast
    setToast({ message: '1 file uploaded successfully', type: 'success' });
  };

  const handleDownload = async () => {
    if (!conversionResult) return;
    
    try {
      const { downloadFile } = await import('../services/api');
      await downloadFile(conversionResult);
    } catch (err) {
      console.error('Failed to download file', err);
      setToast({ message: 'Failed to download file', type: 'error' });
    }
  };

  // This function will be called when the Convert button is clicked
  const handleConvert = () => {
    // The actual conversion is handled by the VideoConverter component
    // We trigger the conversion by calling the handleConvert function in VideoConverter
    if (selectedFile && videoConverterRef.current) {
      setIsConverting(true);
      // Call the exposed handleConvert method directly
      videoConverterRef.current.handleConvert();
    }
  };

  return (
    <div className="page-layout">
      <Header 
        selectedFile={selectedFile}
        isConverting={isConverting}
        conversionResult={conversionResult}
        onConvert={handleConvert}
        onDownload={handleDownload}
        activeConverter="video"
      />
      {!isMobile && <LeftSidebar />}
      <main className="main-area">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">Video Studio</h1>
            <p className="page-subtitle">Transform your videos with professional-grade processing tools.</p>
          </div>
          
          {/* Toast Notification */}
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
          
          {/* Upload Section - Visible only when no file is selected */}
          {!selectedFile && (
            <div 
              className={`premium-upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const file = files[0];
                  if (file.type.startsWith('video/')) {
                    handleFileSelect(file);
                  }
                }
              }}
            >
              <div className="upload-icon">🎬</div>
              <h3>Select Video</h3>
              <p>Drag and drop video here or click to browse</p>
              <button className="premium-button primary" onClick={() => document.getElementById('file-input').click()}>
                Browse Files
              </button>
              <div className="format-pills">
                {['MP4', 'AVI', 'MOV', 'MKV', 'WMV', 'FLV'].map(fmt => (
                  <span key={fmt} className="format-pill">{fmt}</span>
                ))}
              </div>
            </div>
          )}
          
          <VideoConverter 
            ref={videoConverterRef}
            onConversionComplete={handleConversionComplete} 
            selectedFile={selectedFile}
          />
        </div>
      </main>
      {!isMobile && (
        <RightSidebar 
          activeConverter="video" 
          conversionResult={conversionResult}
          onDownload={handleDownload}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />
      )}
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