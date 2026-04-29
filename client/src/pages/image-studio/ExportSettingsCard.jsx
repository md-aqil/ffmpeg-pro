import React from 'react';

const ExportSettingsCard = ({
  quality,
  onQualityChange,
  onResetToOriginal,
  imageReady,
  outputFormatOptions,
  supportedOutputFormats,
  outputFormat,
  onOutputFormatChange,
  isBatchMode,
  batchQueueLength,
  isBatchProcessing,
  selectedFileReady,
  isProcessing,
  onRender,
  onDownload,
  canDownloadResult,
  onToggleComparison,
  enabledOperations = [],
  includeAiMetadata,
  onToggleAiMetadata,
  aiMetadataAvailable,
}) => {
  return (
    <section className="inspector-card">
      <div className="inspector-card-title">Export Settings</div>
      
      {enabledOperations.length > 0 && (
        <div className="active-ops-summary mb-3">
          <div className="text-xs text-muted mb-1">Included Actions:</div>
          <div className="ops-list-row">
            {enabledOperations.map((op, i) => (
              <span key={op.id || op.type} className="op-summary-tag">
                {op.type.charAt(0).toUpperCase() + op.type.slice(1)}
                {i < enabledOperations.length - 1 && <span className="op-separator">+</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="quality-header">
        <span>Custom quality</span>
        <strong>{quality}%</strong>
      </div>
      <input
        type="range"
        min="1"
        max="100"
        value={quality}
        onChange={(e) => onQualityChange(Number(e.target.value))}
        className="quality-slider"
      />

      <div className="action-row mb-2">
        <button
          type="button"
          className="secondary-action-btn"
          onClick={onResetToOriginal}
          disabled={!imageReady}
        >
          <span className="material-symbols-outlined">restart_alt</span>
          Reset to Original
        </button>
      </div>

      <div className="format-grid">
        {outputFormatOptions.map((format) => {
          const isSupported = supportedOutputFormats.includes(format.value);

          return (
            <button
              key={format.value}
              type="button"
              className={`format-button ${outputFormat === format.value ? 'active' : ''} ${!isSupported ? 'disabled-format' : ''}`}
              onClick={() => {
                if (!isSupported) return;
                onOutputFormatChange(format.value);
              }}
              disabled={!isSupported}
              title={isSupported ? `${format.label} is available on this server.` : `${format.label} is not available with the current FFmpeg encoder set.`}
            >
              <div className="format-btn-content">
                <span className="format-label-text">{format.label}</span>
                {!isSupported && <span className="format-badge">Missing</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="format-capability-note">
        Available formats are detected from the current FFmpeg build. Unsupported options stay visible but disabled.
      </div>

      <button
        className="render-cta"
        type="button"
        onClick={onRender}
        disabled={isBatchMode ? batchQueueLength === 0 || isBatchProcessing : !selectedFileReady || isProcessing}
      >
        {isBatchMode
          ? (isBatchProcessing ? 'Processing Batch...' : 'Run Batch')
          : (isProcessing ? 'Rendering...' : 'Export / Render')}
      </button>

      <button
        className="compare-btn"
        type="button"
        onClick={onToggleComparison}
        disabled={!canDownloadResult}
        title="Compare original vs edited (Backslash key)"
      >
        <span className="material-symbols-outlined">compare</span>
        {canDownloadResult ? 'Before / After' : 'Render First to Compare'}
      </button>

      {aiMetadataAvailable && (
        <div className="ai-download-option mb-3">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={includeAiMetadata} 
              onChange={onToggleAiMetadata}
            />
            <span className="checkbox-checkmark"></span>
            <span className="checkbox-label">Download AI Metadata (ALT, Title, etc)</span>
          </label>
        </div>
      )}

      <button
        className="download-cta"
        type="button"
        onClick={onDownload}
        disabled={!canDownloadResult}
      >
        {canDownloadResult
          ? (isBatchMode ? 'Download ZIP' : 'Download Result')
          : 'No Result Yet'}
      </button>
    </section>
  );
};

export default ExportSettingsCard;
