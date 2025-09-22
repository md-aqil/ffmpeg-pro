// client/src/components/ImageConverter.js
import React, { useState, useRef } from 'react';
import './ImageConverter.css';
import {
  convertImageFile,
  resizeImage,
  cropImage,
  applyEffects,
  optimizeImage,
  watermarkImage,
  batchProcessImages,
  applyAdvancedImageEffects
} from '../services/api';

const ImageConverter = ({ onConversionComplete, selectedFile }) => {
  // Removed local selectedFile state since it's now passed as a prop
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('convert');
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Resize states
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  
  // Crop states
  const [cropX, setCropX] = useState('');
  const [cropY, setCropY] = useState('');
  const [cropWidth, setCropWidth] = useState('');
  const [cropHeight, setCropHeight] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  
  // Effects states
  const [selectedEffect, setSelectedEffect] = useState('');
  const [isApplyingEffect, setIsApplyingEffect] = useState(false);
  
  // Advanced effects states
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [isApplyingAdvancedEffects, setIsApplyingAdvancedEffects] = useState(false);
  
  // Optimization states
  const [quality, setQuality] = useState(80);
  const [compressionType, setCompressionType] = useState('lossy');
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Watermark states
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [isApplyingWatermark, setIsApplyingWatermark] = useState(false);
  
  // Removed fileInputRef since file selection is handled by the parent component

  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];

  // Removed drag and drop handlers since file selection is handled by the parent component

  // Updated upload function with better error handling and status updates
  const uploadFile = async (fileToUpload) => {
    try {
      setIsUploading(true);
      setUploadStatus('Uploading file...');
      setError('');

      // Create FormData object
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      // Log upload attempt
      console.log(`Uploading file: ${fileToUpload.name}`);
      
      // Perform upload
      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Parse response
      const uploadData = await uploadResponse.json();
      
      // Check if upload was successful
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }
      
      // Log successful upload
      console.log(`File uploaded successfully. File ID: ${uploadData.fileId}`);
      setUploadStatus('File uploaded successfully');
      
      return uploadData;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || 'An error occurred during file upload');
      setUploadStatus('Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then convert the file
      const response = await convertImageFile(
        uploadData.fileId,
        selectedFile.name,
        targetFormat
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };

  const handleResize = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!resizeWidth && !resizeHeight) {
      setError('Please enter at least one dimension');
      return;
    }

    setIsResizing(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then resize the file
      const response = await resizeImage(
        uploadData.fileId,
        selectedFile.name,
        resizeWidth || -1,
        resizeHeight || -1
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Resize failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during resizing');
    } finally {
      setIsResizing(false);
    }
  };

  const handleCrop = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!cropX || !cropY || !cropWidth || !cropHeight) {
      setError('Please enter all crop dimensions');
      return;
    }

    setIsCropping(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then crop the file
      const response = await cropImage(
        uploadData.fileId,
        selectedFile.name,
        cropX,
        cropY,
        cropWidth,
        cropHeight
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Crop failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during cropping');
    } finally {
      setIsCropping(false);
    }
  };

  const handleApplyEffect = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!selectedEffect) {
      setError('Please select an effect');
      return;
    }

    setIsApplyingEffect(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then apply the effect
      const response = await applyEffects(
        uploadData.fileId,
        selectedFile.name,
        selectedEffect
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Effect application failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during effect application');
    } finally {
      setIsApplyingEffect(false);
    }
  };

  const handleApplyAdvancedEffects = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsApplyingAdvancedEffects(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then apply the advanced effects
      const response = await applyAdvancedImageEffects(
        uploadData.fileId,
        selectedFile.name,
        {
          brightness,
          contrast,
          saturation
        }
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Advanced effects application failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during advanced effects application');
    } finally {
      setIsApplyingAdvancedEffects(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsOptimizing(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then optimize the file
      const response = await optimizeImage(
        uploadData.fileId,
        selectedFile.name,
        quality,
        compressionType
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Optimization failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyWatermark = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (watermarkType === 'text' && !watermarkText) {
      setError('Please enter watermark text');
      return;
    }

    setIsApplyingWatermark(true);
    setError('');

    try {
      // First upload the file
      const uploadData = await uploadFile(selectedFile);

      // Then apply the watermark
      const response = await watermarkImage(
        uploadData.fileId,
        selectedFile.name,
        watermarkType,
        watermarkType === 'text' ? watermarkText : '', // For simplicity, we're only handling text watermarks
        watermarkPosition,
        watermarkOpacity
      );

      if (response.success) {
        // Notify parent component of conversion completion
        if (onConversionComplete) {
          onConversionComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Watermark application failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during watermark application');
    } finally {
      setIsApplyingWatermark(false);
    }
  };

  // Function to handle tab change with animation
  const handleTabChange = (tab) => {
    // Add animation class to content
    const content = document.querySelector('.converter-controls');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        setActiveTab(tab);
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 150);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="image-converter">
      <h2>Image Converter</h2>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`}
          onClick={() => handleTabChange('convert')}
        >
          Convert
        </button>
        <button 
          className={`tab-button ${activeTab === 'resize' ? 'active' : ''}`}
          onClick={() => handleTabChange('resize')}
        >
          Resize
        </button>
        <button 
          className={`tab-button ${activeTab === 'crop' ? 'active' : ''}`}
          onClick={() => handleTabChange('crop')}
        >
          Crop
        </button>
        <button 
          className={`tab-button ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => handleTabChange('effects')}
        >
          Effects
        </button>
        <button 
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => handleTabChange('advanced')}
        >
          Advanced
        </button>
        <button 
          className={`tab-button ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => handleTabChange('optimize')}
        >
          Optimize
        </button>
        <button 
          className={`tab-button ${activeTab === 'watermark' ? 'active' : ''}`}
          onClick={() => handleTabChange('watermark')}
        >
          Watermark
        </button>
      </div>
      

      {error && <div className="error-message">{error}</div>}

      {/* Tab Content */}
      <div className="converter-controls">
        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="control-group">
            <h3>Format Conversion</h3>
            <select 
              value={targetFormat} 
              onChange={(e) => setTargetFormat(e.target.value)}
              disabled={isConverting || isUploading}
            >
              {supportedFormats.map(format => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </select>
            <button 
              onClick={handleConvert} 
              disabled={isConverting || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isConverting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        )}

        {/* Resize Tab */}
        {activeTab === 'resize' && (
          <div className="control-group">
            <h3>Resize Image</h3>
            <div className="input-group">
              <label>Width:</label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => setResizeWidth(e.target.value)}
                placeholder="Width"
                disabled={isResizing || isUploading}
              />
            </div>
            <div className="input-group">
              <label>Height:</label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => setResizeHeight(e.target.value)}
                placeholder="Height"
                disabled={isResizing || isUploading}
              />
            </div>
            <button 
              onClick={handleResize} 
              disabled={isResizing || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isResizing ? 'Resizing...' : 'Resize'}
            </button>
          </div>
        )}

        {/* Crop Tab */}
        {activeTab === 'crop' && (
          <div className="control-group">
            <h3>Crop Image</h3>
            <div className="input-row">
              <div className="input-group">
                <label>X:</label>
                <input
                  type="number"
                  value={cropX}
                  onChange={(e) => setCropX(e.target.value)}
                  placeholder="X"
                  disabled={isCropping || isUploading}
                />
              </div>
              <div className="input-group">
                <label>Y:</label>
                <input
                  type="number"
                  value={cropY}
                  onChange={(e) => setCropY(e.target.value)}
                  placeholder="Y"
                  disabled={isCropping || isUploading}
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Width:</label>
                <input
                  type="number"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(e.target.value)}
                  placeholder="Width"
                  disabled={isCropping || isUploading}
                />
              </div>
              <div className="input-group">
                <label>Height:</label>
                <input
                  type="number"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(e.target.value)}
                  placeholder="Height"
                  disabled={isCropping || isUploading}
                />
              </div>
            </div>
            <button 
              onClick={handleCrop} 
              disabled={isCropping || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isCropping ? 'Cropping...' : 'Crop'}
            </button>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="control-group">
            <h3>Quick Effects</h3>
            <select 
              value={selectedEffect} 
              onChange={(e) => setSelectedEffect(e.target.value)}
              disabled={isApplyingEffect || isUploading}
            >
              <option value="">Select Effect</option>
              <option value="blur">Blur</option>
              <option value="sharpen">Sharpen</option>
              <option value="brightness">Brightness</option>
              <option value="contrast">Contrast</option>
            </select>
            <button 
              onClick={handleApplyEffect} 
              disabled={isApplyingEffect || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isApplyingEffect ? 'Applying...' : 'Apply Effect'}
            </button>
          </div>
        )}

        {/* Advanced Effects Tab */}
        {activeTab === 'advanced' && (
          <div className="control-group">
            <h3>Advanced Effects</h3>
            <div className="slider-group">
              <label>Brightness: {brightness}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                disabled={isApplyingAdvancedEffects || isUploading}
              />
            </div>
            <div className="slider-group">
              <label>Contrast: {contrast}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                disabled={isApplyingAdvancedEffects || isUploading}
              />
            </div>
            <div className="slider-group">
              <label>Saturation: {saturation}</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={saturation}
                onChange={(e) => setSaturation(parseFloat(e.target.value))}
                disabled={isApplyingAdvancedEffects || isUploading}
              />
            </div>
            <button 
              onClick={handleApplyAdvancedEffects} 
              disabled={isApplyingAdvancedEffects || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isApplyingAdvancedEffects ? 'Applying...' : 'Apply Effects'}
            </button>
          </div>
        )}

        {/* Optimize Tab */}
        {activeTab === 'optimize' && (
          <div className="control-group">
            <h3>Optimize Image</h3>
            <div className="input-group">
              <label>Quality: {quality}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isOptimizing || isUploading}
              />
            </div>
            <div className="input-group">
              <label>Compression:</label>
              <select 
                value={compressionType} 
                onChange={(e) => setCompressionType(e.target.value)}
                disabled={isOptimizing || isUploading}
              >
                <option value="lossy">Lossy</option>
                <option value="lossless">Lossless</option>
              </select>
            </div>
            <button 
              onClick={handleOptimize} 
              disabled={isOptimizing || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isOptimizing ? 'Optimizing...' : 'Optimize'}
            </button>
          </div>
        )}

        {/* Watermark Tab */}
        {activeTab === 'watermark' && (
          <div className="control-group">
            <h3>Add Watermark</h3>
            <div className="input-group">
              <label>Type:</label>
              <select 
                value={watermarkType} 
                onChange={(e) => setWatermarkType(e.target.value)}
                disabled={isApplyingWatermark || isUploading}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>
            {watermarkType === 'text' && (
              <div className="input-group">
                <label>Text:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Watermark text"
                  disabled={isApplyingWatermark || isUploading}
                />
              </div>
            )}
            <div className="input-group">
              <label>Position:</label>
              <select 
                value={watermarkPosition} 
                onChange={(e) => setWatermarkPosition(e.target.value)}
                disabled={isApplyingWatermark || isUploading}
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>
            <div className="input-group">
              <label>Opacity: {watermarkOpacity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(e.target.value)}
                disabled={isApplyingWatermark || isUploading}
              />
            </div>
            <button 
              onClick={handleApplyWatermark} 
              disabled={isApplyingWatermark || isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isApplyingWatermark ? 'Applying...' : 'Add Watermark'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverter;