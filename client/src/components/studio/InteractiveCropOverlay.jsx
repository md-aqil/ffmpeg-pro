import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './InteractiveCropOverlay.css';

const ASPECT_RATIOS = [
  { key: 'free', label: 'Free', value: null },
  { key: '1:1', label: '1:1', value: 1 },
  { key: '4:3', label: '4:3', value: 4 / 3 },
  { key: '16:9', label: '16:9', value: 16 / 9 },
  { key: '9:16', label: '9:16', value: 9 / 16 },
  { key: '3:2', label: '3:2', value: 3 / 2 },
  { key: '21:9', label: '21:9', value: 21 / 9 },
];

const InteractiveCropOverlay = ({
  imageSrc,
  crop,
  onCropChange,
  onCropComplete,
  aspectRatio,
  onAspectRatioChange,
  onClose,
  imageSize,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleCropChange = useCallback((newCrop) => {
    onCropChange(newCrop);
  }, [onCropChange]);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    onCropComplete(croppedArea, croppedAreaPixels);
  }, [onCropComplete]);

  const handleAspectRatioChange = (ratio) => {
    onAspectRatioChange(ratio);
  };

  return (
    <div className="crop-overlay-container">
      {/* Top Toolbar */}
      <div className="crop-toolbar">
        <div className="crop-toolbar-left">
          <h3 className="crop-toolbar-title">Crop & Rotate</h3>
          <span className="crop-dimensions">
            {Math.round(crop.width)} × {Math.round(crop.height)} px
          </span>
        </div>

        <div className="crop-toolbar-center">
          <div className="aspect-ratio-pills">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.key}
                type="button"
                className={`aspect-pill ${aspectRatio === ratio.value ? 'active' : ''}`}
                onClick={() => handleAspectRatioChange(ratio.value)}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        <div className="crop-toolbar-right">
          <button
            type="button"
            className="crop-tool-btn"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <span className="material-symbols-outlined">
              {showGrid ? 'grid_on' : 'grid_off'}
            </span>
          </button>
          <button
            type="button"
            className="crop-tool-btn"
            onClick={onClose}
            title="Close Crop Tool"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {isInteracting && <div style={{ position: "absolute", top: 0, left: 0, background: "red", color: "white", padding: "5px", zIndex: 9999 }}>Interacting</div>}
      {/* Crop Area */}
      <div className="crop-area">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={handleCropChange}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={handleCropComplete}
          showGrid={showGrid}
          zoomWithScroll={true}
          onInteractionStart={() => setIsInteracting(true)}
          onInteractionEnd={() => setIsInteracting(false)}
          classes={{
            containerClassName: 'cropper-container',
            mediaClassName: 'cropper-media',
            cropAreaClassName: 'cropper-crop-area',
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className="crop-controls">
        <div className="crop-control-group">
          <label className="crop-control-label">
            <span className="material-symbols-outlined">zoom_in</span>
            <span>Zoom</span>
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="crop-slider"
          />
          <span className="crop-control-value">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="crop-control-group">
          <label className="crop-control-label">
            <span className="material-symbols-outlined">rotate_right</span>
            <span>Rotation</span>
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value, 10))}
            className="crop-slider"
          />
          <span className="crop-control-value">{rotation}°</span>
        </div>

        <div className="crop-actions">
          <button
            type="button"
            className="crop-btn crop-btn-secondary"
            onClick={() => {
              setZoom(1);
              setRotation(0);
              onCropChange({ x: 0, y: 0, width: imageSize.width, height: imageSize.height });
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="crop-btn crop-btn-primary"
            onClick={onClose}
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCropOverlay;
