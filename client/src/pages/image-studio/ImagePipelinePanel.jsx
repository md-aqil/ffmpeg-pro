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
  theme,
  onToggleTheme,
}) => {
  if (!selectedFile) return null;

  return (
    <aside className="studio-column studio-left">
      <div className="theme-toggle-row px-1 mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">Appearance</span>
        <div 
          className={`theme-toggle ${theme}`} 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div className="theme-toggle-thumb">
            <span className="material-symbols-outlined text-xs">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </div>
        </div>
      </div>

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
