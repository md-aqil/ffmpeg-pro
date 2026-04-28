import React from 'react';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const summarizeOperation = (operation) => {
  if (!operation) return 'No tool selected';

  switch (operation.type) {
    case 'resize':
      return `${operation.width || 'Auto'} x ${operation.height || 'Auto'}`;
    case 'crop':
      return `${operation.width} x ${operation.height}`;
    case 'rotate':
      return `${operation.angle || 0} degrees`;
    case 'brightness':
    case 'contrast':
      return `${(operation.value ?? 0).toFixed(1)}`;
    case 'saturation':
      return `${(operation.value ?? 1).toFixed(1)}`;
    case 'effect':
      return operation.effect || 'blur';
    case 'watermark':
      return `${operation.position || 'bottom-right'}${operation.opacity !== undefined ? `, ${operation.opacity}%` : ''}`;
    case 'optimize':
      return `${operation.quality || 80}%`;
    default:
      return operation.type;
  }
};

const InspectorSidebar = ({
  selectedFile,
  activeOperation,
  enabledCount,
  totalCount,
  outputFormat,
  onFormatChange,
  quality,
  onQualityChange,
  resultFilename,
}) => {
  return (
    <aside className="order-3 flex w-80 flex-shrink-0 flex-col border-t border-white/5 bg-[#1c1b1d]/96 text-[#f4f4f5] max-sm:w-full lg:border-l lg:border-t-0">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
          Inspector
        </div>
        <div className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#e5e1e4]">
          Properties
        </div>
        <div className="mt-2 text-xs text-[#8b88a1]">
          {enabledCount} active / {totalCount} tools
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
              Metadata
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-[#8b88a1]">File</span>
              <span className="max-w-[10rem] truncate font-medium text-[#e5e1e4]">
                {selectedFile?.name || 'No file selected'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-[#8b88a1]">Size</span>
              <span className="font-mono text-[#e5e1e4]">{formatBytes(selectedFile?.size)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-[#8b88a1]">Type</span>
              <span className="font-mono text-[#e5e1e4]">{selectedFile?.type || 'image/*'}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-[#e5e1e4]">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              data_object
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
              Active Tool
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-[#e5e1e4]">
                  {activeOperation?.type || 'None'}
                </div>
                <div className="mt-1 text-xs text-[#8b88a1]">
                  {summarizeOperation(activeOperation)}
                </div>
              </div>
              <div className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-200">
                {activeOperation?.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="rounded-xl bg-[#0e0e10] px-3 py-2 text-xs text-[#c7c4d7]">
              The active tool is edited inline in the pipeline. Use this panel for output settings and file context.
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-[#e5e1e4]">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              download
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
              Export Settings
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8b88a1]">
                <span>Quality</span>
                <span className="font-mono text-[#e5e1e4]">{quality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(event) => onQualityChange(parseInt(event.target.value, 10))}
                className="accent-indigo-400 h-8 w-full cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['png', 'PNG'],
                ['jpg', 'JPEG'],
                ['webp', 'WebP'],
                ['avif', 'AVIF'],
                ['tiff', 'TIFF'],
                ['pdf', 'PDF'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFormatChange(value)}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                    outputFormat === value
                      ? 'border border-indigo-400/30 bg-indigo-400/15 text-indigo-200'
                      : 'border border-white/[0.08] bg-[#0e0e10] text-[#c7c4d7] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-[#e5e1e4]">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              cloud_done
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
              Result
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-xs text-[#c7c4d7]">
            {resultFilename ? (
              <div className="space-y-2">
                <div className="text-[#e5e1e4]">Ready to download</div>
                <div className="font-mono text-[11px] break-all text-[#8b88a1]">{resultFilename}</div>
              </div>
            ) : (
              <div>No output has been generated yet.</div>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default InspectorSidebar;
