import React from 'react';

const ImageResultCard = ({
  isBatchMode,
  batchResult,
  renderedPreviewUrl,
  outputInfo,
  truncateTwoWords,
}) => {
  return (
    <section className="inspector-card result-card">
      <div className="inspector-card-title">Result</div>
      {isBatchMode && batchResult ? (
        <div className="batch-result-summary">
          <div className="result-copy">
            {batchResult.summary
              ? `${batchResult.summary.succeeded} succeeded, ${batchResult.summary.failed} failed`
              : 'Batch results ready'}
          </div>
          {batchResult.archiveFilename && (
            <div className="batch-archive-chip">
              ZIP: {batchResult.archiveFilename}
            </div>
          )}
          <div className="batch-result-list">
            {batchResult.results?.map((item) => (
              <div key={`${item.fileId}-${item.fileName}`} className={`batch-result-item ${item.success ? 'success' : 'failed'}`}>
                <div className="batch-result-file">
                  <strong>{truncateTwoWords(item.fileName)}</strong>
                  <span>{item.success ? item.filename : item.error}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="result-copy">{outputInfo}</div>
          {renderedPreviewUrl && (
            <div className="result-preview">
              <img src={renderedPreviewUrl} alt="Rendered output preview" />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ImageResultCard;
