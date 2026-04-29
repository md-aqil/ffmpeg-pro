import React from 'react';

const ImageFileInfoCard = ({
  selectedFile,
  isBatchMode,
  metadata,
  aiMetadata,
  isAnalyzing,
  imageSize,
  onSingleMode,
  onBatchMode,
  onAddImages,
  formatBytes,
  formatDimension,
}) => {
  const [isAiExpanded, setIsAiExpanded] = React.useState(true);

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

          {isAnalyzing && (
            <div className="ai-analysis-loading">
              <span className="spinner-small"></span>
              <span>AI Analyzing image content...</span>
            </div>
          )}

          {aiMetadata && (
            <div className="ai-metadata-section mt-4 pt-4 border-t border-white/10">
              <button 
                className="flex items-center justify-between w-full text-left mb-2 group hover:opacity-80 transition-opacity"
                onClick={() => setIsAiExpanded(!isAiExpanded)}
              >
                <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  AI INSIGHTS
                </div>
                <span className={`material-symbols-outlined text-sm text-white/40 transition-transform ${isAiExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              {isAiExpanded && (
                <div className="ai-content-fade-in space-y-2">
                  <div className="metadata-row">
                    <span>Suggested Name</span>
                    <strong className="text-blue-200">{aiMetadata.suggestedFilename}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>AI Title</span>
                    <strong className="italic">"{aiMetadata.title}"</strong>
                  </div>
                  <div className="metadata-row ai-row-stack">
                    <span>ALT Text</span>
                    <p className="ai-text-preview">{aiMetadata.altText}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ImageFileInfoCard;
