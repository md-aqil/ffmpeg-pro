import React from 'react';

const ImageFileInfoCard = ({
  selectedFile,
  isBatchMode,
  metadata,
  imageSize,
  onSingleMode,
  onBatchMode,
  onAddImages,
  formatBytes,
  formatDimension,
}) => {
  return (
    <section className="inspector-card">
      <div className="inspector-card-title">File Info</div>
      <div className="batch-mode-switcher" role="group" aria-label="Processing mode">
        <button
          type="button"
          className={`mode-pill ${!isBatchMode ? 'active' : ''}`}
          onClick={onSingleMode}
        >
          Single
        </button>
        <button
          type="button"
          className={`mode-pill ${isBatchMode ? 'active' : ''}`}
          onClick={onBatchMode}
        >
          Batch
        </button>
        {isBatchMode && (
          <button
            type="button"
            className="mode-pill mode-pill-action"
            onClick={onAddImages}
          >
            Add Images
          </button>
        )}
      </div>
      {selectedFile && !isBatchMode && (
        <div className="metadata-grid">
          <div className="metadata-row">
            <span>File</span>
            <strong>{metadata?.name || 'No file selected'}</strong>
          </div>
          <div className="metadata-row">
            <span>Dimensions</span>
            <strong>
              {formatDimension(imageSize.width)} × {formatDimension(imageSize.height)}
            </strong>
          </div>
          <div className="metadata-row">
            <span>Size</span>
            <strong>{metadata ? formatBytes(metadata.size) : '0 B'}</strong>
          </div>
          <div className="metadata-row">
            <span>Type</span>
            <strong>{metadata?.type || 'image/*'}</strong>
          </div>
          <div className="metadata-row">
            <span>Color Profile</span>
            <strong>{metadata?.colorProfile || 'sRGB'}</strong>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageFileInfoCard;
