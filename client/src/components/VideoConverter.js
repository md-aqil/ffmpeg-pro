import React, { useState, useEffect } from 'react';
import { uploadFile, getSupportedFormats, convertFile, downloadFile, getFileMetadata } from '../services/api';
import './VideoConverter.css';

const VideoConverter = ({ onConversionComplete, selectedFile }) => {
  const [fileId, setFileId] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [manualBitrate, setManualBitrate] = useState('');
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileMetadata, setFileMetadata] = useState(null);

  // Fetch supported formats on component mount
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const response = await getSupportedFormats();
        if (response.success) {
          setSupportedFormats(response.output);
        }
      } catch (error) {
        console.error('Error fetching supported formats:', error);
        setUploadStatus({
          type: 'error',
          message: 'Failed to fetch supported formats'
        });
      }
    };

    fetchFormats();
  }, []);

  // Handle file selection and auto-upload
  useEffect(() => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [selectedFile]);

  const handleFileUpload = async (fileToUpload) => {
    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading file...' });
      
      const response = await uploadFile(fileToUpload);
      
      if (response.success) {
        setFileId(response.fileId);
        setFileName(response.fileName);
        
        // Fetch file metadata
        try {
          const metadataResponse = await getFileMetadata(response.fileId);
          if (metadataResponse.success) {
            setFileMetadata(metadataResponse.metadata);
          }
        } catch (metadataError) {
          console.error('Error fetching file metadata:', metadataError);
        }
        
        setUploadStatus({
          type: 'success',
          message: `File uploaded successfully: ${response.fileName}`
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: response.error || 'Upload failed'
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Upload failed: ' + error.message
      });
    }
  };

  const handleConvert = async () => {
    if (!fileId) {
      setConversionStatus({
        type: 'error',
        message: 'Please upload a file first'
      });
      return;
    }
    
    try {
      setIsConverting(true);
      setConversionStatus({ type: 'converting', message: 'Converting file...' });
      setProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const response = await convertFile(fileId, fileName, outputFormat, quality, width, height, manualBitrate);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setConvertedFile(response.convertedFile);
        setConversionStatus({
          type: 'success',
          message: 'File converted successfully!'
        });
        
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.convertedFile);
        }
      } else {
        setConversionStatus({
          type: 'error',
          message: response.error || 'Conversion failed'
        });
      }
    } catch (error) {
      setIsConverting(false);
      setConversionStatus({
        type: 'error',
        message: 'Conversion failed: ' + error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = '';
    if (hrs > 0) result += `${hrs}:`;
    result += `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return result;
  };

  // Get video metadata for display
  const getVideoMetadataDisplay = () => {
    if (!fileMetadata || !fileMetadata.format) return null;
    
    const format = fileMetadata.format;
    const videoStream = fileMetadata.streams?.find(stream => stream.codec_type === 'video');
    const audioStream = fileMetadata.streams?.find(stream => stream.codec_type === 'audio');
    
    return {
      duration: format.duration ? formatDuration(parseFloat(format.duration)) : 'Unknown',
      size: format.size ? formatFileSize(format.size) : 'Unknown',
      bitrate: format.bit_rate ? `${Math.round(parseInt(format.bit_rate) / 1000)} kbps` : 'Unknown',
      videoCodec: videoStream ? videoStream.codec_name : 'Unknown',
      resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'Unknown',
      audioCodec: audioStream ? audioStream.codec_name : 'None',
      sampleRate: audioStream ? `${audioStream.sample_rate} Hz` : 'None'
    };
  };

  const metadataDisplay = getVideoMetadataDisplay();

  return (
    <section className="video-converter">
      <div className="converter-container">
      
     
          <div className="">
            
            {/* Conversion Options */}
            {fileId && (
              <div className="conversion-options">
                <div className="option-group">
                  <label htmlFor="format-select">Output Format:</label>
                  <select
                    id="format-select"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="option-select"
                  >
                    {supportedFormats.map(format => (
                      <option key={format} value={format}>{format.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                
                <div className="option-group">
                  <label htmlFor="quality-select">Quality:</label>
                  <select
                    id="quality-select"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="option-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label htmlFor="width-input">Width (optional):</label>
                  <input
                    id="width-input"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="option-input"
                    placeholder="Enter width"
                  />
                </div>
                
                <div className="option-group">
                  <label htmlFor="height-input">Height (optional):</label>
                  <input
                    id="height-input"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="option-input"
                    placeholder="Enter height"
                  />
                </div>

                <div className="option-group">
                  <label htmlFor="bitrate-input">Bitrate (optional):</label>
                  <input
                    id="bitrate-input"
                    type="number"
                    value={manualBitrate}
                    onChange={(e) => setManualBitrate(e.target.value)}
                    className="option-input"
                    placeholder="Enter bitrate in kbps"
                  />
                </div>
                
                <button
                  className={`convert-button ${isConverting ? 'converting' : ''}`}
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? 'Converting...' : 'Convert Video'}
                </button>
                
                {/* Progress Bar */}
                {isConverting && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Left column - File Details */}
          <div className="">
            {fileId && metadataDisplay && (
              <div className="file-preview">
                <h3>File Information</h3>
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <span className="metadata-label">Duration:</span>
                    <span className="metadata-value">{metadataDisplay.duration}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">File Size:</span>
                    <span className="metadata-value">{metadataDisplay.size}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Bitrate:</span>
                    <span className="metadata-value">{metadataDisplay.bitrate}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Video Codec:</span>
                    <span className="metadata-value">{metadataDisplay.videoCodec}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Resolution:</span>
                    <span className="metadata-value">{metadataDisplay.resolution}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Audio Codec:</span>
                    <span className="metadata-value">{metadataDisplay.audioCodec}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Sample Rate:</span>
                    <span className="metadata-value">{metadataDisplay.sampleRate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Center column - Conversion Status and Options */}
          <div className="">
            {/* Upload Status */}
            {uploadStatus && (
              <div className={`status-message ${uploadStatus.type}`}>
                {uploadStatus.message}
              </div>
            )}
            
            {/* Conversion Status */}
            {conversionStatus && (
              <div className={`status-message ${conversionStatus.type}`}>
                {conversionStatus.message}
              </div>
            )}
            
            {selectedFile && (
              <div className="selected-file-info">
                <p><strong>Selected File:</strong> {selectedFile.name}</p>
              </div>
            )}
          </div>
          
       
        </div>
    </section>
  );
};

export default VideoConverter;