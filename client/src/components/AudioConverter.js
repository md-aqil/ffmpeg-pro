import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  uploadFile, 
  getSupportedAudioFormats, 
  convertAudioFile, 
  extractAudioFromVideo, 
  trimAudioFile, 
  mixAudioFiles, 
  applyAudioEffects
} from '../services/api';
import './AudioConverter.css';

const AudioConverter = forwardRef(({ onConversionComplete, selectedFiles, onStatusUpdate }, ref) => {
  const [fileIds, setFileIds] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [quality, setQuality] = useState('medium');
  const [bitrate, setBitrate] = useState('');
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [, setConvertedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('convert'); // convert, extract, trim, mix, effects
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [volume, setVolume] = useState('');
  const [fadeIn, setFadeIn] = useState('');
  const [fadeOut, setFadeOut] = useState('');

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getUploadStatus: () => uploadStatus,
    getConversionStatus: () => conversionStatus,
    handleConvert: () => {
      if (activeTab === 'convert') {
        handleConvert();
      } else if (activeTab === 'extract') {
        handleExtract();
      } else if (activeTab === 'trim') {
        handleTrim();
      } else if (activeTab === 'mix') {
        handleMix();
      } else if (activeTab === 'effects') {
        handleApplyEffects();
      }
    }
  }));

  // Listen for custom event to trigger conversion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleTriggerConvert = (event) => {
      if (event.detail.action === 'convert') {
        // Trigger the appropriate conversion based on the active tab
        if (activeTab === 'convert') {
          handleConvert();
        } else if (activeTab === 'extract') {
          handleExtract();
        } else if (activeTab === 'trim') {
          handleTrim();
        } else if (activeTab === 'mix') {
          handleMix();
        } else if (activeTab === 'effects') {
          handleApplyEffects();
        }
      }
    };

    window.addEventListener('triggerConvert', handleTriggerConvert);
    return () => {
      window.removeEventListener('triggerConvert', handleTriggerConvert);
    };
  }, [activeTab, fileIds, fileNames, outputFormat, quality, bitrate, startTime, duration, volume, fadeIn, fadeOut]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusUpdate) {
      onStatusUpdate(uploadStatus, conversionStatus);
    }
  }, [uploadStatus, conversionStatus, onStatusUpdate]);

  // Fetch supported formats on component mount
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const response = await getSupportedAudioFormats();
        if (response.success) {
          setSupportedFormats(response.output);
        }
      } catch (error) {
        console.error('Error fetching supported audio formats:', error);
        setUploadStatus({
          type: 'error',
          message: 'Failed to fetch supported audio formats'
        });
      }
    };

    fetchFormats();
  }, []);

  // Handle file selection and auto-upload
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  }, [selectedFiles]);

  const handleFileUpload = async (filesToUpload) => {
    try {
      setUploadStatus({ type: 'uploading', message: `Uploading ${filesToUpload.length} file(s)...` });
      
      const uploadedFileIds = [];
      const uploadedFileNames = [];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const response = await uploadFile(file);
        
        if (response.success) {
          uploadedFileIds.push(response.fileId);
          uploadedFileNames.push(response.fileName);
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      }
      
      setFileIds(uploadedFileIds);
      setFileNames(uploadedFileNames);
      
      setUploadStatus({
        type: 'success',
        message: `${filesToUpload.length} file(s) uploaded successfully`
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Upload failed: ' + error.message
      });
    }
  };

  const handleConvert = async () => {
    if (fileIds.length === 0) {
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
      
      const response = await convertAudioFile(fileIds[0], fileNames[0], outputFormat, quality, bitrate);
      
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

  const handleExtract = async () => {
    if (fileIds.length === 0) {
      setConversionStatus({
        type: 'error',
        message: 'Please upload a video file first'
      });
      return;
    }
    
    try {
      setIsConverting(true);
      setConversionStatus({ type: 'converting', message: 'Extracting audio...' });
      setProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const response = await extractAudioFromVideo(fileIds[0], fileNames[0], outputFormat);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setConvertedFile(response.extractedFile);
        setConversionStatus({
          type: 'success',
          message: 'Audio extracted successfully!'
        });
        
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.extractedFile);
        }
      } else {
        setConversionStatus({
          type: 'error',
          message: response.error || 'Extraction failed'
        });
      }
    } catch (error) {
      setIsConverting(false);
      setConversionStatus({
        type: 'error',
        message: 'Extraction failed: ' + error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleTrim = async () => {
    if (fileIds.length === 0) {
      setConversionStatus({
        type: 'error',
        message: 'Please upload a file first'
      });
      return;
    }
    
    if (!startTime || !duration) {
      setConversionStatus({
        type: 'error',
        message: 'Please enter start time and duration'
      });
      return;
    }
    
    try {
      setIsConverting(true);
      setConversionStatus({ type: 'converting', message: 'Trimming audio...' });
      setProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const response = await trimAudioFile(fileIds[0], fileNames[0], parseFloat(startTime), parseFloat(duration));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setConvertedFile(response.trimmedFile);
        setConversionStatus({
          type: 'success',
          message: 'Audio trimmed successfully!'
        });
        
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.trimmedFile);
        }
      } else {
        setConversionStatus({
          type: 'error',
          message: response.error || 'Trimming failed'
        });
      }
    } catch (error) {
      setIsConverting(false);
      setConversionStatus({
        type: 'error',
        message: 'Trimming failed: ' + error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleMix = async () => {
    if (fileIds.length < 2) {
      setConversionStatus({
        type: 'error',
        message: 'Please upload at least two audio files for mixing'
      });
      return;
    }
    
    try {
      setIsConverting(true);
      setConversionStatus({ type: 'converting', message: 'Mixing audio files...' });
      setProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const response = await mixAudioFiles(fileIds, fileNames, outputFormat);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setConvertedFile(response.mixedFile);
        setConversionStatus({
          type: 'success',
          message: 'Audio files mixed successfully!'
        });
        
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.mixedFile);
        }
      } else {
        setConversionStatus({
          type: 'error',
          message: response.error || 'Mixing failed'
        });
      }
    } catch (error) {
      setIsConverting(false);
      setConversionStatus({
        type: 'error',
        message: 'Mixing failed: ' + error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleApplyEffects = async () => {
    if (fileIds.length === 0) {
      setConversionStatus({
        type: 'error',
        message: 'Please upload a file first'
      });
      return;
    }
    
    const effects = {};
    if (volume) effects.volume = parseFloat(volume);
    if (fadeIn) effects.fadeIn = parseFloat(fadeIn);
    if (fadeOut) effects.fadeOut = parseFloat(fadeOut);
    
    if (Object.keys(effects).length === 0) {
      setConversionStatus({
        type: 'error',
        message: 'Please specify at least one effect'
      });
      return;
    }
    
    try {
      setIsConverting(true);
      setConversionStatus({ type: 'converting', message: 'Applying audio effects...' });
      setProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      const response = await applyAudioEffects(fileIds[0], fileNames[0], effects);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success) {
        setConvertedFile(response.effectedFile);
        setConversionStatus({
          type: 'success',
          message: 'Audio effects applied successfully!'
        });
        
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.effectedFile);
        }
      } else {
        setConversionStatus({
          type: 'error',
          message: response.error || 'Applying effects failed'
        });
      }
    } catch (error) {
      setIsConverting(false);
      setConversionStatus({
        type: 'error',
        message: 'Applying effects failed: ' + error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="audio-converter-card glass-panel">
      {/* Tab Navigation */}
      <div className="premium-tabs">
        {[
          { id: 'convert', label: 'Convert', icon: '🔄' },
          { id: 'extract', label: 'Extract', icon: '🔈' },
          { id: 'trim', label: 'Trim', icon: '✂️' },
          { id: 'mix', label: 'Mix', icon: '🎚️' },
          { id: 'effects', label: 'Effects', icon: '✨' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`premium-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {fileIds.length > 0 && (
        <div className="converter-grid">
          {/* Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">
              {activeTab === 'convert' && 'Audio Conversion'}
              {activeTab === 'extract' && 'Audio Extraction'}
              {activeTab === 'trim' && 'Audio Trimming'}
              {activeTab === 'mix' && 'Audio Mixing'}
              {activeTab === 'effects' && 'Audio Effects'}
            </h3>
            
            <div className="options-grid">
              {activeTab === 'convert' && (
                <>
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
                    <label>Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="premium-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="option-item full-width">
                    <label>Bitrate (optional)</label>
                    <input
                      type="text"
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                      placeholder="e.g., 128k, 320k"
                      className="premium-input"
                    />
                  </div>
                </>
              )}

              {activeTab === 'extract' && (
                <div className="option-item full-width">
                  <label>Extraction Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="premium-select"
                  >
                    {supportedFormats.map(format => (
                      <option key={format} value={format}>{format.toUpperCase()}</option>
                    ))}
                  </select>
                  <p className="helper-text">This will extract the high-quality audio stream from your video file.</p>
                </div>
              )}

              {activeTab === 'trim' && (
                <>
                  <div className="option-item">
                    <label>Start Time (s)</label>
                    <input
                      type="number"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="0"
                      className="premium-input"
                    />
                  </div>
                  <div className="option-item">
                    <label>Duration (s)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Length"
                      className="premium-input"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mix' && (
                <div className="option-item full-width">
                  <label>Mixing Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="premium-select"
                  >
                    {supportedFormats.map(format => (
                      <option key={format} value={format}>{format.toUpperCase()}</option>
                    ))}
                  </select>
                  <p className="helper-text">Mixing {fileIds.length} uploaded files into a single track.</p>
                </div>
              )}

              {activeTab === 'effects' && (
                <>
                  <div className="option-item">
                    <label>Volume (0-10)</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="1.0"
                      step="0.1"
                      className="premium-input"
                    />
                  </div>
                  <div className="option-item">
                    <label>Fade In (s)</label>
                    <input
                      type="number"
                      value={fadeIn}
                      onChange={(e) => setFadeIn(e.target.value)}
                      placeholder="0"
                      className="premium-input"
                    />
                  </div>
                  <div className="option-item">
                    <label>Fade Out (s)</label>
                    <input
                      type="number"
                      value={fadeOut}
                      onChange={(e) => setFadeOut(e.target.value)}
                      placeholder="0"
                      className="premium-input"
                    />
                  </div>
                </>
              )}
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
                    <span>Processing...</span>
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
            <div className="metadata-list">
              {fileNames.map((name, idx) => (
                <div key={idx} className="meta-row">
                  <span>File {idx + 1}</span>
                  <span className="value">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AudioConverter;
