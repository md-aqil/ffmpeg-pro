import React from 'react';

const BottomStatus = ({
  progress,
  onDownload,
  hasResult,
  hasFile,
  isProcessing,
  selectedFile,
  resultFilename,
  errorMessage,
}) => {
  const percent = Math.round((progress.current / progress.total) * 100);

  return (
    <footer className="relative z-20 flex flex-shrink-0 items-center justify-between gap-4 border-t border-white/5 bg-[#131315]/96 px-4 py-3 backdrop-blur-[24px] sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c4d7]">
          <span className={`h-2 w-2 rounded-full ${errorMessage ? 'bg-red-400' : isProcessing ? 'bg-emerald-400 animate-pulse' : hasFile ? 'bg-indigo-300' : 'bg-white/30'}`} />
          <span className="hidden sm:inline">System</span>
          <span>{errorMessage ? 'Error' : progress.label}</span>
        </div>

        <div className="hidden min-w-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-[#8b88a1] md:flex">
          <span className="truncate">{selectedFile?.name || 'No file loaded'}</span>
          {resultFilename && <span className="text-[#e5e1e4]">· {resultFilename}</span>}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden w-56 sm:block">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b88a1]">
            <span>Render Queue</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={!hasResult}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#07006c] transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            download
          </span>
          Download Final
        </button>
      </div>
    </footer>
  );
};

export default BottomStatus;
