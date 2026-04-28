// client/src/components/ImagePropertiesSidebar.js
import React, { useState, useEffect } from 'react';
import './ImagePropertiesSidebar.css';

const ImagePropertiesSidebar = ({
  selectedFile,
  outputFormat,
  onFormatChange,
  quality,
  onQualityChange,
  onSavePreset,
  conversionResult
}) => {
  const [metadata, setMetadata] = useState(null);
  const [activeTab, setActiveTab] = useState('metadata');

  // Set basic file info when file changes
  useEffect(() => {
    if (!selectedFile) {
      setMetadata(null);
      return;
    }

    const basicMetadata = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: new Date(selectedFile.lastModified).toLocaleString()
    };
    setMetadata(basicMetadata);
  }, [selectedFile]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSavePreset = () => {
    const presetName = prompt('Enter preset name:');
    if (presetName && onSavePreset) {
      onSavePreset({
        name: presetName,
        format: outputFormat,
        quality: quality,
        timestamp: Date.now()
      });
    }
  };

  return (
    <aside className="properties-sidebar">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          📊 Metadata
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📤 Export
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          ⭐ Presets
        </button>
      </div>

      {/* Tab Content */}
      <div className="sidebar-content">
        {activeTab === 'metadata' && (
          <div className="metadata-panel">
            <h3>Image Information</h3>

            {metadata ? (
              <div className="metadata-grid">
                <div className="meta-item">
                  <span className="meta-label">File Name</span>
                  <span className="meta-value">{metadata.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">File Size</span>
                  <span className="meta-value">{formatBytes(metadata.size)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">File Type</span>
                  <span className="meta-value">{metadata.type?.split('/')[1]?.toUpperCase() || 'Unknown'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Modified</span>
                  <span className="meta-value">{metadata.lastModified}</span>
                </div>
              </div>
            ) : (
              <div className="metadata-loading">
                <div className="loading-spinner"></div>
                <span>Loading metadata...</span>
              </div>
            )}

            {/* Quick Stats */}
            {selectedFile && (
              <div className="quick-stats">
                <h4>Quick Stats</h4>
                <div className="stat-item">
                  <span>Dimensions</span>
                  <span>—</span>
                </div>
                <div className="stat-item">
                  <span>Color Space</span>
                  <span>sRGB</span>
                </div>
                <div className="stat-item">
                  <span>Bit Depth</span>
                  <span>8-bit</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="export-panel">
            <h3>Export Settings</h3>

            <div className="export-field">
              <label>Output Format</label>
              <select value={outputFormat} onChange={(e) => onFormatChange && onFormatChange(e.target.value)}>
                <option value="png">PNG — Lossless</option>
                <option value="jpg">JPEG — Lossy</option>
                <option value="webp">WebP — Modern</option>
                <option value="gif">GIF — Animated</option>
                <option value="bmp">BMP — Uncompressed</option>
                <option value="tiff">TIFF — Professional</option>
              </select>
            </div>

            <div className="export-field">
              <label>Quality: {quality}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => onQualityChange && onQualityChange(parseInt(e.target.value))}
              />
              <div className="quality-labels">
                <span>Small file</span>
                <span>Best quality</span>
              </div>
            </div>

            <div className="export-info">
              <div className="info-box">
                <span className="info-icon">💡</span>
                <p>
                  <strong>PNG</strong> is recommended for images requiring lossless quality.
                  <br />
                  <strong>JPEG</strong> is best for photographs with smaller file size.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="presets-panel">
            <h3>Preset Manager</h3>

            <div className="preset-actions">
              <button className="preset-btn save" onClick={handleSavePreset}>
                Save Current
              </button>
            </div>

            <div className="empty-presets">
              <p>No saved presets yet</p>
              <span>Configure your settings and save a preset for quick reuse</span>
            </div>

            {/* Sample presets */}
            <div className="sample-presets">
              <h4>Quick Presets</h4>
              <div className="quick-preset-btns">
                <button onClick={() => { onFormatChange && onFormatChange('png'); onQualityChange && onQualityChange(100); }}>
                  🖼️ High Quality PNG
                </button>
                <button onClick={() => { onFormatChange && onFormatChange('jpg'); onQualityChange && onQualityChange(85); }}>
                  📷 Web Optimized JPG
                </button>
                <button onClick={() => { onFormatChange && onFormatChange('webp'); onQualityChange && onQualityChange(80); }}>
                  🌐 Modern WebP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result section at bottom */}
      {conversionResult && (
        <div className="result-card">
          <div className="result-header">
            <span className="result-icon">✅</span>
            <span>Processing Complete</span>
          </div>
          <div className="result-info">
            <p><strong>File:</strong> {conversionResult.filename}</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ImagePropertiesSidebar;
