import React, { useState, useRef, useEffect } from 'react';
import AudioConverter from '../components/AudioConverter';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import '../components/layout.css';

const AudioPage = () => {
  const [conversionResult, setConversionResult] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(null);
  const fileInputRef = useRef(null);
  const audioConverterRef = useRef(null);

  const handleConversionComplete = (result) => {
    setConversionResult(result);
  };

  const handleFilesSelect = (files) => {
    // Filter for audio/video files only
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      // Handle error - you might want to show this in the UI
      console.error('Some files were not valid audio/video files');
    }
    
    setSelectedFiles(validFiles);
  };

  const handleDownload = async (result) => {
    try {
      await fetch(`http://localhost:3001/api/download/${result.filename}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Get status updates from AudioConverter
  useEffect(() => {
    // This would be called when we need to refresh status
    // In a real implementation, we would use callbacks instead of polling
  }, []);

  const renderStatusMessage = () => {
    // Use the status from state (passed up from child component)
    const status = uploadStatus || conversionStatus;
    if (!status) return null;
    
    let statusClass = 'tool-group normal-text';
    if (status.type === 'success') statusClass += ' success';
    if (status.type === 'error') statusClass += ' error';
    if (status.type === 'uploading' || status.type === 'converting') statusClass += ' uploading';
    
    return (
      <div className={statusClass} bis_skin_checked="1">
        <i className={`ti ${status.type === 'success' ? 'ti-tick' : status.type === 'error' ? 'ti-alert-circle' : 'ti-loader'}`}></i> 
        {status.message}
      </div>
    );
  };

  return (
    <div className="page-layout">
      <LeftSidebar />
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
            {renderStatusMessage()}
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
        <AudioConverter 
          ref={audioConverterRef}
          onConversionComplete={handleConversionComplete} 
          selectedFiles={selectedFiles}
          onStatusUpdate={(upload, conversion) => {
            setUploadStatus(upload);
            setConversionStatus(conversion);
          }}
        />
      </div>
      <RightSidebar 
        activeConverter="audio" 
        conversionResult={conversionResult}
        onDownload={handleDownload}
        onFilesSelect={handleFilesSelect}
        selectedFiles={selectedFiles}
        isDragOver={isDragOver}
        setIsDragOver={setIsDragOver}
      />
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