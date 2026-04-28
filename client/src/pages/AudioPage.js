import React, { useState, useRef, useEffect } from 'react';
import AudioConverter from '../components/AudioConverter';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import '../components/layout.css';

const AudioPage = () => {
  const [conversionResult, setConversionResult] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const audioConverterRef = useRef(null);

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
  };

  const handleFilesSelect = (files) => {
    // Filter for audio/video files only
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      // Show error toast
      setToast({ message: 'Some files were not valid audio/video files', type: 'error' });
    }
    
    setSelectedFiles(validFiles);
    // Reset conversion result when new files are selected
    setConversionResult(null);
    
    // Show success toast
    if (validFiles.length > 0) {
      setToast({ 
        message: `${validFiles.length} file(s) uploaded successfully`, 
        type: 'success' 
      });
    }
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
    // The actual conversion is handled by the AudioConverter component
    // We trigger the conversion by calling the handleConvert function in AudioConverter
    if (selectedFiles.length > 0 && audioConverterRef.current) {
      // Call the exposed handleConvert method directly
      audioConverterRef.current.handleConvert();
    }
  };

  // Get status updates from AudioConverter
  useEffect(() => {
    // This would be called when we need to refresh status
    // In a real implementation, we would use callbacks instead of polling
  }, []);

  return (
    <div className="page-layout">
      <Header 
        selectedFile={selectedFiles.length > 0 ? selectedFiles[0] : null}
        isConverting={false}
        conversionResult={conversionResult}
        onConvert={handleConvert}
        onDownload={handleDownload}
        activeConverter="audio"
      />
      {!isMobile && <LeftSidebar />}
      <main className="main-area">
        <div className="content-wrapper">
          <div className="page-header">
            <h1 className="page-title">Audio Studio</h1>
            <p className="page-subtitle">Convert, extract, trim and mix audio with high fidelity.</p>
          </div>
          
          {/* Toast Notification */}
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
          
          {/* Upload Section - Visible only when no files are selected */}
          {selectedFiles.length === 0 && (
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
                  handleFilesSelect(files);
                }
              }}
            >
              <div className="upload-icon">🎵</div>
              <h3>Select Audio</h3>
              <p>Drag and drop audio files here or click to browse</p>
              <button className="premium-button primary" onClick={() => document.getElementById('file-input').click()}>
                Browse Files
              </button>
              <div className="format-pills">
                {['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A'].map(fmt => (
                  <span key={fmt} className="format-pill">{fmt}</span>
                ))}
              </div>
            </div>
          )}
          
          <AudioConverter 
            ref={audioConverterRef}
            onConversionComplete={handleConversionComplete} 
            selectedFiles={selectedFiles}
            onStatusUpdate={(upload, conversion) => {
              if (upload && upload.message && upload.type !== 'success') {
                setToast({ message: upload.message, type: upload.type || 'info' });
              }
              if (conversion && conversion.message && conversion.type === 'success') {
                setToast({ message: conversion.message, type: 'success' });
              }
            }}
          />
        </div>
      </main>
      {!isMobile && (
        <RightSidebar 
          activeConverter="audio" 
          conversionResult={conversionResult}
          onDownload={handleDownload}
          onFilesSelect={handleFilesSelect}
          selectedFiles={selectedFiles}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />
      )}
      <input
        id="file-input"
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesSelect(e.target.files)}
        accept="audio/*,video/*"
        multiple
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AudioPage;