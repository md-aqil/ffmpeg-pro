import React, { useState, useEffect } from 'react';
import './RightSidebar.css';

const RightSidebar = ({ activeConverter, conversionResult, onDownload, onFileSelect, onFilesSelect, selectedFile, selectedFiles, isDragOver, setIsDragOver }) => {
  const [localConversionResult, setLocalConversionResult] = useState(null);

  // This would be updated by the parent component when a conversion completes
  useEffect(() => {
    if (conversionResult) {
      setLocalConversionResult(conversionResult);
    }
  }, [conversionResult]);

  const handleDownload = () => {
    if (onDownload && localConversionResult) {
      onDownload(localConversionResult);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      if (activeConverter === 'audio') {
        // For audio, we can accept multiple files
        if (onFilesSelect) {
          onFilesSelect(files);
        }
      } else if (activeConverter === 'image' || activeConverter === 'video') {
        // For image/video, we only accept the first file
        const file = files[0];
        if (file && onFileSelect) {
          onFileSelect(file);
        }
      }
    }
  };

  return (

     
    <aside className="sidebar-right">
     
      
          {/* Upload Section - Show for image, video, and audio converters */}
          {(activeConverter === 'image' || activeConverter === 'video' || activeConverter === 'audio') && (
            <div
              className={`upload-section upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
             
              <h3>
                {activeConverter === 'image' && 'Upload Image'}
                {activeConverter === 'video' && 'Upload Video'}
                {activeConverter === 'audio' && 'Upload Audio'}
              </h3>
              
              {(selectedFile || (selectedFiles && selectedFiles.length > 0)) ? (
                <div className="file-info">
                  {activeConverter === 'audio' && selectedFiles && selectedFiles.length > 0 ? (
                    <>
                      <p><strong>Selected Files ({selectedFiles.length}):</strong></p>
                      <ul>
                        {selectedFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p><strong>Selected File:</strong> {selectedFile.name}</p>
                      <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                      <p><strong>Type:</strong> {selectedFile.type}</p>
                      {activeConverter === 'image' && (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                        />
                      )}
                    </>
                  )}
                  <button onClick={() => document.getElementById('file-input').click()}>
                    Choose Different File{activeConverter === 'audio' ? 's' : ''}
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    {activeConverter === 'image' && 'Drag & drop your image here'}
                    {activeConverter === 'video' && 'Drag & drop your video here'}
                    {activeConverter === 'audio' && 'Drag & drop your audio files here'}
                  </p>
                  <p>OR</p>

                  <button className='upload-title' onClick={() => document.getElementById('file-input').click()}>
                    Browse File{activeConverter === 'audio' ? 's' : ''}
                  </button>

                  <p className="file-types-info">
                    {activeConverter === 'image' && 'Supported formats: JPG, PNG, WEBP, GIF, BMP, TIFF'}
                    {activeConverter === 'video' && 'Supported formats: MP4, AVI, MOV, MKV, WMV, FLV'}
                    {activeConverter === 'audio' && 'Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A'}
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Result Section */}
          {localConversionResult && (
            <div className="result-section">
              <h3>Conversion Result</h3>
              <p>File processed successfully!</p>
              <div className="result-details">
                <p><strong>Filename:</strong> {localConversionResult.filename}</p>
                {localConversionResult.filesize && (
                  <p><strong>Size:</strong> {localConversionResult.filesize}</p>
                )}
              </div>
              <button 
                className="download-button"
                onClick={handleDownload}
              >
                Download Result
              </button>
            </div>
          )}
          
          {/* Show a message when there's no result yet */}
          {!localConversionResult && (
            <div className="no-result">
              <p>Convert a file to see the result here</p>
            </div>
          )}
      
   
    </aside>
  );
};

export default RightSidebar;