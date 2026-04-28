import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import BeforeAfterSlider from '../components/studio/BeforeAfterSlider';
import apiClient, { API_BASE_URL, batchProcessImages, downloadFile, getImageMetadata, getSupportedImageFormats, processImagePipeline, uploadFile } from '../services/api';
import { buildBatchProcessRequest, getBatchQueueKey, prependSelectedBatchFile } from './image-studio/batchWorkflow';
import { formatBytes, formatDimension, truncateTwoWords } from './image-studio/formatters';
import StudioCanvas from './image-studio/StudioCanvas';
import ImageFileInfoCard from './image-studio/ImageFileInfoCard';
import BatchQueueCard from './image-studio/BatchQueueCard';
import ExportSettingsCard from './image-studio/ExportSettingsCard';
import ImageResultCard from './image-studio/ImageResultCard';
import ImagePipelinePanel from './image-studio/ImagePipelinePanel';
import { useImageStudio } from '../hooks/useImageStudio';
import './ImagePage.css';
import OperationCard from '../components/image-studio/OperationCard';
import StudioTopNav from '../components/image-studio/StudioTopNav';

const ImagePage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState('');
   const [imageSize, setImageSize] = useState({ width: null, height: null });
   const [metadata, setMetadata] = useState(null);

   // Local UI state (not in reducer)
   const [cropAspectRatio, setCropAspectRatio] = useState(null);
   const [fastPreviewUrl, setFastPreviewUrl] = useState("");
   const [zoom, setZoom] = useState(1);
   const [pan, setPan] = useState({ x: 0, y: 0 });

   // Consolidated state management (pipeline + UI state + undo/redo)
   const studio = useImageStudio(imageSize);
   const { pipeline } = studio;

   const enabledOperations = useMemo(() => pipeline.filter((operation) => operation.enabled), [pipeline]);

   const resizeOperation = useMemo(() => pipeline.find((operation) => operation.type === 'resize'), [pipeline]);

   const resizeOverlayStyle = useMemo(() => {
     if (!resizeOperation?.enabled || !imageSize.width || !imageSize.height) return null;

     const targetWidth = Number(resizeOperation.width || imageSize.width);
     const targetHeight = Number(resizeOperation.height || imageSize.height);
     if (!targetWidth || !targetHeight) return null;

     const targetRatio = targetWidth / targetHeight;
     const sourceRatio = imageSize.width / imageSize.height;

     let style;
     if (targetRatio >= sourceRatio) {
       style = {
         width: '100%',
         height: `${(sourceRatio / targetRatio) * 100}%`,
         aspectRatio: `${targetWidth} / ${targetHeight}`,
         left: '50%',
         top: '50%',
       };
     } else {
       style = {
         width: `${(targetRatio / sourceRatio) * 100}%`,
         height: '100%',
         aspectRatio: `${targetWidth} / ${targetHeight}`,
         left: '50%',
         top: '50%',
       };
     }

     const wPercent = parseFloat(style.width);
     const hPercent = parseFloat(style.height);
     const left = (100 - wPercent) / 2;
     const top = (100 - hPercent) / 2;
     const right = left + wPercent;
     const bottom = top + hPercent;

     style.clipPathHole = `polygon(
       0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
       ${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%, ${left}% ${top}%
     )`;

     return style;
   }, [imageSize.width, imageSize.height, resizeOperation]);

   const buildOperations = useCallback(() => {
     const order = ['rotate', 'crop', 'resize', 'color', 'effect', 'watermark'];

     // Extract existing crop/resize ops if they exist
     const existingCrop = enabledOperations.find(op => op.type === 'crop');
     const hasZoomPan = zoom !== 1 || pan.x !== 0 || pan.y !== 0;

     // If we have zoom/pan but NO explicit crop, we might need to add one
     let opsToProcess = [...enabledOperations];
     if ((hasZoomPan || resizeOverlayStyle) && !existingCrop) {
         opsToProcess.push({ type: 'crop', enabled: true, x: 0, y: 0, width: imageSize.width, height: imageSize.height });
     }

     const sortedOps = opsToProcess.sort((a, b) => {
       return order.indexOf(a.type) - order.indexOf(b.type);
     });

     return sortedOps.map((operation) => {
       switch (operation.type) {
         case 'rotate':
           return { type: 'rotate', angle: operation.angle };
         case 'crop':
           let { x, y, width, height } = operation;

           // Apply Zoom & Pan logic to the crop area
           // This translates the visual "Reframing" into actual crop coordinates
           if (resizeOverlayStyle) {
              const wPercent = parseFloat(resizeOverlayStyle.width);
              const hPercent = parseFloat(resizeOverlayStyle.height);
              
              // Dimensions of the target "window" relative to original image size
              const winW = imageSize.width * (wPercent / 100);
              const winH = imageSize.height * (hPercent / 100);
              
              // The crop width is the window size divided by zoom
              width = winW / zoom;
              height = winH / zoom;
              
              // The crop center is shifted by the pan (pan is already in image units)
              x = (imageSize.width - width) / 2 - pan.x;
              y = (imageSize.height - height) / 2 - pan.y;

              // CLAMPING: Ensure coordinates are within image bounds and non-negative
              // FFmpeg will crash if x+width > iw or x < 0
              width = Math.min(imageSize.width, Math.max(1, width));
              height = Math.min(imageSize.height, Math.max(1, height));
              x = Math.max(0, Math.min(imageSize.width - width, x));
              y = Math.max(0, Math.min(imageSize.height - height, y));
           }

           return { type: 'crop', x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
         case 'resize':
           return { 
             type: 'resize', 
             width: operation.width || undefined, 
             height: operation.height || undefined,
             useSmartFrame: operation.useSmartFrame,
             blur: operation.blur
           };
         case 'effect':
           return {
             type: 'effect',
             effect: operation.effect,
             mood: operation.mood,
             brightness: operation.brightness,
             contrast: operation.contrast,
             saturation: operation.saturation
           };
         case 'watermark':
           return {
             type: 'watermark',
             text: operation.text,
             useImage: operation.useImage,
             imageFileId: operation.imageFileId,
             position: operation.position,
             opacity: operation.opacity,
           };
         default:
           return null;
       }
     }).flat().filter(Boolean);
   }, [enabledOperations, zoom, pan, resizeOverlayStyle, imageSize.width, imageSize.height]);

  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      setImageSize({ width: null, height: null });
      setMetadata(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setMetadata(null); 

    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);



  const [activeOperation, setActiveOperation] = useState('resize');
  const [dockTool, setDockTool] = useState('canvas');
  const [conversionResult, setConversionResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [supportedOutputFormats, setSupportedOutputFormats] = useState(['jpg', 'png', 'webp', 'tiff', 'avif', 'bmp', 'gif']);
   const [quality, setQuality] = useState(100);

   useEffect(() => {
     const fetchFormats = async () => {
       try {
         const formats = await getSupportedImageFormats();
         if (formats?.output) {
           setSupportedOutputFormats(formats.output.map(f => f.value));
         }
       } catch (err) {
         console.error("Failed to fetch supported formats", err);
       }
     };
     fetchFormats();
   }, []);


   // Ref state (not part of reducer)
   const fileInputRef = useRef(null);
   const uploadTokenRef = useRef(0);
   const initialDimensionsSyncedRef = useRef(false);

    // Dragging state for resize handles
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Derived operations

    const showToast = useCallback((message, type = 'info') => {
      studio.setToast({ message, type, id: Date.now() });
    }, [studio]);

    const addFilesToStudio = (incomingFiles) => {
      const files = Array.from(incomingFiles || []).filter((file) => {
        if (!file.type.startsWith('image/')) {
          studio.setToast(`Skipped ${file.name || 'file'} because it is not an image.`, 'error');
          return false;
        }
        return true;
      });

      if (files.length === 0) return;

      if (isBatchMode) {
        const merged = [...studio.batchQueue];
        const seen = new Set(merged.map(getBatchQueueKey));
        let added = 0;
        for (const file of files) {
          const key = getBatchQueueKey(file);
          if (!seen.has(key)) {
            merged.push(file);
            seen.add(key);
            studio.setBatchItemState(key, {
              status: 'queued',
              progress: 0,
              label: 'Queued',
            });
            added++;
          }
        }
        studio.setBatchQueue(merged);
        setConversionResult(null);
        setBatchResult(null);
        setRenderedPreviewUrl('');
        setDockTool('canvas');
        setActiveOperation('resize');
        initialDimensionsSyncedRef.current = false;
        studio.setToast(`${added} image(s) added to the batch queue.`, 'success');
        return;
      }

      const file = files[0];
      setSelectedFile(file);
      setConversionResult(null);
      setBatchResult(null);
      setRenderedPreviewUrl('');
      setDockTool('canvas');
      setActiveOperation('resize');
      initialDimensionsSyncedRef.current = false;
      studio.setToast('Image loaded into the studio.', 'success');
    };

    const prependSelectedFileToBatchQueue = () => {
      if (!selectedFile) return;
      const selectedKey = getBatchQueueKey(selectedFile);
      studio.setBatchQueue(prependSelectedBatchFile(selectedFile, studio.batchQueue));
      studio.setBatchItemState(selectedKey, {
        status: 'queued',
        progress: 0,
        label: 'Queued',
      });
    };

    const handleInputChange = (event) => {
      addFilesToStudio(event.target.files);
      event.target.value = '';
    };

    const handleDrop = (event) => {
      event.preventDefault();
      studio.setIsDragOver(false);
      addFilesToStudio(event.dataTransfer.files);
    };

    const handleThemeToggle = () => {
      setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    };

    const handleResizeStart = (e, handle) => {
      e.preventDefault();
      e.stopPropagation();
      const resizeOp = pipeline.find(op => op.type === 'resize');
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        width: Number(resizeOp?.width || imageSize.width),
        height: Number(resizeOp?.height || imageSize.height),
      });
    };

    const syncCropToRatio = useCallback((width, height) => {
      if (!imageSize.width || !imageSize.height) return;

      const targetRatio = width / height;
      const sourceRatio = imageSize.width / imageSize.height;

      let cropWidth, cropHeight, cropX, cropY;

      if (targetRatio >= sourceRatio) {
        cropWidth = imageSize.width;
        cropHeight = Math.round(imageSize.width / targetRatio);
        cropX = 0;
        cropY = Math.round((imageSize.height - cropHeight) / 2);
      } else {
        cropHeight = imageSize.height;
        cropWidth = Math.round(imageSize.height * targetRatio);
        cropY = 0;
        cropX = Math.round((imageSize.width - cropWidth) / 2);
      }

      studio.updateOperation('crop', {
        x: Math.max(0, cropX),
        y: Math.max(0, cropY),
        width: Math.min(imageSize.width, cropWidth),
        height: Math.min(imageSize.height, cropHeight),
        enabled: true,
      });
    }, [imageSize.width, imageSize.height, studio]);

    useEffect(() => {
      if (!isResizing) return undefined;

      const handleMouseMove = (e) => {
        if (!isResizing || !resizeHandle || !imageSize.width) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = dragStart.width;
        let newHeight = dragStart.height;

        const resizeOp = pipeline.find(op => op.type === 'resize');
        const ratio = imageSize.width / imageSize.height;

        if (resizeHandle.includes('right')) newWidth = Math.max(10, dragStart.width + deltaX);
        if (resizeHandle.includes('left')) newWidth = Math.max(10, dragStart.width - deltaX);
        if (resizeHandle.includes('bottom')) newHeight = Math.max(10, dragStart.height + deltaY);
        if (resizeHandle.includes('top')) newHeight = Math.max(10, dragStart.height - deltaY);

        if (resizeOp?.maintainAspectRatio) {
          if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
            newHeight = Math.round(newWidth / ratio);
          } else {
            newWidth = Math.round(newHeight / ratio);
          }
        }

        studio.updateOperation('resize', {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          enabled: true,
        });

        if (activeOperation === 'crop') {
          syncCropToRatio(Math.round(newWidth), Math.round(newHeight));
        } else {
          const cropOp = pipeline.find(op => op.type === 'crop');
          if (cropOp?.enabled) {
            syncCropToRatio(Math.round(newWidth), Math.round(newHeight));
          }
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setResizeHandle(null);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isResizing, resizeHandle, dragStart, studio, imageSize, activeOperation, syncCropToRatio, pipeline]);

  const expandOperation = (type) => {
    setActiveOperation(type);
    studio.toggleOperation(type, true); // enable + expand

    if (type === 'crop') {
      studio.setIsCropMode(true);
    }

    setDockTool(type === 'crop' ? 'crop' : type === 'watermark' ? 'watermark' : type === 'effect' ? 'effects' : 'canvas');
  };


  const fastPreviewTimeoutRef = useRef(null);
  useEffect(() => {
    const effectOp = pipeline.find(op => op.type === "effect" && op.enabled);
    if (effectOp && effectOp.mood && effectOp.mood !== "none") {
      if (fastPreviewTimeoutRef.current) {
        clearTimeout(fastPreviewTimeoutRef.current);
      }
      fastPreviewTimeoutRef.current = setTimeout(async () => {
        try {
          if (!selectedFile) return;
          
          // This is a simplified approach. A more robust solution would handle
          // uploading the file if it hasn't been uploaded yet to get a fileId.
          const fileId = selectedFile.fileId || (await uploadFile(selectedFile)).fileId;
          if (!fileId) return;
          selectedFile.fileId = fileId; // Store for subsequent previews

          const response = await apiClient.post("/image/fast-preview", {
            fileId: fileId,
            fileName: selectedFile.name,
            operations: buildOperations(),
          });

          if (response.data.success) {
            const resultResponse = await apiClient.get(`/download/${response.data.data.filename}`, {
              responseType: "blob",
            });
            if (fastPreviewUrl) URL.revokeObjectURL(fastPreviewUrl);
            const nextPreviewUrl = window.URL.createObjectURL(new Blob([resultResponse.data]));
            setFastPreviewUrl(nextPreviewUrl);
          }
        } catch (error) {
          console.error("Fast preview failed:", error);
        }
      }, 300);
    } else {
        if (fastPreviewUrl) {
            URL.revokeObjectURL(fastPreviewUrl);
            setFastPreviewUrl("");
        }
    }
  }, [pipeline, selectedFile, buildOperations, fastPreviewUrl]);

  const handleRender = async () => {
    if (isBatchMode) {
      await handleBatchRender();
      return;
    }

    if (!selectedFile || isProcessing) {
      if (!selectedFile) showToast('Load an image first.', 'error');
      return;
    }

    const currentToken = Date.now();
    uploadTokenRef.current = currentToken;
    setIsProcessing(true);

    try {
      const uploadResponse = await uploadFile(selectedFile);
      if (!uploadResponse?.success) {
        throw new Error(uploadResponse?.error || 'Upload failed');
      }

      const serverFileName = uploadResponse.serverFileName || `${uploadResponse.fileId}.png`;

      try {
        const metadataResponse = await getImageMetadata(serverFileName);
        if (metadataResponse?.success && metadataResponse?.data) {
          const { dimensions, fileSize, colorSpace, format } = metadataResponse.data;
          setMetadata({
            name: selectedFile.name,
            size: fileSize,
            type: format ? `image/${String(format).split(',')[0]}` : selectedFile.type,
            colorProfile: colorSpace || 'sRGB',
            lastModified: new Date(selectedFile.lastModified).toLocaleString(),
          });
          if (dimensions?.width && dimensions?.height) {
            setImageSize({ width: dimensions.width, height: dimensions.height });
          }
        }
      } catch (metadataError) {
        console.warn('Image metadata fetch failed, continuing with browser metadata.', metadataError);
      }

      const operations = buildOperations();
      const supported = await getSupportedImageFormats();
      const localSupportedOutputFormats = supported.output.map(f => f.value);
      if (!localSupportedOutputFormats.includes(outputFormat)) {
        throw new Error('Selected export format is not supported by the current encoder.');
      }

      const response = await processImagePipeline(
        uploadResponse.fileId,
        uploadResponse.fileName || selectedFile.name,
        operations,
        outputFormat,
        quality,
      );

      if (uploadTokenRef.current !== currentToken) return;

      if (!response?.success) {
        throw new Error(response?.error || 'Image processing failed');
      }

      if (renderedPreviewUrl) {
        URL.revokeObjectURL(renderedPreviewUrl);
      }

      const resultResponse = await apiClient.get(`/download/${response.data.filename}`, {
        responseType: 'blob',
      });
      const nextPreviewUrl = window.URL.createObjectURL(new Blob([resultResponse.data]));

      setConversionResult(response.data);
      setRenderedPreviewUrl(nextPreviewUrl);
      showToast('Render finished successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Rendering failed.', 'error');
    } finally {
      if (uploadTokenRef.current === currentToken) {
        setIsProcessing(false);
      }
    }
  };

   const handleBatchRender = async () => {
     if (!studio.batchQueue.length || isBatchProcessing) {
       if (!studio.batchQueue.length) showToast('Add at least one image to the batch queue.', 'error');
       return;
     }

     const operations = buildOperations();

     const currentToken = Date.now();
     uploadTokenRef.current = currentToken;
     setIsBatchProcessing(true);
     setConversionResult(null);
     setBatchResult(null);
     setRenderedPreviewUrl('');
     studio.setBatchProgress({
       phase: 'uploading',
       progress: 0,
       label: operations.length > 0
         ? `Uploading ${studio.batchQueue.length} image${studio.batchQueue.length === 1 ? '' : 's'}...`
         : `Preparing ${studio.batchQueue.length} image${studio.batchQueue.length === 1 ? '' : 's'} for format conversion...`,
     });
     studio.batchQueue.forEach((file) => {
       const key = getBatchQueueKey(file);
       studio.setBatchItemState(key, {
         status: 'queued',
         progress: 0,
         label: 'Queued',
       });
     });

     try {
       const uploadedItems = [];
       const batchKeyByFileId = new Map();
       const totalFiles = studio.batchQueue.length;

       for (const [index, file] of studio.batchQueue.entries()) {
         const key = getBatchQueueKey(file);
         studio.setBatchItemState(key, {
           status: 'uploading',
           progress: 0,
           label: 'Uploading',
         });

         const uploadResponse = await uploadFile(file);
         if (!uploadResponse?.success) {
           throw new Error(uploadResponse?.error || `Upload failed for ${file.name}`);
         }

         studio.setBatchItemState(key, {
           status: 'uploaded',
           progress: 100,
           label: 'Uploaded',
         });

         uploadedItems.push({
           fileId: uploadResponse.fileId,
           fileName: uploadResponse.fileName || file.name,
         });
         batchKeyByFileId.set(uploadResponse.fileId, key);

         studio.setBatchProgress({
           phase: 'uploading',
           progress: Math.round(((index + 1) / totalFiles) * 45),
           label: `Uploaded ${index + 1} of ${totalFiles} image${totalFiles === 1 ? '' : 's'}.`,
         });
       }

       studio.setBatchProgress({
         phase: 'processing',
         progress: 55,
         label: 'Processing images on the server...',
       });

       studio.batchQueue.forEach((file) => {
         const key = getBatchQueueKey(file);
         studio.setBatchItemState(key, {
           status: 'processing',
           progress: 55,
           label: 'Processing',
         });
       });

       const batchRequest = buildBatchProcessRequest(uploadedItems, 'process', {
         operations,
         outputFormat,
         quality,
       });

       const response = await batchProcessImages(
         batchRequest.files,
         batchRequest.operation,
         batchRequest.settings,
       );

       if (uploadTokenRef.current !== currentToken) return;

       if (!response?.success && !response?.data) {
         throw new Error(response?.error || 'Batch processing failed');
       }

       const results = response?.data?.results || [];
       const successCount = response?.data?.summary?.succeeded ?? results.filter((item) => item.success).length;
       const failedCount = response?.data?.summary?.failed ?? results.length - successCount;

       setBatchResult(response.data);
       studio.setBatchProgress({
         phase: 'completed',
         progress: 100,
         label: `Batch finished: ${successCount} succeeded, ${failedCount} failed.`,
       });

       results.forEach((result) => {
         const matchedKey = batchKeyByFileId.get(result.fileId) || result.fileId;
         studio.setBatchItemState(matchedKey, {
           status: result.success ? 'done' : 'failed',
           progress: 100,
           label: result.success ? 'Completed' : 'Failed',
         });
       });

       const firstSuccessful = results.find((item) => item.success && item.filename);
       if (firstSuccessful) {
         const resultResponse = await apiClient.get(`/download/${firstSuccessful.filename}`, {
           responseType: 'blob',
         });
         const nextPreviewUrl = window.URL.createObjectURL(new Blob([resultResponse.data]));
         setRenderedPreviewUrl(nextPreviewUrl);
       }

       if (failedCount > 0) {
         showToast(`Batch finished with ${successCount} success${successCount === 1 ? '' : 'es'} and ${failedCount} failure${failedCount === 1 ? '' : 's'}.`, 'warning');
       } else {
         showToast(`Batch finished successfully for ${successCount} image${successCount === 1 ? '' : 's'}.`, 'success');
       }
     } catch (error) {
       console.error(error);
       const serverMessage = error?.response?.data?.error;
       showToast(serverMessage || error.message || 'Batch rendering failed.', 'error');
     } finally {
       if (uploadTokenRef.current === currentToken) {
         setIsBatchProcessing(false);
       }
     }
   };

  const handleDownload = async () => {
    const filename = isBatchMode
      ? batchResult?.archiveFilename
      : conversionResult?.filename;

    if (!filename) {
      showToast('Render the image first.', 'error');
      return;
    }

    try {
      await downloadFile(filename);
      showToast('Download started.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not start download.', 'error');
    }
  };


  // LIVE PREVIEW: Computes CSS filters/transforms from current pipeline
  const previewImageStyle = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return {};

    const effectOp = pipeline.find((op) => op.type === 'effect' && op.enabled);
    const rotateOp = pipeline.find((op) => op.type === 'rotate' && op.enabled);

    let filters = [];
    let transforms = [];

    // 1. ROTATION (preview)
    if (rotateOp?.angle) {
      transforms.push(`rotate(${rotateOp.angle}deg)`);
    }

    // 2. EFFECTS (brightness, contrast, saturation, mood)
    if (effectOp) {
      const { brightness = 0, contrast = 0, saturation = 1, mood = 'none', effect = 'none' } = effectOp;

      if (brightness !== 0) filters.push(`brightness(${1 + brightness})`);
      if (contrast !== 0) filters.push(`contrast(${1 + contrast})`);
      if (saturation !== 1) filters.push(`saturate(${saturation})`);

      // Mood presets
      if (mood && mood !== 'none') {
        switch (mood) {
          case 'cinematic':
            filters.push('contrast(1.2) saturate(0.85) hue-rotate(-5deg) sepia(0.1)');
            break;
          case 'vintage':
            filters.push('sepia(0.35) contrast(0.92) brightness(1.08)');
            break;
          case 'cyberpunk':
            filters.push('hue-rotate(190deg) saturate(1.8) contrast(1.12)');
            break;
          case 'golden':
            filters.push('sepia(0.25) saturate(1.35) brightness(1.04)');
            break;
          case 'dramatic':
            filters.push('contrast(1.35) brightness(0.96) saturate(1.15)');
            break;
          case 'noir':
            filters.push('grayscale(1) contrast(1.25) brightness(1.08)');
            break;
          default:
            break;
        }
      }

      // Special effects
      if (effect === 'blur') filters.push('blur(3px)');
      if (effect === 'grayscale') filters.push('grayscale(100%)');
      if (effect === 'sepia') filters.push('sepia(100%)');
      if (effect === 'sharpen') filters.push('contrast(1.15) brightness(1.05)');
    }

    // Resize preview handled by overlay, no CSS transform

    return {
      filter: filters.length > 0 ? filters.join(' ') : 'none',
      transform: transforms.join(' '),
      transition: 'filter 0.2s ease-out, transform 0.2s ease-out',
    };
  }, [pipeline, imageSize]);

  const canvasFrameStyle = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return undefined;

    return {
      aspectRatio: `${imageSize.width} / ${imageSize.height}`,
      width: '100%',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      display: 'flex',
    };
  }, [imageSize.width, imageSize.height]);

  // Resize overlay style for visual target area indicator and drag handles

  const resizeAspectLabel = '1:1';

  const outputInfo = conversionResult?.filename ? conversionResult.filename : 'No output has been generated yet.';
  const batchDownloadFilename = batchResult?.archiveFilename;
  const canDownloadResult = isBatchMode ? Boolean(batchDownloadFilename) : Boolean(conversionResult?.filename);
  const getBatchItemState = (file) => studio.batchItemStates[getBatchQueueKey(file)] || {
    status: 'queued',
    progress: 0,
    label: 'Queued',
  };
  const activeWatermark = pipeline.find((op) => op.type === 'watermark' && op.enabled);
  const watermarkPreview = activeWatermark ? (
    <div className={`watermark-preview position-${activeWatermark.position}`} style={{ opacity: activeWatermark.opacity / 100 }}>
      {activeWatermark.useImage && activeWatermark.imageFileId ? (
        <img
          src={`${API_BASE_URL.replace('/api', '')}/uploads/${activeWatermark.imageFileId}`}
          alt="Watermark Logo"
          className="wm-image-preview"
        />
      ) : (
        <span className="wm-text-preview">{activeWatermark.text || '© Your Brand'}</span>
      )}
    </div>
  ) : null;
  const handleSingleMode = () => setIsBatchMode(false);
  const handleBatchMode = () => {
    setIsBatchMode(true);
    prependSelectedFileToBatchQueue();
  };

   return (
     <div
       className={`image-studio-page ${studio.isDragOver ? 'drag-over' : ''}`}
       onDragEnter={(e) => {
         e.preventDefault();
         studio.setIsDragOver(true);
       }}
       onDragOver={(e) => e.preventDefault()}
       onDragLeave={() => studio.setIsDragOver(false)}
       onDrop={handleDrop}
     >
       {!selectedFile && (
         <>
           <video 
             autoPlay 
             muted 
             loop 
             playsInline 
             className="studio-bg-video"
           >
             <source src="/assets/videos/bg-video.mp4" type="video/mp4" />
           </video>
           <div className="studio-bg-overlay"></div>
         </>
       )}

       <StudioTopNav theme={theme} onToggleTheme={handleThemeToggle} />
       <main className="studio-grid">
         <ImagePipelinePanel
           selectedFile={selectedFile}
           enabledOperations={enabledOperations}
           pipeline={pipeline}
           activeOperation={activeOperation}
           dockTool={dockTool}
           setDockTool={setDockTool}
           expandOperation={expandOperation}
           toggleOperation={studio.toggleOperation}
           updateOperation={studio.updateOperation}
           imageSize={imageSize}
           OperationCard={OperationCard}
         />

          <StudioCanvas
            previewDisplayUrl={fastPreviewUrl || renderedPreviewUrl || previewUrl}
            selectedFileName={selectedFile?.name}
            renderedPreviewUrl={renderedPreviewUrl}
            canvasFrameStyle={canvasFrameStyle}
            previewImageStyle={previewImageStyle}
            resizeOverlayStyle={resizeOverlayStyle}
            isResizing={isResizing}
            resizeAspectLabel={resizeAspectLabel}
            targetWidthLabel={formatDimension(resizeOperation?.width || imageSize.width)}
            targetHeightLabel={formatDimension(resizeOperation?.height || imageSize.height)}
            originalAspectLabel={''}
            onResizeStart={handleResizeStart}
            watermarkPreview={watermarkPreview}
            onOpenFilePicker={() => fileInputRef.current.click()}
            isBatchMode={isBatchMode}
            isCropMode={studio.isCropMode}
            cropState={studio.cropState}
            onCropChange={studio.setCropState}
            onCropComplete={(c) => studio.updateOperation('crop', c)}
            cropAspectRatio={cropAspectRatio}
            onCropAspectRatioChange={setCropAspectRatio}
            onExitCropMode={() => studio.setIsCropMode(false)}
            imageSize={imageSize}
            cropOperation={pipeline.find(op => op.type === 'crop')}
            effectOperation={pipeline.find(op => op.type === 'effect')}
            zoom={zoom}
            onZoomChange={setZoom}
            pan={pan}
            onPanChange={setPan}
           />

         {(selectedFile || isBatchMode) && (
           <aside className="studio-column studio-right">
             <div className="inspector-stack">
               <ImageFileInfoCard
                 selectedFile={selectedFile}
                 isBatchMode={isBatchMode}
                 metadata={metadata}
                 imageSize={imageSize}
                 onSingleMode={handleSingleMode}
                 onBatchMode={handleBatchMode}
                 onAddImages={() => fileInputRef.current.click()}
                 formatBytes={formatBytes}
                 formatDimension={formatDimension}
               />

               {isBatchMode && (
                 <BatchQueueCard
                   batchQueue={studio.batchQueue}
                   batchProgress={studio.batchProgress}
                   batchItemStates={studio.batchItemStates}
                   isBatchProcessing={isBatchProcessing}
                   onAddImages={() => fileInputRef.current.click()}
                   onClearQueue={() => studio.setBatchQueue([])}
                   onRemoveFile={(file) => studio.setBatchQueue(studio.batchQueue.filter(f => f !== file))}
                   getBatchItemState={getBatchItemState}
                   getBatchQueueKey={getBatchQueueKey}
                  formatBytes={formatBytes}
                  truncateTwoWords={truncateTwoWords}
                />
              )}

               <ExportSettingsCard
                  enabledOperations={enabledOperations}
                  quality={quality}
                  onQualityChange={setQuality}
                  onResetToOriginal={() => studio.resetPipeline()}
                  imageReady={Boolean(imageSize.width)}
                  outputFormatOptions={[
                    { value: 'jpg', label: 'JPG' },
                    { value: 'png', label: 'PNG' },
                    { value: 'webp', label: 'WebP' },
                    { value: 'tiff', label: 'TIFF' },
                    { value: 'avif', label: 'AVIF' },
                    { value: 'bmp', label: 'BMP' },
                    { value: 'gif', label: 'GIF' },
                  ]}
                  supportedOutputFormats={supportedOutputFormats}
                  outputFormat={outputFormat}
                  onOutputFormatChange={setOutputFormat}
                  isBatchMode={isBatchMode}
                 batchQueueLength={studio.batchQueue.length}
                 isBatchProcessing={isBatchProcessing}
                 selectedFileReady={Boolean(selectedFile)}
                 isProcessing={isProcessing}
                 onRender={handleRender}
                 onDownload={handleDownload}
                 canDownloadResult={canDownloadResult}
                 onToggleComparison={() => studio.setIsComparisonVisible(!studio.isComparisonVisible)}
               />

               <ImageResultCard
                 isBatchMode={isBatchMode}
                 batchResult={batchResult}
                 renderedPreviewUrl={renderedPreviewUrl}
                 outputInfo={outputInfo}
                 truncateTwoWords={truncateTwoWords}
               />
            </div>
          </aside>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={isBatchMode}
        className="hidden-file-input"
        onChange={handleInputChange}
      />

       {studio.isDragOver && <div className="drag-overlay">{isBatchMode ? 'Drop images to build the queue' : 'Drop image to import'}</div>}

      {studio.toast && (
        <Toast
          message={studio.toast.message}
          type={studio.toast.type}
          onClose={() => studio.setToast(null)}
        />
      )}

      {/* Before/After Comparison Slider */}
      <BeforeAfterSlider
        beforeImage={previewUrl}
        afterImage={renderedPreviewUrl}
        beforeLabel="Original"
        afterLabel="Edited"
        isVisible={studio.isComparisonVisible}
        onClose={() => studio.setIsComparisonVisible(false)}
      />
     </div>
   );
 };

 export default ImagePage;
