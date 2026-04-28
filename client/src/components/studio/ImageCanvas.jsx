import React, { useState } from 'react';

const DOCK_ITEMS = [
  { type: 'resize', label: 'Canvas', icon: 'aspect_ratio' },
  { type: 'crop', label: 'Crop', icon: 'crop' },
  { type: 'effect', label: 'Effects', icon: 'auto_awesome' },
  { type: 'watermark', label: 'Watermark', icon: 'branding_watermark' },
];

const ImageCanvas = ({
  previewUrl,
  resultUrl,
  viewMode,
  onViewModeChange,
  onUpload,
  onDropFile,
  selectedFile,
  activeNode,
  onFocusNode,
  isProcessing,
  progress,
  errorMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const displayUrl = viewMode === 'result' && resultUrl ? resultUrl : previewUrl;
  const showResultToggle = Boolean(resultUrl);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    onDropFile(file);
  };

  return (
    <section
      className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#0e0e10] px-4 py-5 sm:px-6 lg:px-8 ${
        isDragging ? 'bg-white/[0.03]' : ''
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{
        backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(128,131,255,0.16), transparent 38%), radial-gradient(circle at 20% 80%, rgba(192,193,255,0.08), transparent 22%)',
      }} />

      <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
        {!selectedFile ? (
          <button
            type="button"
            onClick={onUpload}
            className="group relative flex min-h-[28rem] w-full items-center justify-center overflow-hidden rounded-[1.25rem] border border-dashed border-indigo-400/35 bg-white/[0.03] transition-all hover:border-indigo-300/60 hover:bg-white/[0.05]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(128,131,255,0.14),_transparent_45%)] opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex max-w-lg flex-col items-center gap-5 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-400/10 text-indigo-200 shadow-[0_0_40px_rgba(128,131,255,0.12)]">
                <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  add
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#e5e1e4]">
                  Drop Source Asset
                </h2>
                <p className="text-sm leading-6 text-[#c7c4d7]">
                  Click to import or drag an image into the editor. The workspace will keep the same layout while the preview updates instantly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b88a1]">
                {['PNG', 'JPG', 'WEBP', 'AVIF', 'TIFF'].map((format) => (
                  <span key={format} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <span className="rounded-full border border-white/[0.08] bg-[#131315]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7] backdrop-blur">
                {selectedFile.name}
              </span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-200 backdrop-blur">
                {viewMode === 'result' && resultUrl ? 'Result' : 'Source'}
              </span>
            </div>

            {showResultToggle && (
              <div className="absolute right-4 top-4 z-20 flex overflow-hidden rounded-full border border-white/[0.08] bg-[#131315]/90 p-1 backdrop-blur">
                {[
                  ['source', 'Source'],
                  ['result', 'Result'],
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onViewModeChange(mode)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all ${
                      viewMode === mode
                        ? 'bg-indigo-400/15 text-indigo-200'
                        : 'text-[#8b88a1] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative w-full max-w-[min(100%,980px)]">
              <div className="absolute inset-0 rounded-[1.25rem] border border-dashed border-indigo-400/35" />
              <div className="absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

              {displayUrl ? (
                <img
                  alt="Pipeline preview"
                  src={displayUrl}
                  className="relative h-auto w-full rounded-[1.25rem] object-contain shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
                />
              ) : (
                <div className="flex min-h-[28rem] items-center justify-center rounded-[1.25rem] border border-dashed border-indigo-400/35 bg-white/[0.03] text-[#c7c4d7]">
                  No preview available.
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 rounded-[1.25rem]">
                <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-indigo-300" />
                <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-indigo-300" />
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-indigo-300" />
                <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-indigo-300" />
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/[0.08] bg-[#201f22]/90 px-2 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-[20px]">
              <div className="flex items-center gap-1 sm:gap-2">
                {DOCK_ITEMS.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onFocusNode(item.type)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all ${
                      activeNode === item.type
                        ? 'bg-indigo-400/15 text-indigo-200'
                        : 'text-[#c7c4d7] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="absolute inset-x-5 bottom-16 z-30 rounded-2xl border border-white/[0.08] bg-[#131315]/80 px-4 py-3 backdrop-blur-[20px]">
          <div className="flex items-center justify-between gap-4 text-xs text-[#c7c4d7]">
            <span>{progress.label}</span>
            <span className="font-mono text-[#e5e1e4]">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] transition-all duration-300"
              style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute left-5 top-5 z-30 max-w-md rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-[20px]">
          {errorMessage}
        </div>
      )}
    </section>
  );
};

export default ImageCanvas;
