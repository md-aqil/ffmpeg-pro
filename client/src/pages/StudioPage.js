import React, { useEffect, useMemo, useRef, useState } from 'react';
import { uploadFile, processImagePipeline, downloadFile, API_BASE_URL } from '../services/api';

const PIPELINE_META = {
  resize: {
    label: 'Canvas',
    icon: 'aspect_ratio',
    hint: 'Frame and output size',
    defaults: { width: 1920, height: 1080, ratio: '16:9' },
  },
  crop: {
    label: 'Crop',
    icon: 'crop',
    hint: 'Trim the visible area',
    defaults: { x: 0, y: 0, width: 100, height: 100 },
  },
  rotate: {
    label: 'Rotate',
    icon: 'rotate_right',
    hint: 'Reorient the image',
    defaults: { angle: 90 },
  },
  brightness: {
    label: 'Brightness',
    icon: 'wb_sunny',
    hint: 'Exposure balance',
    defaults: { value: 0 },
  },
  contrast: {
    label: 'Contrast',
    icon: 'tune',
    hint: 'Tone separation',
    defaults: { value: 0 },
  },
  saturation: {
    label: 'Saturation',
    icon: 'palette',
    hint: 'Color intensity',
    defaults: { value: 1 },
  },
  effect: {
    label: 'Effects',
    icon: 'auto_awesome',
    hint: 'Stylized filters',
    defaults: { effect: 'blur' },
  },
  watermark: {
    label: 'Watermark',
    icon: 'branding_watermark',
    hint: 'Text and placement',
    defaults: { text: '', position: 'bottom-right', opacity: 50 },
  },
    hint: 'Compression quality',
    defaults: { quality: 80 },
  },
  visualizer: {
    label: 'Visualizer',
    icon: 'equalizer',
    hint: 'Audio-reactive waveform',
    defaults: { style: 'waves', audioFileId: null, audioName: '' },
  },
};

const PIPELINE_ORDER = [
  'resize',
  'crop',
  'rotate',
  'brightness',
  'contrast',
  'saturation',
  'effect',
  'watermark',
  'optimize',
  'visualizer',
];

const createInitialPipeline = () => PIPELINE_ORDER.map((type) => ({
  id: type,
  type,
  enabled: type === 'resize',
  ...PIPELINE_META[type].defaults,
}));

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const buildConvertedUrl = (filename) => {
  return `${API_BASE_URL.replace('/api', '')}/converted/${filename}`;
};

const StudioPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [fileId, setFileId] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [progress, setProgress] = useState({ current: 0, total: 100, label: 'READY' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState(95);
  const [activeNode, setActiveNode] = useState('resize');
  const [pipeline, setPipeline] = useState(createInitialPipeline);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const activeOperation = useMemo(
    () => pipeline.find((item) => item.type === activeNode) || pipeline[0],
    [pipeline, activeNode],
  );

  const enabledOperations = useMemo(
    () => pipeline.filter((item) => item.enabled).map(({ enabled, ...operation }) => operation),
    [pipeline],
  );

  const hasResult = Boolean(resultFilename);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setResultUrl('');
      setResultFilename('');
      setFileId(null);
      setImageSize({ width: 0, height: 0 });
      setProgress({ current: 0, total: 100, label: 'READY' });
      setErrorMessage('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setResultUrl('');
    setResultFilename('');
    setFileId(null);
    setProgress({ current: 0, total: 100, label: 'READY' });
    setErrorMessage('');

    const image = new Image();
    image.onload = () => {
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = nextUrl;

    return () => {
      URL.revokeObjectURL(nextUrl);
      if (objectUrlRef.current === nextUrl) {
        objectUrlRef.current = null;
      }
    };
  }, [selectedFile]);

  const updateOperation = (type, updates) => {
    setPipeline((current) => current.map((operation) => (
      operation.type === type ? { ...operation, ...updates } : operation
    )));
  };

  const setActiveOperation = (type) => {
    setActiveNode(type);
    setPipeline((current) => current.map((operation) => (
      operation.type === type ? { ...operation, enabled: true } : operation
    )));
  };

  const toggleOperation = (type) => {
    setPipeline((current) => current.map((operation) => (
      operation.type === type ? { ...operation, enabled: !operation.enabled } : operation
    )));

    if (activeNode === type) {
      const fallback = pipeline.find((operation) => operation.type !== type && operation.enabled);
      setActiveNode(fallback?.type || 'resize');
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.');
      return;
    }
    setSelectedFile(file);
    setActiveNode('resize');
  };

  const handleFileInput = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleRender = async () => {
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      let currentFileId = fileId;

      if (!currentFileId) {
        setProgress({ current: 12, total: 100, label: 'UPLOADING' });
        const uploadData = await uploadFile(selectedFile);
        if (!uploadData?.success) {
          throw new Error(uploadData?.error || 'Upload failed');
        }
        currentFileId = uploadData.fileId;
        setFileId(currentFileId);
      }

      setProgress({ current: 48, total: 100, label: 'PROCESSING' });

      const response = await processImagePipeline(
        currentFileId,
        selectedFile.name,
        enabledOperations,
        outputFormat,
        quality,
      );

      if (!response?.success) {
        throw new Error(response?.error || 'Pipeline processing failed');
      }

      const filename = response?.data?.filename;
      if (!filename) {
        throw new Error('The server did not return an output filename.');
      }

      setResultFilename(filename);
      setResultUrl(buildConvertedUrl(filename));
      setProgress({ current: 100, total: 100, label: 'COMPLETE' });
    } catch (error) {
      console.error(error);
      setProgress({ current: 0, total: 100, label: 'ERROR' });
      setErrorMessage(error.message || 'Unable to process the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultFilename) return;
    await downloadFile(resultFilename);
  };

  const activeSummary = (() => {
    if (!activeOperation) return 'No tool selected';
    switch (activeOperation.type) {
      case 'resize':
        return `${activeOperation.width || 'Auto'} × ${activeOperation.height || 'Auto'}`;
      case 'crop':
        return `${activeOperation.width} × ${activeOperation.height}`;
      case 'rotate':
        return `${activeOperation.angle || 0}°`;
      case 'brightness':
      case 'contrast':
        return `${(activeOperation.value ?? 0).toFixed(1)}`;
      case 'saturation':
        return `${(activeOperation.value ?? 1).toFixed(1)}`;
      case 'effect':
        return activeOperation.effect || 'blur';
      case 'watermark':
        return `${activeOperation.position || 'bottom-right'}, ${activeOperation.opacity ?? 50}%`;
      case 'optimize':
        return `${activeOperation.quality || 80}% quality`;
      case 'visualizer':
        return `${activeOperation.style || 'waves'} (${activeOperation.audioName || 'No audio'})`;
      default:
        return activeOperation.type;
    }
  })();

  const displayUrl = resultUrl || previewUrl;
  const percent = Math.round((progress.current / progress.total) * 100);
  const widthLabel = imageSize.width ? `${imageSize.width}` : '1920';
  const heightLabel = imageSize.height ? `${imageSize.height}` : '1080';

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0e0e10] text-[#e5e1e4]">
      <header className="bg-[#201f22]/70 backdrop-blur-[30px] font-['Inter'] tracking-[-0.02em] antialiased full-width top-0 h-14 border-b border-[#ffffff]/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center w-full px-6 z-50 flex-shrink-0">
        <div className="flex min-w-0 items-center gap-8">
          <span className="text-lg font-bold tracking-tighter text-[#e5e1e4]">The Kinetic Pipeline</span>
          <nav className="hidden md:flex gap-6 text-sm">
            <button className="text-indigo-300 font-semibold transition-colors">Editor</button>
            <button className="text-[#c7c4d7] hover:bg-[#39393b] hover:text-white transition-colors px-2 py-1 rounded">
              Assets
            </button>
            <button className="text-[#c7c4d7] hover:bg-[#39393b] hover:text-white transition-colors px-2 py-1 rounded">
              History
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleRender}
            disabled={!selectedFile || isProcessing}
            className="bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] text-white px-5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest inner-glow-top hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[14px] align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            {isProcessing ? 'Rendering' : 'Render'}
          </button>
          <div className="flex gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">settings</span>
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">help</span>
            <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors">account_circle</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="bg-[#0e0e10] font-['Inter'] text-xs uppercase tracking-widest docked left-0 w-64 h-full flex flex-col py-6 space-y-2 border-r border-white/5 flex-shrink-0">
          <div className="px-6 mb-6 relative">
            <h2 className="text-[#e5e1e4] font-black">PIPELINE</h2>
            <p className="text-[10px] text-on-surface-variant opacity-50">V0.1-ALPHA</p>
            <span className="absolute right-4 -top-1 rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
              V0.2
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-2">
            <div className="text-[#c7c4d7] flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#1c1b1d] transition-all cursor-pointer rounded-sm group">
              <button
                type="button"
                onClick={() => setActiveOperation('resize')}
                className="flex items-center gap-3 text-left"
              >
                <span className="material-symbols-outlined text-sm">input</span>
                <span>Input</span>
              </button>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.6)]" />
            </div>

            {PIPELINE_ORDER.map((type) => {
              const meta = PIPELINE_META[type];
              const op = pipeline.find((item) => item.type === type);
              const isActive = activeNode === type;

              return (
                <div
                  key={type}
                  className={`${isActive ? 'bg-surface-container border border-indigo-400/20 rounded-lg p-4 space-y-4 shadow-xl' : 'text-[#c7c4d7] flex items-center gap-3 px-4 py-3 hover:bg-[#1c1b1d] transition-all cursor-pointer rounded-sm'}`}
                >
                  {isActive ? (
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={() => setActiveOperation(type)}
                        className="flex w-full items-center justify-between mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {meta.icon}
                          </span>
                          <span className="text-white font-bold tracking-normal normal-case">{meta.label}</span>
                        </div>
                        <div
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOperation(type);
                          }}
                          role="switch"
                          aria-checked={op.enabled}
                          className={`relative h-7 w-11 rounded-full border transition-colors cursor-pointer ${op.enabled ? 'border-indigo-300 bg-indigo-400/20' : 'border-white/20 bg-white/5'}`}
                        >
                          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${op.enabled ? 'left-5' : 'left-0.5'}`} />
                        </div>
                      </button>

                      <div className="space-y-3">
                        <p className="text-[9px] text-on-surface-variant">{meta.hint}</p>

                        {type === 'resize' && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-on-surface-variant">WIDTH (PX)</label>
                                <input
                                  type="text"
                                  value={op.width ?? ''}
                                  onChange={(event) => updateOperation('resize', { width: parseInt(event.target.value, 10) || 0 })}
                                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-white text-xs p-1 font-mono tabular-nums outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-on-surface-variant">HEIGHT (PX)</label>
                                <input
                                  type="text"
                                  value={op.height ?? ''}
                                  onChange={(event) => updateOperation('resize', { height: parseInt(event.target.value, 10) || 0 })}
                                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-white text-xs p-1 font-mono tabular-nums outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-center py-1">
                              <span className="material-symbols-outlined text-primary-container text-lg cursor-pointer hover:text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                                link
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1">
                              {['1:1', '4:3', '16:9', '21:9', '3:2', '9:16'].map((ratio) => (
                                <button
                                  key={ratio}
                                  type="button"
                                  onClick={() => updateOperation('resize', { ratio })}
                                  className={`text-[10px] py-1.5 rounded-sm transition-colors border ${op.ratio === ratio ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-surface-container-highest text-on-surface-variant hover:text-white border-transparent'}`}
                                >
                                  {ratio}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {type === 'crop' && (
                          <div className="grid grid-cols-2 gap-3">
                            {['x', 'y', 'width', 'height'].map((field) => (
                              <div key={field} className="space-y-1">
                                <label className="text-[9px] text-on-surface-variant uppercase">{field}</label>
                                <input
                                  type="text"
                                  value={op[field] ?? ''}
                                  onChange={(event) => updateOperation('crop', { [field]: parseInt(event.target.value, 10) || 0 })}
                                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-white text-xs p-1 font-mono tabular-nums outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {type === 'rotate' && (
                          <div className="grid grid-cols-4 gap-2">
                            {[0, 90, 180, 270].map((angle) => (
                              <button
                                key={angle}
                                type="button"
                                onClick={() => updateOperation('rotate', { angle })}
                                className={`text-[10px] py-1.5 rounded-sm transition-colors border ${op.angle === angle ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-surface-container-highest text-on-surface-variant hover:text-white border-transparent'}`}
                              >
                                {angle}°
                              </button>
                            ))}
                          </div>
                        )}

                        {type === 'brightness' || type === 'contrast' || type === 'saturation' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-on-surface-variant capitalize">{meta.label}</label>
                              <span className="text-primary font-mono">
                                {(op.value ?? (type === 'saturation' ? 1 : 0)).toFixed(1)}
                              </span>
                            </div>
                            <div className="relative h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                              <input
                                type="range"
                                min={type === 'saturation' ? 0 : -1}
                                max={type === 'saturation' ? 3 : 1}
                                step="0.1"
                                value={op.value ?? (type === 'saturation' ? 1 : 0)}
                                onChange={(event) => updateOperation(type, { value: parseFloat(event.target.value) })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                              />
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-container z-10"
                                style={{ width: `${(((op.value ?? (type === 'saturation' ? 1 : 0)) + 1) / 4) * 100}%` }}
                              />
                              <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg z-30"
                                style={{ left: `calc(${(((op.value ?? (type === 'saturation' ? 1 : 0)) + 1) / 4) * 100}% - 6px)` }}
                              />
                            </div>
                          </div>
                        ) : null}

                        {type === 'effect' && (
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              ['blur', 'Blur'],
                              ['sharpen', 'Sharpen'],
                              ['grayscale', 'Gray'],
                              ['sepia', 'Sepia'],
                            ].map(([effect, label]) => (
                              <button
                                key={effect}
                                type="button"
                                onClick={() => updateOperation('effect', { effect })}
                                className={`py-1.5 rounded-sm transition-colors border text-[10px] ${op.effect === effect ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-surface-container-highest text-on-surface-variant hover:text-white border-transparent'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}

                        {type === 'watermark' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] text-on-surface-variant uppercase">Text</label>
                              <input
                                type="text"
                                value={op.text || ''}
                                onChange={(event) => updateOperation('watermark', { text: event.target.value })}
                                placeholder="© Your Brand"
                                className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-white text-xs p-1 font-mono outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                ['top-left', 'Top Left'],
                                ['top-right', 'Top Right'],
                                ['bottom-left', 'Bottom Left'],
                                ['bottom-right', 'Bottom Right'],
                              ].map(([position, label]) => (
                                <button
                                  key={position}
                                  type="button"
                                  onClick={() => updateOperation('watermark', { position })}
                                  className={`py-1.5 rounded-sm transition-colors border text-[10px] ${op.position === position ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-surface-container-highest text-on-surface-variant hover:text-white border-transparent'}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-on-surface-variant">Opacity</label>
                                <span className="text-primary font-mono">{op.opacity ?? 50}%</span>
                              </div>
                              <div className="relative h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={op.opacity ?? 50}
                                  onChange={(event) => updateOperation('watermark', { opacity: parseInt(event.target.value, 10) })}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div
                                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-container z-10"
                                  style={{ width: `${op.opacity ?? 50}%` }}
                                />
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg z-30"
                                  style={{ left: `calc(${op.opacity ?? 50}% - 6px)` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {type === 'optimize' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-on-surface-variant">Quality</label>
                              <span className="text-primary font-mono">{op.quality ?? 80}%</span>
                            </div>
                            <div className="relative h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={op.quality ?? 80}
                                onChange={(event) => updateOperation('optimize', { quality: parseInt(event.target.value, 10) })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                              />
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-container z-10"
                                style={{ width: `${op.quality ?? 80}%` }}
                              />
                              <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg z-30"
                                style={{ left: `calc(${op.quality ?? 80}% - 6px)` }}
                              />
                            </div>
                          </div>
                        )}
                        {type === 'visualizer' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] text-on-surface-variant uppercase">Style</label>
                              <select 
                                className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-white text-xs p-1 outline-none"
                                value={op.style || 'waves'}
                                onChange={(e) => updateOperation('visualizer', { style: e.target.value })}
                              >
                                <option value="waves">Show Waves</option>
                                <option value="spectrum">Spectrum</option>
                                <option value="volumes">Volume Bars</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-on-surface-variant uppercase">Audio Source</label>
                              <button 
                                onClick={() => document.getElementById('audio-upload-input')?.click()}
                                className="w-full py-2 bg-white/5 border border-white/10 rounded text-[10px] text-on-surface-variant hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-sm">music_note</span>
                                <div className="min-w-0 flex-1 truncate">
                                  {op.audioName || 'Choose Audio'}
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveOperation(type)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 mt-auto pb-4">
            <button
              type="button"
              onClick={() => setActiveOperation('resize')}
              className="w-full border border-dashed border-outline-variant text-on-surface-variant py-3 rounded hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="text-xs font-bold uppercase tracking-wider">Add Node</span>
            </button>
          </div>
        </aside>

        <section
          className="flex-1 bg-surface-container-lowest relative flex items-center justify-center overflow-hidden p-8"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const droppedFile = event.dataTransfer.files?.[0];
            handleFile(droppedFile);
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 70%)' }} />

          <div className="relative w-full h-full max-w-5xl max-h-[716px] flex items-center justify-center">
            {!selectedFile ? (
              <button
                type="button"
                onClick={triggerUpload}
                className="w-full h-full border-2 border-dashed border-indigo-400/40 rounded-sm flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/5 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-indigo-400 text-4xl">add</span>
                </div>
                <div className="text-center max-w-lg px-6">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Drop Source Asset</h3>
                  <p className="text-sm text-on-surface-variant opacity-70 mt-2">
                    Click to import or drag an image into the editor. The workspace keeps the same layout while the preview updates instantly.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['PNG', 'JPG', 'WEBP', 'AVIF', 'TIFF'].map((format) => (
                    <span key={format} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c4d7]">
                      {format}
                    </span>
                  ))}
                </div>
              </button>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-dashed border-indigo-400/40 rounded-sm z-10 pointer-events-none flex items-start justify-start p-4">
                  <div className="bg-indigo-500/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white tracking-widest">
                    {widthLabel} x {heightLabel}
                  </div>
                </div>

                {displayUrl ? (
                  <img
                    alt="Pipeline Preview"
                    className="w-full h-full object-cover rounded shadow-2xl"
                    src={displayUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#c7c4d7] border border-dashed border-indigo-400/40 rounded-sm">
                    Preview not available
                  </div>
                )}

                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 z-20" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 z-20" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 z-20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 z-20" />
              </div>
            )}

            <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-[#201f22]/80 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10">
              {[
                ['resize', 'Canvas', 'aspect_ratio'],
                ['crop', 'Crop', 'crop'],
                ['effect', 'Effects', 'magic_button'],
                ['watermark', 'Watermark', 'branding_watermark'],
              ].map(([type, label, icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveOperation(type)}
                  className={`flex flex-col items-center justify-center rounded-lg px-6 py-2 transition-all ${activeNode === type ? 'bg-indigo-500/20 text-indigo-300' : 'text-[#c7c4d7] hover:bg-white/5'}`}
                >
                  <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                  <span className="font-['Inter'] text-[10px] font-bold uppercase">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </section>

        <aside className="bg-[#1c1b1d] font-['Inter'] text-[11px] font-medium docked right-0 w-72 h-full flex flex-col border-l border-[#ffffff]/5 flex-shrink-0">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-[#e5e1e4] text-xs font-black uppercase tracking-widest">INSPECTOR</h2>
            <p className="text-[9px] text-on-surface-variant">PROPERTIES</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="uppercase tracking-wider font-bold">Metadata</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-on-surface-variant">Dimensions</span>
                  <span className="text-white font-mono">
                    {imageSize.width && imageSize.height ? `${imageSize.width} × ${imageSize.height}` : '---'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-on-surface-variant">Size</span>
                  <span className="text-white font-mono">{formatBytes(selectedFile?.size)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-on-surface-variant">Profile</span>
                  <span className="text-white font-mono">P3 Display</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="uppercase tracking-wider font-bold">Export Settings</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-on-surface-variant">Quality</label>
                    <span className="text-primary font-mono">{quality}%</span>
                  </div>
                  <div className="relative h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(event) => setQuality(parseInt(event.target.value, 10))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-container z-10" style={{ width: `${quality}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg z-30" style={{ left: `calc(${quality}% - 6px)` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-on-surface-variant">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['jpeg', 'JPEG'],
                      ['png', 'PNG'],
                      ['webp', 'WebP'],
                      ['tiff', 'TIFF'],
                      ['pdf', 'PDF'],
                      ['avif', 'AVIF'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setOutputFormat(value)}
                        className={`border py-1.5 rounded-sm transition-colors ${outputFormat === value ? 'border-indigo-400 text-indigo-400' : 'bg-surface-container-low border-white/10 text-on-surface-variant hover:text-white'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#e5e1e4]">
                <span className="material-symbols-outlined text-sm">data_object</span>
                <span className="uppercase tracking-wider font-bold">Active Tool</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Node</span>
                  <span className="text-white font-mono">{PIPELINE_META[activeNode]?.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Status</span>
                  <span className="text-white font-mono">{activeOperation?.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-[11px] leading-5 text-on-surface-variant">
                  {activeSummary}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#e5e1e4]">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span className="uppercase tracking-wider font-bold">Result</span>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4 text-[11px] leading-5 text-on-surface-variant">
                {hasResult ? resultFilename : 'No output has been generated yet.'}
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-10 bg-surface-dim border-t border-white/5 flex items-center justify-between px-6 z-50 flex-shrink-0">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${errorMessage ? 'bg-red-400' : isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
            System: {errorMessage ? 'Error' : progress.label}
          </span>
          <span className="text-primary-container">Processing: {percent}%</span>
          {errorMessage && <span className="text-red-300 normal-case tracking-normal">{errorMessage}</span>}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasResult}
          className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] text-white h-full px-8 text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Download Final
        </button>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
    </div>
  );
};

export default StudioPage;
