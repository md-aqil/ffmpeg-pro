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
      const response = await fetch(`http://localhost:3001/api/download/${conversionResult.filename}`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = conversionResult.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
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
        isConverting={false} // This would need to be passed from AudioConverter in a real implementation
        conversionResult={conversionResult}
        onConvert={handleConvert}
        onDownload={handleDownload}
      />
      {!isMobile && <LeftSidebar />}
      <div className="converter-content main-area">
        <div className="toolbar" bis_skin_checked="1">
          <div className="toolbar-left" bis_skin_checked="1">
            <div className="tool-group" bis_skin_checked="1">
              <div className="tool-btn" bis_skin_checked="1">
                <i className="ti ti-arrow-back-up"></i>
              </div>
              <div className="tool-btn" bis_skin_checked="1">
                <i className="ti ti-arrow-forward-up"></i>
              </div>
            </div>
            <div className="tool-separator" bis_skin_checked="1"></div>
            {/* Status message replaced with Toast */}
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

        <h4 className='text-center my-6'>Audio Converter</h4>
        
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
            className={`upload-section-main ${isDragOver ? 'drag-over' : ''}`}
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
            <h3>Upload Audio</h3>
            <p>Drag & drop your audio files here</p>
            <p>OR</p>
            <button onClick={() => document.getElementById('file-input').click()}>
              Browse Files
            </button>
            <p className="file-types-info">
              Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A
            </p>
          </div>
        )}
        
        <AudioConverter 
          ref={audioConverterRef}
          onConversionComplete={handleConversionComplete} 
          selectedFiles={selectedFiles}
          onStatusUpdate={(upload, conversion) => {
            // Show toast notifications for status updates
            if (upload && upload.message) {
              setToast({ message: upload.message, type: upload.type || 'info' });
            }
            if (conversion && conversion.message) {
              setToast({ message: conversion.message, type: conversion.type || 'info' });
            }
          }}
        />
      </div>
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