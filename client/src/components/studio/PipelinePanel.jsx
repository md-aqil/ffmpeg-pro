import React from 'react';

const TOOL_META = {
  resize: {
    label: 'Canvas',
    icon: 'aspect_ratio',
    hint: 'Frame and output size',
  },
  crop: {
    label: 'Crop',
    icon: 'crop',
    hint: 'Trim the visible area',
  },
  rotate: {
    label: 'Rotate',
    icon: 'rotate_right',
    hint: 'Reorient the image',
  },
  brightness: {
    label: 'Brightness',
    icon: 'wb_sunny',
    hint: 'Exposure balance',
  },
  contrast: {
    label: 'Contrast',
    icon: 'tune',
    hint: 'Tone separation',
  },
  saturation: {
    label: 'Saturation',
    icon: 'palette',
    hint: 'Color intensity',
  },
  effect: {
    label: 'Effects',
    icon: 'auto_awesome',
    hint: 'Stylized filters',
  },
  watermark: {
    label: 'Watermark',
    icon: 'branding_watermark',
    hint: 'Text and placement',
  },
  optimize: {
    label: 'Optimize',
    icon: 'speed',
    hint: 'Compression quality',
  },
  visualizer: {
    label: 'Visualizer',
    icon: 'equalizer',
    hint: 'Audio-reactive waveform',
  },
};

const NODE_ORDER = [
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

const PipelinePanel = ({
  pipeline,
  activeNode,
  onFocusNode,
  onToggleNode,
  onUpdateNode,
  onAddNode,
}) => {
  const activeCount = pipeline.filter((operation) => operation.enabled).length;
  const availableNodes = NODE_ORDER.filter((type) => {
    const operation = pipeline.find((item) => item.type === type);
    return operation && !operation.enabled;
  });

  const renderControlGroup = (label, children) => (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c4d7]">{label}</div>
      {children}
    </div>
  );

  const renderOperationControls = (operation) => {
    switch (operation.type) {
      case 'resize':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {renderControlGroup(
                'Width',
                <input
                  type="number"
                  value={operation.width ?? ''}
                  onChange={(event) => onUpdateNode('resize', {
                    width: event.target.value === '' ? undefined : parseInt(event.target.value, 10),
                  })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e10] px-3 py-2 text-sm text-[#e5e1e4] outline-none transition-colors placeholder:text-[#6b6980] focus:border-indigo-400/50"
                  placeholder="Auto"
                />
              )}
              {renderControlGroup(
                'Height',
                <input
                  type="number"
                  value={operation.height ?? ''}
                  onChange={(event) => onUpdateNode('resize', {
                    height: event.target.value === '' ? undefined : parseInt(event.target.value, 10),
                  })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e10] px-3 py-2 text-sm text-[#e5e1e4] outline-none transition-colors placeholder:text-[#6b6980] focus:border-indigo-400/50"
                  placeholder="Auto"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['1:1', '4:3', '16:9', '21:9', '3:2', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onUpdateNode('resize', { ratio })}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                    operation.ratio === ratio
                      ? 'border border-indigo-400/30 bg-indigo-400/15 text-indigo-200'
                      : 'border border-white/[0.08] bg-white/5 text-[#c7c4d7] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        );
      case 'crop':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['x', 'y', 'width', 'height'].map((field) => (
              <label key={field} className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c4d7]">{field}</span>
                <input
                  type="number"
                  value={operation[field] ?? 0}
                  onChange={(event) => onUpdateNode('crop', { [field]: parseInt(event.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e10] px-3 py-2 text-sm text-[#e5e1e4] outline-none transition-colors focus:border-indigo-400/50"
                />
              </label>
            ))}
          </div>
        );
      case 'rotate':
        return (
          <div className="grid grid-cols-4 gap-2">
            {[0, 90, 180, 270].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onUpdateNode('rotate', { angle })}
                className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                  (operation.angle ?? 0) === angle
                    ? 'border border-indigo-400/30 bg-indigo-400/15 text-indigo-200'
                    : 'border border-white/[0.08] bg-white/5 text-[#c7c4d7] hover:bg-white/10 hover:text-white'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        );
      case 'brightness':
      case 'contrast':
      case 'saturation': {
        const min = operation.type === 'saturation' ? 0 : -1;
        const max = operation.type === 'saturation' ? 3 : 1;
        const step = 0.1;
        const value = operation.value ?? (operation.type === 'saturation' ? 1 : 0);

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#c7c4d7]">
              <span>{TOOL_META[operation.type].hint}</span>
              <span className="font-mono text-[#e5e1e4]">{value.toFixed(1)}</span>
            </div>
            <div className="relative h-8">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onUpdateNode(operation.type, { value: parseFloat(event.target.value) })}
                className="accent-indigo-400 absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
              />
            </div>
          </div>
        );
      }
      case 'effect':
        return (
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
                onClick={() => onUpdateNode('effect', { effect })}
                className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                  (operation.effect || 'blur') === effect
                    ? 'border border-indigo-400/30 bg-indigo-400/15 text-indigo-200'
                    : 'border border-white/[0.08] bg-white/5 text-[#c7c4d7] hover:bg-white/10 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        );
      case 'watermark':
        return (
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c4d7]">Text</span>
              <input
                type="text"
                value={operation.text || ''}
                onChange={(event) => onUpdateNode('watermark', { text: event.target.value })}
                placeholder="Brand mark"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e10] px-3 py-2 text-sm text-[#e5e1e4] outline-none transition-colors placeholder:text-[#6b6980] focus:border-indigo-400/50"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['top-left', 'TL'],
                ['top-right', 'TR'],
                ['bottom-left', 'BL'],
                ['bottom-right', 'BR'],
              ].map(([position, label]) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => onUpdateNode('watermark', { position })}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                    (operation.position || 'bottom-right') === position
                      ? 'border border-indigo-400/30 bg-indigo-400/15 text-indigo-200'
                      : 'border border-white/[0.08] bg-white/5 text-[#c7c4d7] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#c7c4d7]">
                <span>Opacity</span>
                <span className="font-mono text-[#e5e1e4]">{operation.opacity ?? 50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={operation.opacity ?? 50}
                onChange={(event) => onUpdateNode('watermark', { opacity: parseInt(event.target.value, 10) })}
                className="accent-indigo-400 h-8 w-full cursor-pointer appearance-none bg-transparent"
              />
            </div>
          </div>
        );
      case 'optimize':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#c7c4d7]">
              <span>Quality</span>
              <span className="font-mono text-[#e5e1e4]">{operation.quality ?? 80}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={operation.quality ?? 80}
              onChange={(event) => onUpdateNode('optimize', { quality: parseInt(event.target.value, 10) })}
              className="accent-indigo-400 h-8 w-full cursor-pointer appearance-none bg-transparent"
            />
          </div>
        );
      case 'visualizer':
        return (
          <div className="space-y-4">
            {renderControlGroup(
              'Style',
              <select
                value={operation.style || 'waves'}
                onChange={(e) => onUpdateNode('visualizer', { style: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e10] px-3 py-2 text-sm text-[#e5e1e4] outline-none transition-colors focus:border-indigo-400/50"
              >
                <option value="waves">Show Waves</option>
                <option value="spectrum">Spectrum</option>
                <option value="volumes">Volume Bars</option>
              </select>
            )}
            {renderControlGroup(
              'Audio Source',
              <button
                type="button"
                onClick={() => document.getElementById('audio-upload-input')?.click()}
                className="w-full rounded-xl border border-dashed border-white/[0.12] bg-[#131315] px-4 py-3 text-left text-sm text-[#e5e1e4] outline-none transition-colors hover:border-indigo-400/30"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-200">music_note</span>
                  <div className="min-w-0 flex-1 truncate">
                    {operation.audioName || 'Choose Audio...'}
                  </div>
                </div>
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="order-2 flex w-80 flex-shrink-0 flex-col border-b border-white/5 bg-[#0e0e10]/96 text-[#f4f4f5] max-sm:w-full lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between px-5 py-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
            Pipeline
          </div>
          <div className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#e5e1e4]">
            Image operations
          </div>
          <div className="mt-2 text-xs text-[#8b88a1]">
            {activeCount} active steps
          </div>
        </div>

        <div className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200">
          V0.2
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-5">
        <div className="mb-2 flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/[0.08]">
          <button
            type="button"
            onClick={() => onFocusNode('resize')}
            className="flex items-center gap-3 text-left"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-200" style={{ fontVariationSettings: "'FILL' 1" }}>
              input
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c7c4d7]">
                Input
              </div>
              <div className="text-sm text-[#e5e1e4]">{pipeline[0]?.enabled ? 'Connected' : 'Waiting'}</div>
            </div>
          </button>
          <span className="h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_12px_rgba(192,193,255,0.65)]" />
        </div>

        <div className="space-y-2">
          {pipeline.map((operation) => {
            const meta = TOOL_META[operation.type];
            const isActive = activeNode === operation.type;

            return (
              <section
                key={operation.id}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isActive
                    ? 'border-indigo-400/30 bg-white/[0.07] shadow-[0_16px_40px_rgba(0,0,0,0.28)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/5'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => onFocusNode(operation.type)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      operation.enabled ? 'bg-indigo-400/15 text-indigo-200' : 'bg-white/5 text-[#8b88a1]'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {meta?.icon || 'settings'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#e5e1e4]">
                        {meta?.label || operation.type}
                      </div>
                      <div className="truncate text-[11px] text-[#8b88a1]">
                        {meta?.hint || operation.type}
                      </div>
                    </div>
                  </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleNode(operation.type)}
                    aria-pressed={operation.enabled}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      operation.enabled ? 'bg-indigo-400/35' : 'bg-white/[0.08]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#e5e1e4] shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all ${
                        operation.enabled ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {isActive && operation.enabled && (
                  <div className="border-t border-white/[0.08] px-4 pb-4 pt-2">
                    <div className="mb-4 text-xs text-[#8b88a1]">
                      {meta?.hint || operation.type}
                    </div>
                    {renderOperationControls(operation)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/[0.08] p-4">
        <div className="space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8b88a1]">
            Add node
          </div>
          <div className="relative">
            <select
              value=""
              onChange={(event) => {
                if (event.target.value) {
                  onAddNode(event.target.value);
                  event.target.value = '';
                }
              }}
              className="w-full appearance-none rounded-2xl border border-dashed border-white/[0.12] bg-[#131315] px-4 py-3 pr-12 text-sm text-[#e5e1e4] outline-none transition-colors hover:border-indigo-400/30 focus:border-indigo-400/50"
              disabled={!availableNodes.length}
            >
              <option value="" disabled>
                {availableNodes.length ? 'Choose a node to enable' : 'All nodes enabled'}
              </option>
              {availableNodes.map((type) => (
                <option key={type} value={type}>
                  {TOOL_META[type]?.label || type}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b88a1]">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PipelinePanel;
