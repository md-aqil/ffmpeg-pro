import React, { useState, useRef, useEffect } from 'react';
import ImageConverter from '../components/ImageConverter';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import '../components/layout.css';

const ImagePage = () => {
  const [conversionResult, setConversionResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const imageConverterRef = useRef(null);

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
    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      // Show error toast
      setToast({ message: 'Please select a valid image file', type: 'error' });
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
    // The actual conversion is handled by the ImageConverter component
    // We trigger the conversion by calling the handleConvert function in ImageConverter
    if (selectedFile && imageConverterRef.current) {
      setIsConverting(true);
      // Call the exposed handleConvert method directly
      imageConverterRef.current.handleConvert();
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
        activeConverter="image"
      />
      {!isMobile && <LeftSidebar />}
      <div className="converter-content main-area">
        <div className="toolbar" bis_skin_checked="1">
          <div className="toolbar-left" bis_skin_checked="1">
            {/* Static notification removed - now using Toast */}
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
        
        <h4 className='text-center my-6'>Image Converter</h4>
        
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
                const file = files[0];
                if (file.type.startsWith('image/')) {
                  handleFileSelect(file);
                }
              }
            }}
          >
            <h3>Upload Image</h3>
            <p>Drag & drop your image here</p>
            <p>OR</p>
            <button onClick={() => document.getElementById('file-input').click()}>
              Browse File
            </button>
            <p className="file-types-info">
              Supported formats: JPG, PNG, WEBP, GIF, BMP, TIFF
            </p>
          </div>
        )}
        
        <ImageConverter 
          ref={imageConverterRef}
          onConversionComplete={handleConversionComplete} 
          selectedFile={selectedFile}
        />
      </div>
      {!isMobile && (
        <RightSidebar 
          activeConverter="image" 
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
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImagePage;