import { getBatchQueueKey } from "../pages/image-studio/batchWorkflow";

export const PIPELINE_ACTIONS = {
  UPDATE_OPERATION: "UPDATE_OPERATION",
  TOGGLE_OPERATION: "TOGGLE_OPERATION",
  SET_OPERATIONS: "SET_OPERATIONS",
  RESET: "RESET",
  SET_CROP_MODE: "SET_CROP_MODE",
  SET_CROP_STATE: "SET_CROP_STATE",
  SET_COMPARISON_VISIBLE: "SET_COMPARISON_VISIBLE",
  SET_BATCH_QUEUE: "SET_BATCH_QUEUE",
  SET_BATCH_ITEM_STATE: "SET_BATCH_ITEM_STATE",
  SET_BATCH_PROGRESS: "SET_BATCH_PROGRESS",
  SET_TOAST: "SET_TOAST",
  SET_DRAG_OVER: "SET_DRAG_OVER",
  CLEAR_BATCH: "CLEAR_BATCH",
  REMOVE_BATCH_ITEM: "REMOVE_BATCH_ITEM",
};

// Default operations template
export const createDefaultOperations = () => ([
  {
    type: "crop",
    label: "Crop",
    enabled: false,
    expanded: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    targetWidth: 0, // New: Target width for the output canvas after cropping/padding
    targetHeight: 0, // New: Target height for the output canvas after cropping/padding
    fillColor: "#000000", // New: Fill color for padding
  },
  {
    type: "resize",
    label: "Resize",
    enabled: true,
    expanded: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
    useSmartFrame: false,
    blur: 20,
  },
  {
    type: "rotate",
    label: "Rotate",
    enabled: false,
    expanded: false,
    angle: 90,
  },
  {
    type: "effect",
    label: "Effects",
    enabled: false,
    expanded: false,
    effect: "none",
    mood: "none",
    brightness: 0,
    contrast: 0,
    saturation: 1,
  },
  {
    type: "watermark",
    label: "Watermark",
    enabled: false,
    expanded: false,
    text: "",
    useImage: false,
    imageFileId: null,
    position: "bottom-right",
    customX: 10,
    customY: 10,
    opacity: 50,
  },
]);

export const syncCropToResize = (pipeline, imageSize) => {
  const resizeOp = pipeline.find((op) => op.type === "resize");
  if (!resizeOp || !imageSize.width || !imageSize.height) return pipeline;

  const targetWidth = resizeOp.width || imageSize.width;
  const targetHeight = resizeOp.height || imageSize.height;
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = imageSize.width / imageSize.height;

  // Only sync if ratios differ significantly
      // Only sync if ratios differ significantly, or if targetWidth/Height have changed.
      const currentCropOp = pipeline.find((op) => op.type === "crop");
      if (Math.abs(targetRatio - sourceRatio) < 0.01 && 
          currentCropOp.targetWidth === targetWidth && 
          currentCropOp.targetHeight === targetHeight) {
          return pipeline;
      }

  let cw, ch, cx, cy;
  if (targetRatio >= sourceRatio) {
    cw = imageSize.width;
    ch = Math.round(imageSize.width / targetRatio);
    cx = 0;
    cy = Math.round((imageSize.height - ch) / 2);
  } else {
    ch = imageSize.height;
    cw = Math.round(imageSize.height * targetRatio);
    cy = 0;
    cx = Math.round((imageSize.width - cw) / 2);
  }

  return pipeline.map((op) => {
    if (op.type === "crop") {
      // Update crop area AND target output dimensions for padding
      return { 
          ...op, 
          x: cx, 
          y: cy, 
          width: cw, 
          height: ch, 
          enabled: true,
          targetWidth: targetWidth, // Set target dimensions for padding
          targetHeight: targetHeight, // Set target dimensions for padding
      };
    }
    return op;
  });
};

// Reducer for pipeline operations + UI state
export const imageStudioReducer = (state, action) => {
  switch (action.type) {
    case PIPELINE_ACTIONS.UPDATE_OPERATION: {
      const { operationType, updates } = action.payload;
      const nextPipeline = state.pipeline.map((operation) => {
        if (operation.type !== operationType) return operation;
        return { ...operation, ...updates };
      });

      return {
        ...state,
        pipeline: nextPipeline,
      };
    }

    case PIPELINE_ACTIONS.TOGGLE_OPERATION: {
      const { operationType, forceValue } = action.payload;
      const nextPipeline = state.pipeline.map((operation) => {
        if (operation.type !== operationType) return operation;
        return { ...operation, enabled: forceValue !== undefined ? forceValue : !operation.enabled };
      });
      return { ...state, pipeline: nextPipeline };
    }

    case PIPELINE_ACTIONS.SET_OPERATIONS: {
      return { ...state, pipeline: action.payload };
    }

    case PIPELINE_ACTIONS.RESET: {
      return { ...state, pipeline: createDefaultOperations() };
    }

    case PIPELINE_ACTIONS.SET_CROP_MODE: {
      return { ...state, isCropMode: action.payload };
    }

    case PIPELINE_ACTIONS.SET_CROP_STATE: {
      return { ...state, cropState: action.payload };
    }

    case PIPELINE_ACTIONS.SET_COMPARISON_VISIBLE: {
      return { ...state, isComparisonVisible: action.payload };
    }

    case PIPELINE_ACTIONS.SET_BATCH_QUEUE: {
      return { ...state, batchQueue: action.payload };
    }

    case PIPELINE_ACTIONS.SET_BATCH_ITEM_STATE: {
      const { fileKey, itemState } = action.payload;
      return {
        ...state,
        batchItemStates: {
          ...state.batchItemStates,
          [fileKey]: itemState,
        },
      };
    }

    case PIPELINE_ACTIONS.SET_BATCH_PROGRESS: {
      return { ...state, batchProgress: action.payload };
    }

    case PIPELINE_ACTIONS.SET_TOAST: {
      return { ...state, toast: action.payload };
    }

    case PIPELINE_ACTIONS.SET_DRAG_OVER: {
      return { ...state, isDragOver: action.payload };
    }

    case PIPELINE_ACTIONS.CLEAR_BATCH: {
      return {
        ...state,
        batchQueue: [],
        batchItemStates: {},
        batchProgress: { phase: "idle", progress: 0, label: "" },
      };
    }

    case PIPELINE_ACTIONS.REMOVE_BATCH_ITEM: {
      const { fileKey } = action.payload;
      return {
        ...state,
        batchQueue: state.batchQueue.filter((f) => getBatchQueueKey(f) !== fileKey),
        batchItemStates: Object.fromEntries(
          Object.entries(state.batchItemStates).filter(([key]) => key !== fileKey)
        ),
      };
    }

    default:
      return state;
  }
};

// Initial UI state (pipeline initialized separately due to imageSize dependency)
export const createInitialUIState = () => ({
  isCropMode: false,
  cropState: { x: 0, y: 0, width: 1920, height: 1080 },
  cropAspectRatio: null,
  isComparisonVisible: false,
  batchQueue: [],
  batchItemStates: {},
  batchProgress: { phase: "idle", progress: 0, label: "" },
  toast: null,
  isDragOver: false,
  activeOperation: "resize",
  dockTool: "canvas",
});
