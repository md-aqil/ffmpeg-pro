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
  const [convertedFile, setConvertedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('convert'); // convert, extract, trim, mix, effects
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [volume, setVolume] = useState('');
  const [fadeIn, setFadeIn] = useState('');
  const [fadeOut, setFadeOut] = useState('');

  // Expose status for parent component to use in toolbar
  useImperativeHandle(ref, () => ({
    getUploadStatus: () => uploadStatus,
    getConversionStatus: () => conversionStatus
  }));

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
    <section className="audio-converter">
      <div className="converter-container">
        <h2>Audio Converter</h2>
        
        {/* Tab Navigation */}
        <div className="tab-navigation tool-group normal-text">
          <button 
            className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`}
            onClick={() => setActiveTab('convert')}
          >
            Convert
          </button>
          <button 
            className={`tab-button ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => setActiveTab('extract')}
          >
            Extract
          </button>
          <button 
            className={`tab-button ${activeTab === 'trim' ? 'active' : ''}`}
            onClick={() => setActiveTab('trim')}
          >
            Trim
          </button>
          <button 
            className={`tab-button ${activeTab === 'mix' ? 'active' : ''}`}
            onClick={() => setActiveTab('mix')}
          >
            Mix
          </button>
          <button 
            className={`tab-button ${activeTab === 'effects' ? 'active' : ''}`}
            onClick={() => setActiveTab('effects')}
          >
            Effects
          </button>
        </div>
        
        <div className="converter-layout">
          {/* Left column - File Details */}
          
          
          



          

          
          {/* Center column - Conversion Status and Options */}
          <div className="layout-column layout-column-center">
            {/* Upload Status */}
            
            

            
            

            
            

          </div>
          
          {/* Right column - Conversion Options */}
          <div className="layout-column layout-column-right">
            {fileIds.length > 0 && (
              <div className="conversion-options">
                {/* Convert Tab */}
                {activeTab === 'convert' && (
                  <>
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
                      </select>
                    </div>
                    
                    <div className="option-group">
                      <label htmlFor="bitrate-input">Bitrate (optional):</label>
                      <input
                        id="bitrate-input"
                        type="text"
                        value={bitrate}
                        onChange={(e) => setBitrate(e.target.value)}
                        className="option-input"
                        placeholder="e.g., 128k, 320k"
                      />
                    </div>
                    
                    <button
                      className={`convert-button ${isConverting ? 'converting' : ''}`}
                      onClick={handleConvert}
                      disabled={isConverting}
                    >
                      {isConverting ? 'Converting...' : 'Convert Audio'}
                    </button>
                  </>
                )}
                
                {/* Extract Tab */}
                {activeTab === 'extract' && (
                  <>
                    <div className="option-group">
                      <label htmlFor="extract-format-select">Output Format:</label>
                      <select
                        id="extract-format-select"
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="option-select"
                      >
                        {supportedFormats.map(format => (
                          <option key={format} value={format}>{format.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      className={`convert-button ${isConverting ? 'converting' : ''}`}
                      onClick={handleExtract}
                      disabled={isConverting}
                    >
                      {isConverting ? 'Extracting...' : 'Extract Audio'}
                    </button>
                  </>
                )}
                
                {/* Trim Tab */}
                {activeTab === 'trim' && (
                  <>
                    <div className="option-group">
                      <label htmlFor="start-time-input">Start Time (seconds):</label>
                      <input
                        id="start-time-input"
                        type="number"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="option-input"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="option-group">
                      <label htmlFor="duration-input">Duration (seconds):</label>
                      <input
                        id="duration-input"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="option-input"
                        placeholder="Enter duration"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    
                    <button
                      className={`convert-button ${isConverting ? 'converting' : ''}`}
                      onClick={handleTrim}
                      disabled={isConverting}
                    >
                      {isConverting ? 'Trimming...' : 'Trim Audio'}
                    </button>
                  </>
                )}
                
                {/* Mix Tab */}
                {activeTab === 'mix' && (
                  <>
                    <div className="option-group">
                      <p className="instruction-text">
                        Select two or more audio files to mix together. The files will be combined into a single audio track.
                      </p>
                    </div>
                    
                    <div className="option-group">
                      <label htmlFor="mix-format-select">Output Format:</label>
                      <select
                        id="mix-format-select"
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="option-select"
                      >
                        {supportedFormats.map(format => (
                          <option key={format} value={format}>{format.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      className={`convert-button ${isConverting ? 'converting' : ''}`}
                      onClick={handleMix}
                      disabled={isConverting}
                    >
                      {isConverting ? 'Mixing...' : 'Mix Audio Files'}
                    </button>
                  </>
                )}
                
                {/* Effects Tab */}
                {activeTab === 'effects' && (
                  <>
                    <div className="option-group">
                      <label htmlFor="volume-input">Volume (0.0 - 10.0):</label>
                      <input
                        id="volume-input"
                        type="number"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="option-input"
                        placeholder="1.0 (normal)"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="option-group">
                      <label htmlFor="fade-in-input">Fade In (seconds):</label>
                      <input
                        id="fade-in-input"
                        type="number"
                        value={fadeIn}
                        onChange={(e) => setFadeIn(e.target.value)}
                        className="option-input"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="option-group">
                      <label htmlFor="fade-out-input">Fade Out (seconds):</label>
                      <input
                        id="fade-out-input"
                        type="number"
                        value={fadeOut}
                        onChange={(e) => setFadeOut(e.target.value)}
                        className="option-input"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <button
                      className={`convert-button ${isConverting ? 'converting' : ''}`}
                      onClick={handleApplyEffects}
                      disabled={isConverting}
                    >
                      {isConverting ? 'Applying...' : 'Apply Effects'}
                    </button>
                  </>
                )}
                
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
        </div>
      </div>
    </section>
  );
});

export default AudioConverter;