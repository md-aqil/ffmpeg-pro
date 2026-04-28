import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { uploadFile, getSupportedFormats, convertFile, getFileMetadata } from '../services/api';
import './VideoConverter.css';

const VideoConverter = forwardRef(({ onConversionComplete, selectedFile }, ref) => {
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
  const [, setConvertedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileMetadata, setFileMetadata] = useState(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleConvert: handleConvert
  }));

  // Listen for custom event to trigger conversion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleTriggerConvert = (event) => {
      if (event.detail.action === 'convert') {
        handleConvert();
      }
    };

    window.addEventListener('triggerConvert', handleTriggerConvert);
    return () => {
      window.removeEventListener('triggerConvert', handleTriggerConvert);
    };
  }, [fileId, fileName, outputFormat, quality, width, height, manualBitrate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time progress updates via SSE
  useEffect(() => {
    if (!isConverting || !fileId) return;

    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
    const eventSource = new EventSource(`${API_BASE_URL}/progress/${fileId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          setProgress(Math.round(data.percent));
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isConverting, fileId]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      const response = await convertFile(fileId, fileName, outputFormat, quality, width, height, manualBitrate);
      
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
    <div className="video-converter-card glass-panel">
      {selectedFile && (
        <div className="converter-grid">
          {/* Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">Conversion Settings</h3>
            
            <div className="options-grid">
              <div className="option-item">
                <label>Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="premium-select"
                >
                  {supportedFormats.map(format => (
                    <option key={format} value={format}>{format.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="option-item">
                <label>Preset Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="premium-select"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (High Quality)</option>
                  <option value="ultra">Ultra (Original/Best)</option>
                </select>
              </div>

              <div className="option-item">
                <label>Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Auto"
                  className="premium-input"
                />
              </div>

              <div className="option-item">
                <label>Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Auto"
                  className="premium-input"
                />
              </div>

              <div className="option-item full-width">
                <label>Manual Bitrate (kbps)</label>
                <input
                  type="number"
                  value={manualBitrate}
                  onChange={(e) => setManualBitrate(e.target.value)}
                  placeholder="Keep Original"
                  className="premium-input"
                />
              </div>
            </div>

            <div className="status-container">
              {uploadStatus && uploadStatus.type !== 'success' && (
                <div className={`status-pill ${uploadStatus.type}`}>
                  {uploadStatus.message}
                </div>
              )}
              
              {conversionStatus && (
                <div className={`status-pill ${conversionStatus.type}`}>
                  {conversionStatus.message}
                </div>
              )}

              {isConverting && (
                <div className="progress-wrapper">
                  <div className="progress-label">
                    <span>Converting...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="premium-progress-bg">
                    <div className="premium-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <h3 className="section-title">File Details</h3>
            
            {metadataDisplay ? (
              <div className="metadata-list">
                <div className="meta-row">
                  <span>Name</span>
                  <span className="value">{selectedFile.name}</span>
                </div>
                <div className="meta-row">
                  <span>Duration</span>
                  <span className="value">{metadataDisplay.duration}</span>
                </div>
                <div className="meta-row">
                  <span>Format</span>
                  <span className="value">{metadataDisplay.videoCodec.toUpperCase()} / {outputFormat.toUpperCase()}</span>
                </div>
                <div className="meta-row">
                  <span>Resolution</span>
                  <span className="value">{metadataDisplay.resolution}</span>
                </div>
                <div className="meta-row">
                  <span>Size</span>
                  <span className="value">{metadataDisplay.size}</span>
                </div>
                <div className="meta-row">
                  <span>Audio</span>
                  <span className="value">{metadataDisplay.audioCodec}</span>
                </div>
              </div>
            ) : (
              <div className="metadata-loading">
                <div className="spinner"></div>
                <p>Analyzing video...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoConverter;
