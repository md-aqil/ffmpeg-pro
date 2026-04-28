import React from 'react';

const ImagePipelinePanel = ({
  selectedFile,
  enabledOperations,
  pipeline,
  activeOperation,
  dockTool,
  setDockTool,
  expandOperation,
  toggleOperation,
  updateOperation,
  imageSize,
  OperationCard,
}) => {
  if (!selectedFile) return null;

  return (
    <aside className="studio-column studio-left">
      <div className="section-header">
        <div>
          <div className="section-kicker">PIPELINE</div>
          <div className="section-subtitle">Image operations</div>
        </div>
        <div className="section-right-label">{`${enabledOperations.length} active`}</div>
      </div>

      <div className="pipeline-stack">
        {pipeline
          .filter((operation) => operation.type === activeOperation && operation.type !== 'crop')
          .map((operation) => (
            <OperationCard
              key={operation.type}
              operation={{
                ...operation,
                expanded: true,
              }}
              onToggle={toggleOperation}
              onExpand={expandOperation}
              onUpdate={updateOperation}
              active={true}
              imageSize={imageSize}
            />
          ))}

        <div className="inspector-tool-switcher">
          {[
            { id: 'canvas', label: 'Canvas', icon: 'grid_view' },
            { id: 'effects', label: 'Effects', icon: 'auto_fix_high' },
            { id: 'watermark', label: 'Watermark', icon: 'branding_watermark' },
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`tool-pill ${dockTool === tool.id ? 'active' : ''}`}
              onClick={() => {
                setDockTool(tool.id);
                const target = pipeline.find((operation) =>
                  (tool.id === 'canvas' && operation.type === 'resize') ||
                  (tool.id === 'effects' && operation.type === 'effect') ||
                  (tool.id === 'watermark' && operation.type === 'watermark'),
                );
                if (target) expandOperation(target.type);
              }}
            >
              <span className="material-symbols-outlined">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ImagePipelinePanel;
