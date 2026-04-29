import React from 'react';
import { uploadFile } from '../../services/api';

const matchesRatio = (widthA, heightA, widthB, heightB, epsilon = 0.001) => {
  if (!widthA || !heightA || !widthB || !heightB) return false;
  return Math.abs((widthA / heightA) - (widthB / heightB)) < epsilon;
};

const OperationIcon = ({ type }) => {
  const icons = {
    resize: '⌗',
    crop: '⤢',
    color: '◐',
    rotate: '↻',
    effect: '✦',
    watermark: '⎘',
  };

  return <span className="operation-icon" aria-hidden="true">{icons[type] || '•'}</span>;
};

const ToggleSwitch = ({ checked, onChange, compact = false }) => (
  <button
    type="button"
    className={`toggle-switch ${checked ? 'checked' : ''} ${compact ? 'compact' : ''}`}
    onClick={(event) => {
      event.stopPropagation();
      onChange();
    }}
    aria-pressed={checked}
  >
    <span className="toggle-thumb" />
  </button>
);

const StudioSlider = ({ label, min, max, step = 0.01, value, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <label className="field slider-field studio-slider-wrapper">
      <div className="slider-header">
        <span className="field-label">{label}</span>
        <span className="slider-value">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}</span>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="studio-slider"
          style={{ '--fill-percent': `${percentage}%` }}
        />
      </div>
    </label>
  );
};

const OperationCard = ({ operation, onToggle, onExpand, onUpdate, active, imageSize }) => {

  const originalResizeSelected = operation.type === 'resize'
    && imageSize?.width
    && imageSize?.height
    && Number(operation.width) === Number(imageSize.width)
    && Number(operation.height) === Number(imageSize.height);

  const presetItems = operation.type === 'resize' ? [
    { key: 'original', label: 'Original', width: imageSize?.width, height: imageSize?.height },
    { key: '1:1', label: '1:1', width: 1, height: 1 },
    { key: '4:3', label: '4:3', width: 4, height: 3 },
    { key: '16:9', label: '16:9', width: 16, height: 9 },
    { key: '9:16', label: '9:16', width: 9, height: 16 },
    { key: '21:9', label: '21:9', width: 21, height: 9 },
    { key: '3:2', label: '3:2', width: 3, height: 2 },
  ] : [];

  return (
    <section className={`operation-card ${active ? 'active' : ''} ${operation.enabled ? 'enabled' : 'disabled'}`}>
      <div
        className="operation-card-header"
        role="button"
        tabIndex={0}
        onClick={() => onExpand(operation.type)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onExpand(operation.type);
        }}
      >
        <span className="drag-grip" aria-hidden="true">⋮⋮</span>
        <OperationIcon type={operation.type} />
        <div className="operation-card-titlewrap">
          <div className="operation-card-title">{operation.label}</div>
          <div className="operation-card-note">
            {operation.type === 'resize' && 'Frame and output size'}
            {operation.type === 'crop' && 'Trim the visible area'}
            {operation.type === 'color' && 'Tone separation'}
            {operation.type === 'rotate' && 'Reorient the image'}
            {operation.type === 'effect' && 'Apply visual treatment'}
            {operation.type === 'watermark' && 'Overlay text watermark'}
          </div>
        </div>
        <ToggleSwitch checked={operation.enabled} onChange={() => onToggle(operation.type)} compact />
        <span className={`expand-caret ${operation.expanded ? 'open' : ''}`}>⌄</span>
      </div>

      {operation.expanded && (
        <div className="operation-card-body">
          {operation.type === 'resize' && (
            <>
              <div className="field-grid two-up my-2">
                <label className="field">
                  <div className="field-label-row">
                    <span className="field-label">Width</span>
                  </div>
                  <div className="input-shell">
                    <input
                      type="number"
                      value={operation.width}
                      onChange={(e) => {
                        const newWidth = e.target.value === '' ? '' : Number(e.target.value);
                        let updates = { width: newWidth };
                        
                        if (operation.maintainAspectRatio && newWidth !== '' && operation.width && operation.height) {
                          const ratio = operation.width / operation.height;
                          updates.height = Math.round(newWidth / ratio);
                        }
                        
                        onUpdate(operation.type, updates);
                      }}
                      placeholder="1920"
                    />
                    <span className="input-unit">px</span>
                  </div>
                </label>
                <label className="field">
                  <div className="field-label-row">
                    <span className="field-label">Height</span>
                    <button
                      type="button"
                      className={`aspect-lock-btn ${operation.maintainAspectRatio ? 'active' : ''}`}
                      onClick={() => onUpdate(operation.type, { maintainAspectRatio: !operation.maintainAspectRatio })}
                      title="Maintain Aspect Ratio"
                    >
                      <span className="material-symbols-outlined">
                        {operation.maintainAspectRatio ? 'link' : 'link_off'}
                      </span>
                    </button>
                  </div>
                  <div className="input-shell">
                    <input
                      type="number"
                      value={operation.height}
                      onChange={(e) => {
                        const newHeight = e.target.value === '' ? '' : Number(e.target.value);
                        let updates = { height: newHeight };
                        
                        if (operation.maintainAspectRatio && newHeight !== '' && operation.width && operation.height) {
                          const ratio = operation.width / operation.height;
                          updates.width = Math.round(newHeight * ratio);
                        }
                        
                        onUpdate(operation.type, updates);
                      }}
                      placeholder="1080"
                    />
                    <span className="input-unit">px</span>
                  </div>
                </label>
              </div>
              <div className="preset-grid">
                {presetItems.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`preset-button ${(preset.key === 'original' && originalResizeSelected) ||
                      (preset.key !== 'original' && matchesRatio(operation.width, operation.height, preset.width, preset.height))
                      ? 'active'
                      : ''
                      }`}
                    onClick={() => {
                      if (preset.key === 'original' && imageSize?.width && imageSize?.height) {
                        const updates = {
                          width: imageSize.width,
                          height: imageSize.height,
                          maintainAspectRatio: true,
                        };
                        onUpdate(operation.type, updates);
                        // Reset crop to original too
                        onUpdate('crop', { x: 0, y: 0, width: imageSize.width, height: imageSize.height, enabled: false });
                        return;
                      }

                      // Calculate dimensions based on current height to ensure Width input updates
                      // This addresses the user requirement for Width to change accordingly.
                      const currentHeight = Number(operation.height) || imageSize?.height || 1080;
                      const targetHeight = currentHeight;
                      const targetWidth = Math.round((currentHeight * preset.width) / preset.height);

                      // Only update the resize operation
                      onUpdate("resize", {
                        width: targetWidth,
                        height: targetHeight,
                        maintainAspectRatio: true,
                        enabled: true
                      });
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="smart-frame-section mt-3 pt-3 border-t">
                <label className="smart-frame-toggle-row">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="studio-checkbox"
                      checked={operation.useSmartFrame} 
                      onChange={(e) => onUpdate(operation.type, { useSmartFrame: e.target.checked })} 
                    />
                    <span className="field-label" style={{ margin: 0 }}>Smart Frame (Blurred Fill)</span>
                  </div>
                  <span className="material-symbols-outlined help-icon" title="Fills empty space with a blurred matching background">info</span>
                </label>

                {operation.useSmartFrame && (
                  <div className="field-stack mt-2">
                    <StudioSlider 
                      label="Atmosphere Blur"
                      min={0}
                      max={50}
                      step={1}
                      value={operation.blur}
                      onChange={(e) => onUpdate(operation.type, { blur: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {operation.type === 'crop' && (
            <>
              <button
                type="button"
                className="interactive-crop-btn"
                onClick={() => {
                  onUpdate('crop', { enabled: true });
                  onExpand('crop');
                }}
              >
                <span className="material-symbols-outlined">crop</span>
                Open Interactive Crop Tool
              </button>

              <div className="field-grid two-up">
                <label className="field">
                  <span className="field-label">X</span>
                  <input type="number" value={operation.x} onChange={(e) => onUpdate(operation.type, { x: Number(e.target.value) })} />
                </label>
                <label className="field">
                  <span className="field-label">Y</span>
                  <input type="number" value={operation.y} onChange={(e) => onUpdate(operation.type, { y: Number(e.target.value) })} />
                </label>
                  <label className="field">
                    <span className="field-label">Crop Width</span>
                    <input type="number" value={operation.width} onChange={(e) => onUpdate(operation.type, { width: Number(e.target.value) })} />
                  </label>
                  <label className="field">
                    <span className="field-label">Crop Height</span>
                    <input type="number" value={operation.height} onChange={(e) => onUpdate(operation.type, { height: Number(e.target.value) })} />
                  </label>
                </div>

                <div className="field-stack mt-3 pt-3 border-t"> {/* Separator for new controls */}
                  <label className="field">
                    <span className="field-label">Output Canvas Width (for padding)</span>
                    <input type="number" value={operation.targetWidth || ''} onChange={(e) => onUpdate(operation.type, { targetWidth: Number(e.target.value) })} placeholder="0 for auto" />
                  </label>
                  <label className="field">
                    <span className="field-label">Output Canvas Height (for padding)</span>
                    <input type="number" value={operation.targetHeight || ''} onChange={(e) => onUpdate(operation.type, { targetHeight: Number(e.target.value) })} placeholder="0 for auto" />
                  </label>
                  <label className="field">
                    <span className="field-label">Fill Color (for padding)</span>
                    <input type="color" value={operation.fillColor} onChange={(e) => onUpdate(operation.type, { fillColor: e.target.value })} />
                    <input type="text" value={operation.fillColor} onChange={(e) => onUpdate(operation.type, { fillColor: e.target.value })} />
                  </label>
                </div>
            </>
          )}

          {operation.type === 'effect' && (
            <div className="field-stack">
              {/* Smart Moods Grid */}
              <div className="smart-mood-section mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="field-label" style={{ margin: 0 }}>Atmosphere Moods</span>
                </div>
                <div className="mood-grid">
                  {[
                    { id: 'none', label: 'None', icon: 'block' },
                    { id: 'cinematic', label: 'Cinematic', icon: 'movie' },
                    { id: 'vintage', label: 'Vintage', icon: 'camera_roll' },
                    { id: 'cyberpunk', label: 'Cyber', icon: 'bolt' },
                    { id: 'golden', label: 'Golden', icon: 'wb_sunny' },
                    { id: 'dramatic', label: 'Drama', icon: 'theater_comedy' },
                    { id: 'noir', label: 'Noir', icon: 'contrast' },
                  ].map((mood) => (
                    <button
                      key={mood.id}
                      type="button"
                      className={`mood-button ${operation.mood === mood.id ? 'active' : ''}`}
                      onClick={() => onUpdate(operation.type, { mood: mood.id, enabled: true })}
                    >
                      <span className="material-symbols-outlined">{mood.icon}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Correction Sliders */}
              <div className="color-sliders pt-2 mt-2 border-t">
                <StudioSlider 
                  label="Brightness"
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  value={operation.brightness}
                  onChange={(e) => onUpdate(operation.type, { brightness: Number(e.target.value), enabled: true })}
                />
                <StudioSlider 
                  label="Contrast"
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  value={operation.contrast}
                  onChange={(e) => onUpdate(operation.type, { contrast: Number(e.target.value), enabled: true })}
                />
                <StudioSlider 
                  label="Saturation"
                  min={0}
                  max={3}
                  step={0.1}
                  value={operation.saturation}
                  onChange={(e) => onUpdate(operation.type, { saturation: Number(e.target.value), enabled: true })}
                />
              </div>

              {/* Legacy Special Effects */}
              <div className="pt-2 mt-2 border-t">
                <label className="field">
                  <span className="field-label">Lens & Texture</span>
                  <select value={operation.effect} onChange={(e) => onUpdate(operation.type, { effect: e.target.value, enabled: true })}>
                    <option value="none">None</option>
                    <option value="blur">Soft Focus (Blur)</option>
                    <option value="sharpen">Ultra Detail (Sharpen)</option>
                    <option value="grayscale">Noir (Gray)</option>
                    <option value="sepia">Warm Sepia</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {operation.type === 'watermark' && (
            <div className="field-stack">
              <div className="type-switcher">
                <button 
                  className={`type-pill ${!operation.useImage ? 'active' : ''}`}
                  onClick={() => onUpdate(operation.type, { useImage: false })}
                >
                  Text
                </button>
                <button 
                  className={`type-pill ${operation.useImage ? 'active' : ''}`}
                  onClick={() => onUpdate(operation.type, { useImage: true })}
                >
                  Image
                </button>
              </div>

              {!operation.useImage ? (
                <label className="field">
                  <span className="field-label">Text</span>
                  <input
                    type="text"
                    value={operation.text}
                    onChange={(e) => onUpdate(operation.type, { text: e.target.value })}
                    placeholder="© Your Brand"
                  />
                </label>
              ) : (
                <div className="field">
                  <span className="field-label">Logo Image</span>
                  <button 
                    className="watermark-upload-btn"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const result = await uploadFile(file);
                            onUpdate(operation.type, { imageFileId: result.serverFileName });
                          } catch (err) {
                            console.error('Watermark upload failed', err);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    <span className="material-symbols-outlined">upload_file</span>
                    {operation.imageFileId ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {operation.imageFileId && <div className="file-id-badge">ID: {operation.imageFileId}</div>}
                </div>
              )}

              <label className="field">
                <span className="field-label">Position</span>
                <select value={operation.position} onChange={(e) => onUpdate(operation.type, { position: e.target.value })}>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              {operation.position === 'custom' && (
                <div className="field-grid two-up">
                  <label className="field">
                    <span className="field-label">X Offset</span>
                    <input 
                      type="number" 
                      value={operation.customX} 
                      onChange={(e) => onUpdate(operation.type, { customX: Number(e.target.value) })} 
                      placeholder="10"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Y Offset</span>
                    <input 
                      type="number" 
                      value={operation.customY} 
                      onChange={(e) => onUpdate(operation.type, { customY: Number(e.target.value) })} 
                      placeholder="10"
                    />
                  </label>
                </div>
              )}
              <StudioSlider 
                label="Opacity"
                min={0}
                max={100}
                step={1}
                value={operation.opacity}
                onChange={(e) => onUpdate(operation.type, { opacity: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default OperationCard;