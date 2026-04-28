import React from 'react';

const Header = ({
  selectedFile,
  progress,
  onRender,
  onDownload,
  onBrowse,
  isProcessing,
  hasResult,
  hasFile,
  activeTool,
}) => {
  const fileLabel = selectedFile?.name || 'No file loaded';
  const progressPercent = Math.round((progress.current / progress.total) * 100);

  return (
    <header className="relative z-20 flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#201f22]/90 px-4 py-3 text-[#f4f4f5] shadow-[0_20px_50px_rgba(0,0,0,0.48)] backdrop-blur-[28px] sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-xs font-black tracking-[0.24em] text-[#f8fafc] shadow-[0_12px_30px_rgba(128,131,255,0.2)]">
          FX
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-sm font-semibold tracking-[-0.02em] text-[#f4f4f5] sm:text-lg">
              The Kinetic Pipeline
            </h1>
            <span className="hidden rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-200 sm:inline-flex">
              Image Studio
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#c7c4d7]">
            <span className="rounded-full bg-white/5 px-2.5 py-1">{fileLabel}</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1">Tool: {activeTool}</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1">Status: {progress.label}</span>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-6 lg:flex">
        <nav className="flex items-center gap-1 text-sm">
          <button className="rounded-full bg-white/5 px-3 py-1.5 font-semibold text-[#f4f4f5] transition-colors hover:bg-white/10">
            Editor
          </button>
          <button className="rounded-full px-3 py-1.5 text-[#c7c4d7] transition-colors hover:bg-white/5 hover:text-white">
            Assets
          </button>
          <button className="rounded-full px-3 py-1.5 text-[#c7c4d7] transition-colors hover:bg-white/5 hover:text-white">
            History
          </button>
        </nav>

        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#c7c4d7]">
          <span className={`h-2 w-2 rounded-full ${isProcessing ? 'bg-emerald-400 animate-pulse' : hasFile ? 'bg-indigo-300' : 'bg-white/30'}`} />
          {isProcessing ? 'Rendering' : hasFile ? 'Ready to render' : 'Waiting for file'}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBrowse}
          className="hidden rounded-full border border-white/[0.10] bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e5e1e4] transition-all hover:bg-white/10 lg:inline-flex"
        >
          Upload
        </button>

        <button
          type="button"
          onClick={onRender}
          disabled={!hasFile || isProcessing}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(128,131,255,0.22)] transition-all hover:translate-y-[-1px] active:translate-y-[0px] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isProcessing ? 'hourglass_top' : 'play_arrow'}
          </span>
          {isProcessing ? 'Rendering' : 'Render'}
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={!hasResult}
          className="hidden rounded-full border border-white/[0.10] bg-[#1c1b1d] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f4f4f5] transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35 md:inline-flex"
        >
          Download
        </button>

        <div className="hidden items-center gap-2 text-[#c7c4d7] md:flex">
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-white">settings</span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-white">help</span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-white">account_circle</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
      <div className="absolute left-0 right-0 top-full h-4 bg-gradient-to-b from-black/25 to-transparent" />
      <div className="sr-only" aria-live="polite">
        {progress.label} {progressPercent} percent
      </div>
    </header>
  );
};

export default Header;
