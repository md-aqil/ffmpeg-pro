import React from 'react';

const BatchQueueCard = ({
  batchQueue,
  batchProgress,
  batchItemStates,
  isBatchProcessing,
  onAddImages,
  onClearQueue,
  onRemoveFile,
  getBatchItemState,
  getBatchQueueKey,
  formatBytes,
  truncateTwoWords,
}) => {
  return (
    <section className="inspector-card">
      <div className="inspector-card-head">
        <div className="inspector-card-title">Batch Queue</div>
        <button type="button" className="batch-inline-add" onClick={onAddImages}>
          <span className="material-symbols-outlined">add</span>
          Add Images
        </button>
      </div>
      <div className="batch-queue-meta">
        {batchQueue.length} image{batchQueue.length === 1 ? '' : 's'} queued
      </div>
      <div className={`batch-progress-banner ${batchProgress.phase !== 'idle' ? 'active' : ''}`}>
        <div className="batch-progress-line">
          <span>{batchProgress.label || 'Ready to run batch.'}</span>
          <strong>{batchProgress.progress || 0}%</strong>
        </div>
        <div className="batch-progress-track" aria-hidden="true">
          <span
            className={`batch-progress-fill ${batchProgress.phase}`}
            style={{ width: `${batchProgress.progress || 0}%` }}
          />
        </div>
      </div>
      <div className="batch-queue-list">
        {batchQueue.length === 0 ? (
          <div className="empty-batch-state">
            Drop multiple images here or use the file picker to build the queue.
          </div>
        ) : (
          batchQueue.map((file, index) => (
            <div key={getBatchQueueKey(file)} className="batch-queue-item">
              <div className="batch-queue-file">
                {index === 0 && (
                  <span className="batch-primary-tag">First in batch</span>
                )}
                <strong>{truncateTwoWords(file.name)}</strong>
                <span>{formatBytes(file.size)}</span>
                <div className="batch-item-status">
                  {(() => {
                    const state = batchItemStates[getBatchQueueKey(file)] || getBatchItemState(file);
                    return (
                      <>
                        <span className={`batch-status-badge ${state.status}`}>{state.label}</span>
                        {isBatchProcessing && (
                          <div className="batch-item-progress-track" aria-hidden="true">
                            <span
                              className="batch-item-progress-fill"
                              style={{ width: `${state.progress || 0}%` }}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <button
                type="button"
                className="batch-queue-remove"
                onClick={() => onRemoveFile(file)}
                aria-label={`Remove ${file.name} from queue`}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <div className="action-row">
        <button
          type="button"
          className="secondary-action-btn"
          onClick={onClearQueue}
          disabled={batchQueue.length === 0}
        >
          <span className="material-symbols-outlined">delete_sweep</span>
          Clear Queue
        </button>
      </div>
    </section>
  );
};

export default BatchQueueCard;
