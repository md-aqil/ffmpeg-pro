import React, { useState, useRef, useCallback, useEffect } from 'react';
import './BeforeAfterSlider.css';

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel = 'Edited',
  isVisible,
  onClose,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'side-by-side', 'overlay'
  const containerRef = useRef(null);

  // Track container size for responsive adjustments
  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const handleResize = () => {
      // Container ref is available for future size-dependent features
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Size tracking available for precision controls
        console.debug('Comparison container:', { width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  // Handle mouse/touch drag
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current || !isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    setSliderPosition(clampedPercentage);
  }, [isDragging]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSliderPosition(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSliderPosition(prev => Math.min(100, prev + 1));
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible || !beforeImage || !afterImage) return null;

  return (
    <div className="before-after-overlay" onClick={onClose}>
      <div className="before-after-container" onClick={(e) => e.stopPropagation()} ref={containerRef}>
        {/* Top Toolbar */}
        <div className="ba-toolbar">
          <div className="ba-toolbar-left">
            <h3 className="ba-toolbar-title">Before & After Comparison</h3>
          </div>

          <div className="ba-toolbar-center">
            <div className="ba-view-mode-switcher">
              <button
                type="button"
                className={`ba-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split View"
              >
                <span className="material-symbols-outlined">compare</span>
                <span>Split</span>
              </button>
              <button
                type="button"
                className={`ba-mode-btn ${viewMode === 'side-by-side' ? 'active' : ''}`}
                onClick={() => setViewMode('side-by-side')}
                title="Side by Side"
              >
                <span className="material-symbols-outlined">view_column_2</span>
                <span>Side by Side</span>
              </button>
              <button
                type="button"
                className={`ba-mode-btn ${viewMode === 'overlay' ? 'active' : ''}`}
                onClick={() => setViewMode('overlay')}
                title="Overlay Fade"
              >
                <span className="material-symbols-outlined">opacity</span>
                <span>Overlay</span>
              </button>
            </div>
          </div>

          <div className="ba-toolbar-right">
            <div className="ba-slider-position">
              <span className="ba-position-label">{Math.round(sliderPosition)}%</span>
            </div>
            <button
              type="button"
              className="ba-tool-btn"
              onClick={onClose}
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Comparison Area */}
        <div className="ba-comparison-area">
          {viewMode === 'split' && (
            <div className="ba-split-view">
              {/* Before Image (Left) */}
              <div
                className="ba-image-layer ba-before"
                style={{ width: `${sliderPosition}%` }}
              >
                <img src={beforeImage} alt="Before" className="ba-image" />
                <div className="ba-label ba-label-before">{beforeLabel}</div>
              </div>

              {/* After Image (Right) */}
              <div
                className="ba-image-layer ba-after"
                style={{ width: `${100 - sliderPosition}%` }}
              >
                <img src={afterImage} alt="After" className="ba-image" />
                <div className="ba-label ba-label-after">{afterLabel}</div>
              </div>

              {/* Slider Handle */}
              <div
                className="ba-slider-handle"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="ba-slider-line" />
                <div className="ba-slider-button">
                  <span className="material-symbols-outlined">compare_arrows</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'side-by-side' && (
            <div className="ba-side-by-side-view">
              <div className="ba-side-panel">
                <img src={beforeImage} alt="Before" className="ba-image" />
                <div className="ba-label ba-label-before">{beforeLabel}</div>
              </div>
              <div className="ba-divider">
                <span className="material-symbols-outlined">swap_horiz</span>
              </div>
              <div className="ba-side-panel">
                <img src={afterImage} alt="After" className="ba-image" />
                <div className="ba-label ba-label-after">{afterLabel}</div>
              </div>
            </div>
          )}

          {viewMode === 'overlay' && (
            <div className="ba-overlay-view">
              <img src={beforeImage} alt="Before" className="ba-image ba-image-base" />
              <img
                src={afterImage}
                alt="After"
                className="ba-image ba-image-overlay"
                style={{ opacity: sliderPosition / 100 }}
              />
              <div className="ba-label ba-label-before">{beforeLabel}</div>
              <div className="ba-label ba-label-after">{afterLabel}</div>
              
              {/* Opacity Slider */}
              <div className="ba-overlay-controls">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="ba-opacity-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="ba-controls">
          <div className="ba-control-hint">
            <span className="material-symbols-outlined">touch_app</span>
            <span>Drag the slider to compare • Use arrow keys for precision • Press Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
