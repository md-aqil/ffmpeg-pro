// client/src/components/ImageConverter.js - Pipeline-based Image Editor
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ImageConverter.css';
import { processImagePipeline, uploadFile, API_BASE_URL } from '../services/api';

// Transformation card component
const TransformationCard = ({ operation, index, onToggle, onUpdate, onDelete, onDragStart, isDragging }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (type) => {
    const icons = {
      resize: '📏',
      crop: '✂️',
      rotate: '🔄',
      effect: '✨',
      brightness: '☀️',
      contrast: '🎭',
      saturation: '🌈',
      watermark: '🏷️',
      optimize: '⚡',
      formatConvert: '🔄'
    };
    return icons[type] || '⚙️';
  };

  const getLabel = (type) => {
    const labels = {
      resize: 'Resize',
      crop: 'Crop',
      rotate: 'Rotate',
      effect: 'Effect',
      brightness: 'Brightness',
      contrast: 'Contrast',
      saturation: 'Saturation',
      watermark: 'Watermark',
      optimize: 'Optimize',
      formatConvert: 'Convert Format'
    };
    return labels[type] || type;
  };

  return (
    <div
      className={`transformation-card ${operation.enabled ? 'enabled' : 'disabled'} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="card-header">
        <div className="drag-handle">⋮⋮</div>
        <div className="card-icon">{getIcon(operation.type)}</div>
        <div className="card-info">
          <span className="card-title">{getLabel(operation.type)}</span>
          {operation.enabled && <span className="card-status">Enabled</span>}
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={operation.enabled}
            onChange={() => onToggle(index)}
          />
          <span className="slider"></span>
        </label>
        <button className="delete-btn" onClick={() => onDelete(index)}>×</button>
      </div>

      {operation.enabled && isExpanded && (
        <div className="card-content">
          {operation.type === 'resize' && (
            <div className="params-grid">
              <div className="param-field">
                <label>Width</label>
                <input
                  type="number"
                  value={operation.width || ''}
                  onChange={(e) => onUpdate(index, { width: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Auto"
                />
              </div>
              <div className="param-field">
                <label>Height</label>
                <input
                  type="number"
                  value={operation.height || ''}
                  onChange={(e) => onUpdate(index, { height: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Auto"
                />
              </div>
            </div>
          )}

          {operation.type === 'crop' && (
            <div className="params-grid">
              <div className="param-field">
                <label>X</label>
                <input type="number" value={operation.x || 0} onChange={(e) => onUpdate(index, { x: parseInt(e.target.value) })} />
              </div>
              <div className="param-field">
                <label>Y</label>
                <input type="number" value={operation.y || 0} onChange={(e) => onUpdate(index, { y: parseInt(e.target.value) })} />
              </div>
              <div className="param-field">
                <label>Width</label>
                <input type="number" value={operation.width || 100} onChange={(e) => onUpdate(index, { width: parseInt(e.target.value) })} />
              </div>
              <div className="param-field">
                <label>Height</label>
                <input type="number" value={operation.height || 100} onChange={(e) => onUpdate(index, { height: parseInt(e.target.value) })} />
              </div>
            </div>
          )}

          {operation.type === 'rotate' && (
            <div className="param-field">
              <label>Angle (degrees)</label>
              <select
                value={operation.angle || 90}
                onChange={(e) => onUpdate(index, { angle: parseInt(e.target.value) })}
              >
                <option value={90}>90° Clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>270° Clockwise</option>
              </select>
            </div>
          )}

          {operation.type === 'effect' && (
            <div className="param-field">
              <label>Effect Type</label>
              <select
                value={operation.effect || 'blur'}
                onChange={(e) => onUpdate(index, { effect: e.target.value })}
              >
                <option value="blur">Blur</option>
                <option value="sharpen">Sharpen</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
              </select>
            </div>
          )}

          {operation.type === 'brightness' && (
            <div className="param-field">
              <label>Brightness: {operation.value?.toFixed(2) || 0}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={operation.value || 0}
                onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) })}
              />
            </div>
          )}

          {operation.type === 'contrast' && (
            <div className="param-field">
              <label>Contrast: {operation.value?.toFixed(2) || 0}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={operation.value || 0}
                onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) })}
              />
            </div>
          )}

          {operation.type === 'saturation' && (
            <div className="param-field">
              <label>Saturation: {operation.value?.toFixed(2) || 1}</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={operation.value || 1}
                onChange={(e) => onUpdate(index, { value: parseFloat(e.target.value) })}
              />
            </div>
          )}

          {operation.type === 'watermark' && (
            <div className="params-grid">
              <div className="param-field full-width">
                <label>Text</label>
                <input
                  type="text"
                  value={operation.text || ''}
                  onChange={(e) => onUpdate(index, { text: e.target.value })}
                  placeholder="© Your Brand"
                />
              </div>
              <div className="param-field">
                <label>Position</label>
                <select
                  value={operation.position || 'bottom-right'}
                  onChange={(e) => onUpdate(index, { position: e.target.value })}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div className="param-field">
                <label>Opacity: {operation.opacity || 50}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={operation.opacity || 50}
                  onChange={(e) => onUpdate(index, { opacity: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {operation.type === 'optimize' && (
            <div className="param-field">
              <label>Quality: {operation.quality || 80}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={operation.quality || 80}
                onChange={(e) => onUpdate(index, { quality: parseInt(e.target.value) })}
              />
            </div>
          )}

          <button className="expand-toggle" onClick={() => setIsExpanded(false)}>
            Collapse ▲
          </button>
        </div>
      )}

      {operation.enabled && !isExpanded && (
        <button className="expand-toggle" onClick={() => setIsExpanded(true)}>
          Configure ▼
        </button>
      )}
    </div>
  );
};

const ImageConverter = forwardRef(({ onConversionComplete, selectedFile, onProgressChange }, ref) => {
  const [pipeline, setPipeline] = useState([
    { id: 1, type: 'resize', enabled: false, width: undefined, height: undefined },
    { id: 2, type: 'crop', enabled: false, x: 0, y: 0, width: 100, height: 100 },
    { id: 3, type: 'rotate', enabled: false, angle: 90 },
    { id: 4, type: 'brightness', enabled: false, value: 0 },
    { id: 5, type: 'contrast', enabled: false, value: 0 },
    { id: 6, type: 'saturation', enabled: false, value: 1 },
    { id: 7, type: 'effect', enabled: false, effect: 'blur' },
    { id: 8, type: 'watermark', enabled: false, text: '', position: 'bottom-right', opacity: 50 },
    { id: 9, type: 'optimize', enabled: false, quality: 80 }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ currentStep: 0, totalSteps: 0, currentOperation: '' });
  const [beforeAfterSlider, setBeforeAfterSlider] = useState(50);
  const [outputFormat, setOutputFormat] = useState('png');
  // New state for zoom and pan functionality
  const [zoom, setZoom] = useState(100); // percent
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

  // Handlers for panning the after-image
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: pan.x,
      offsetY: pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.mouseX;
    const dy = e.clientY - panStartRef.current.mouseY;
    setPan({
      x: panStartRef.current.offsetX + dx,
      y: panStartRef.current.offsetY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const [quality, setQuality] = useState(80);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Generate preview URL for selected file
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleApplyPipeline: () => {
      handleApplyPipeline();
    },
    getPipeline: () => pipeline,
    getOutputFormat: () => outputFormat,
    getQuality: () => quality
  }));

  // Listen for format/quality updates from external controls
  useEffect(() => {
    const handleFormatUpdate = (e) => {
      setOutputFormat(e.detail);
    };
    const handleQualityUpdate = (e) => {
      setQuality(e.detail);
    };

    window.addEventListener('updateFormat', handleFormatUpdate);
    window.addEventListener('updateQuality', handleQualityUpdate);

    return () => {
      window.removeEventListener('updateFormat', handleFormatUpdate);
      window.removeEventListener('updateQuality', handleQualityUpdate);
    };
  }, []);

  const handleAddOperation = (type) => {
    const newOp = {
      id: Date.now(),
      type,
      enabled: true
    };

    // Set default values based on type
    switch (type) {
      case 'resize':
        newOp.width = undefined;
        newOp.height = undefined;
        break;
      case 'crop':
        newOp.x = 0;
        newOp.y = 0;
        newOp.width = 100;
        newOp.height = 100;
        break;
      case 'rotate':
        newOp.angle = 90;
        break;
      case 'brightness':
      case 'contrast':
        newOp.value = 0;
        break;
      case 'saturation':
        newOp.value = 1;
        break;
      case 'effect':
        newOp.effect = 'blur';
        break;
      case 'watermark':
        newOp.text = '';
        newOp.position = 'bottom-right';
        newOp.opacity = 50;
        break;
      case 'optimize':
        newOp.quality = 80;
        break;
      default:
        // Unknown type, don't add
        return;
    }

    setPipeline([...pipeline, newOp]);
  };

  const handleToggleOperation = (index) => {
    const newPipeline = [...pipeline];
    newPipeline[index].enabled = !newPipeline[index].enabled;
    setPipeline(newPipeline);
  };

  const handleUpdateOperation = (index, updates) => {
    const newPipeline = [...pipeline];
    newPipeline[index] = { ...newPipeline[index], ...updates };
    setPipeline(newPipeline);
  };

  const handleDeleteOperation = (index) => {
    const newPipeline = pipeline.filter((_, i) => i !== index);
    setPipeline(newPipeline);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPipeline = [...pipeline];
    const draggedItem = newPipeline[draggedIndex];
    newPipeline.splice(draggedIndex, 1);
    newPipeline.splice(dropIndex, 0, draggedItem);
    setPipeline(newPipeline);
    setDraggedIndex(null);
  };

  const handleApplyPipeline = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Upload file first
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProgress({
        currentStep: 1,
        totalSteps: 3, // Will adjust after getting operation count
        currentOperation: 'Uploading file...'
      });

      const uploadData = await uploadFile(selectedFile);

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Build operations array with only enabled operations
      const enabledOperations = pipeline
        .filter(op => op.enabled)
        .map(op => {
          const { id, enabled, ...operationParams } = op;
          return operationParams;
        });

      if (enabledOperations.length === 0) {
        throw new Error('Please enable at least one transformation');
      }

      const totalSteps = enabledOperations.length + 1; // upload + operations

      setProgress({
        currentStep: 2,
        totalSteps: totalSteps + 1, // +1 for completion
        currentOperation: 'Processing transformations...'
      });

      // Process pipeline
      const response = await processImagePipeline(
        uploadData.fileId,
        selectedFile.name,
        enabledOperations,
        outputFormat,
        quality
      );

      setProgress({
        currentStep: totalSteps + 1,
        totalSteps: totalSteps + 1,
        currentOperation: 'Processing complete!'
      });

      // Notify parent of progress update
      if (onProgressChange) {
        onProgressChange({
          currentStep: totalSteps + 1,
          totalSteps: totalSteps + 1,
          currentOperation: 'Complete!'
        });
      }

      if (response.success) {
        if (onConversionComplete) {
          onConversionComplete({ ...response.data, originalName: selectedFile.name });
        }
      } else {
        throw new Error(response.error || 'Pipeline processing failed');
      }

    } catch (err) {
      setError(err.message || 'An error occurred during pipeline processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const transformationTypes = [
    { type: 'resize', label: 'Resize', icon: '📏' },
    { type: 'crop', label: 'Crop', icon: '✂️' },
    { type: 'rotate', label: 'Rotate', icon: '🔄' },
    { type: 'brightness', label: 'Brightness', icon: '☀️' },
    { type: 'contrast', label: 'Contrast', icon: '🎭' },
    { type: 'saturation', label: 'Saturation', icon: '🌈' },
    { type: 'effect', label: 'Effects', icon: '✨' },
    { type: 'watermark', label: 'Watermark', icon: '🏷️' },
    { type: 'optimize', label: 'Optimize', icon: '⚡' }
  ];

  return (
    <div className="pipeline-editor">
      {/* Left Panel - Pipeline Builder (30%) */}
      <div className="pipeline-panel">
        <div className="panel-header">
          <h2>Transformation Pipeline</h2>
          <div className="add-operation-dropdown">
            <button className="add-button" onClick={() => document.getElementById('add-operation-select').focus()}>
              + Add Operation
            </button>
            <select
              id="add-operation-select"
              className="operation-select"
              onChange={(e) => {
                if (e.target.value) {
                  handleAddOperation(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Select operation...</option>
              {transformationTypes.map(t => (
                <option key={t.type} value={t.type}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pipeline-list">
          {pipeline.map((operation, index) => (
            <div
              key={operation.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <TransformationCard
                operation={operation}
                index={index}
                onToggle={handleToggleOperation}
                onUpdate={handleUpdateOperation}
                onDelete={handleDeleteOperation}
                onDragStart={handleDragStart}
                isDragging={draggedIndex === index}
              />
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        {isProcessing && (
          <div className="pipeline-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.currentStep / progress.totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Step {progress.currentStep} of {progress.totalSteps}: {progress.currentOperation}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Preview (70%) */}
      <div className="preview-panel">
        {selectedFile ? (
          <>
            <div className="preview-header">
              <h3>Image Preview</h3>
              <div className="preview-controls">
                <span className="preview-label">Before</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beforeAfterSlider}
                  onChange={(e) => setBeforeAfterSlider(parseInt(e.target.value))}
                  className="before-after-slider"
                />
                <span className="preview-label">After</span>
                {/* Zoom slider */}
                <span className="preview-label" style={{ marginLeft: '8px' }}>Zoom</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="zoom-slider"
                />
                <button 
                  className="reset-view-btn" 
                  onClick={() => { setZoom(100); setPan({ x: 0, y: 0 }); }}
                  title="Reset Zoom & Pan"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ↺
                </button>
              </div>
            </div>

            <div className="preview-container">
              {previewUrl && (
                <div className="comparison-view">
                  <div className="before-image" style={{ width: `${beforeAfterSlider}%` }}>
                    <img src={previewUrl} alt="Original" />
                    <span className="image-label">Before</span>
                  </div>
                  <div 
                    className="after-image" 
                    style={{ 
                      width: `${100 - beforeAfterSlider}%`,
                      cursor: isPanning ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      transform: `scale(${zoom / 100}) translate(${pan.x / (zoom / 100)}px, ${pan.y / (zoom / 100)}px)`,
                      transformOrigin: 'center center',
                      transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}>
                      {pipeline.some(op => op.enabled) ? (
                        <div className="after-placeholder">
                          <span>Processed preview</span>
                          <p>Apply pipeline to see result</p>
                        </div>
                      ) : (
                        <img src={previewUrl} alt="Original" style={{ opacity: 0.5 }} />
                      )}
                    </div>
                    <span className="image-label">After</span>
                  </div>
                </div>
              )}
            </div>

            <div className="preview-actions">
              <div className="export-settings">
                <label>Format:</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                  <option value="gif">GIF</option>
                </select>
                <label>Quality:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                />
                <span className="quality-value">{quality}%</span>
              </div>
              <button
                className="apply-pipeline-btn"
                onClick={handleApplyPipeline}
                disabled={isProcessing || !pipeline.some(op => op.enabled)}
              >
                {isProcessing ? 'Processing...' : 'Apply Pipeline'}
              </button>
            </div>
          </>
        ) : (
          <div className="empty-preview">
            <div className="empty-icon">🖼️</div>
            <h3>No Image Selected</h3>
            <p>Select an image from the sidebar to begin editing</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
});

ImageConverter.displayName = 'ImageConverter';

export default ImageConverter;
