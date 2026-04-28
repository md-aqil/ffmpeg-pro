import React, { useRef, useEffect, useState } from 'react';
import InteractiveCropOverlay from '../../components/studio/InteractiveCropOverlay';
import { applyBrightness, applyContrast, applyGrayscale, applySepia, applyBlur } from '../../utils/canvasFilters';

const StudioCanvas = ({
  previewDisplayUrl,
  selectedFileName,
  renderedPreviewUrl,
  canvasFrameStyle,
  previewImageStyle,
  resizeOverlayStyle,
  isResizing,
  resizeAspectLabel,
  targetWidthLabel,
  targetHeightLabel,
  originalAspectLabel,
  onResizeStart,
  watermarkPreview,
  onOpenFilePicker,
  isBatchMode,
  isCropMode,
  cropState,
  onCropChange,
  onCropComplete,
  cropAspectRatio,
  onCropAspectRatioChange,
  onExitCropMode,
  imageSize,
  cropOperation,
  effectOperation,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
}) => {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (isCropMode || isResizing) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x * zoom,
      y: e.clientY - pan.y * zoom,
    };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    onPanChange({
      x: (e.clientX - panStartRef.current.x) / zoom,
      y: (e.clientY - panStartRef.current.y) / zoom,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!previewDisplayUrl) {
      console.log("StudioCanvas: No previewDisplayUrl provided");
      return;
    }

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      console.log("StudioCanvas: Image loaded", img.width, "x", img.height);
      const isCropped = cropOperation && cropOperation.enabled && !isCropMode;

      if (isCropped) {
        const { x, y, width, height, targetWidth, targetHeight, fillColor } = cropOperation;
        const finalWidth = targetWidth > 0 ? targetWidth : width;
        const finalHeight = targetHeight > 0 ? targetHeight : height;
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        if (finalWidth > width || finalHeight > height) {
          ctx.fillStyle = fillColor || "#000000";
          ctx.fillRect(0, 0, finalWidth, finalHeight);
        }

        const destX = (finalWidth - width) / 2;
        const destY = (finalHeight - height) / 2;
        ctx.drawImage(img, x, y, width, height, destX, destY, width, height);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }

      if (effectOperation && effectOperation.enabled) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (effectOperation.brightness) {
          applyBrightness(imageData, effectOperation.brightness);
        }
        if (effectOperation.contrast) {
          applyContrast(imageData, effectOperation.contrast);
        }
        if (effectOperation.effect === "grayscale") {
          applyGrayscale(imageData);
        }
        if (effectOperation.effect === "sepia") {
          applySepia(imageData);
        }
        ctx.putImageData(imageData, 0, 0);

        if (effectOperation.effect === "blur") {
          applyBlur(ctx, canvas, 5);
        }
      }
    };

    img.onerror = (err) => {
      console.error("StudioCanvas: Image load error", err, "for URL:", previewDisplayUrl);
    };

    console.log("StudioCanvas: Loading image from:", previewDisplayUrl.startsWith('blob:') ? 'blob URL' : previewDisplayUrl);
    img.src = previewDisplayUrl;

  }, [previewDisplayUrl, cropOperation, isCropMode, effectOperation, renderedPreviewUrl]);

  return (
    <section className="studio-canvas-shell">
      <div 
        className="canvas-stage"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : (previewDisplayUrl && !isCropMode ? 'grab' : 'default') }}
      >
        {previewDisplayUrl ? (
          <div 
            className="canvas-frame" 
            style={canvasFrameStyle}
          >
            {isCropMode ? (
              <InteractiveCropOverlay
                imageSrc={previewDisplayUrl}
                crop={cropState}
                onCropChange={onCropChange}
                onCropComplete={onCropComplete}
                aspectRatio={cropAspectRatio}
                onAspectRatioChange={onCropAspectRatioChange}
                onClose={onExitCropMode}
                imageSize={imageSize}
              />
            ) : (
              <>
                <div 
                  className="canvas-image-transform-layer"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <canvas 
                      ref={canvasRef} 
                      className="canvas-image"
                  />
                  {watermarkPreview}
                </div>

                {resizeOverlayStyle ? (
                  <>
                    <div
                      className="canvas-dimmer-overlay"
                      style={{ clipPath: resizeOverlayStyle.clipPathHole }}
                    />

                    <div className={`resize-overlay ${isResizing ? 'resizing' : ''}`} style={resizeOverlayStyle}>
                      <div className="canvas-chip top">Target Area</div>
                      <div className="canvas-chip corner">{resizeAspectLabel}</div>
                      <div className="canvas-rail left">{targetWidthLabel}</div>
                      <div className="canvas-rail right">{targetHeightLabel}</div>
                      <div className="canvas-rail bottom">{targetWidthLabel}</div>

                      <span className="resize-handle corner top-left" onMouseDown={(e) => onResizeStart(e, 'top-left')} />
                      <span className="resize-handle corner top-right" onMouseDown={(e) => onResizeStart(e, 'top-right')} />
                      <span className="resize-handle corner bottom-left" onMouseDown={(e) => onResizeStart(e, 'bottom-left')} />
                      <span className="resize-handle corner bottom-right" onMouseDown={(e) => onResizeStart(e, 'bottom-right')} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="canvas-chip top">Original Preview</div>
                    <div className="canvas-chip corner">{originalAspectLabel}</div>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={`drop-zone ${isBatchMode ? 'batch-drop-zone' : ''}`}
            onClick={onOpenFilePicker}
          >
            <span className="drop-zone-plus">+</span>
            <div className="drop-zone-title">{isBatchMode ? 'Upload Images' : 'Upload Image'}</div>
          </button>
        )}

        {previewDisplayUrl && !isCropMode && (
          <div className="canvas-zoom-control glass-panel">
            <span className="material-symbols-outlined">zoom_in</span>
            <input 
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="zoom-slider-input"
            />
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            <button 
              className="zoom-reset-btn"
              onClick={() => { onZoomChange(1); onPanChange({ x: 0, y: 0 }); }}
              title="Reset View"
            >
              <span className="material-symbols-outlined">restart_alt</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudioCanvas;
