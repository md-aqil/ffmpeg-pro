import { useReducer, useCallback, useRef } from 'react';
import { imageStudioReducer, PIPELINE_ACTIONS, createDefaultOperations, createInitialUIState, syncCropToResize } from '../reducers/imageStudioReducer';

const MAX_HISTORY = 50;

/**
 * Main state management hook for Image Studio.
 * Consolidates all UI + pipeline state with undo/redo support.
 */
export const useImageStudio = (initialImageSize) => {
  const initialState = {
    ...createInitialUIState(),
    pipeline: createDefaultOperations(),
  };

  const [state, dispatch] = useReducer(imageStudioReducer, initialState);
  
  // History stack for undo/redo
  const historyRef = useRef([initialState.pipeline]);
  const historyIndexRef = useRef(0);

  // --- Pipeline Operations ---

  const updateOperation = useCallback((type, updates) => {
    dispatch({
      type: PIPELINE_ACTIONS.UPDATE_OPERATION,
      payload: { operationType: type, updates },
    });

    // Push to history
    const newPipeline = historyRef.current[historyIndexRef.current].map((op) => 
      op.type === type ? { ...op, ...updates } : op
    );
    const synced = syncCropToResize(newPipeline, initialImageSize);
    historyRef.current = [
      ...historyRef.current.slice(0, historyIndexRef.current + 1),
      synced,
    ].slice(-MAX_HISTORY);
    historyIndexRef.current = Math.min(historyIndexRef.current + 1, MAX_HISTORY - 1);
  }, [initialImageSize]);

  const toggleOperation = useCallback((type, forceValue) => {
    dispatch({
      type: PIPELINE_ACTIONS.TOGGLE_OPERATION,
      payload: { operationType: type, forceValue },
    });

    // Push to history
    const newPipeline = historyRef.current[historyIndexRef.current].map((op) => 
      op.type === type ? { ...op, enabled: forceValue !== undefined ? forceValue : !op.enabled } : op
    );
    historyRef.current = [
      ...historyRef.current.slice(0, historyIndexRef.current + 1),
      newPipeline,
    ].slice(-MAX_HISTORY);
    historyIndexRef.current = Math.min(historyIndexRef.current + 1, MAX_HISTORY - 1);
  }, []);

  const resetPipeline = useCallback(() => {
    dispatch({ type: PIPELINE_ACTIONS.RESET });
    historyRef.current = [createDefaultOperations()];
    historyIndexRef.current = 0;
  }, []);

  const expandOperation = useCallback((type) => {
    // Expand + enable operation
    toggleOperation(type, true);
    // Also set active
    // (handled by parent component via state.activeOperation)
  }, [toggleOperation]);

  // --- UI State Setters ---

  const setIsCropMode = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_CROP_MODE, payload: value });
  }, []);

  const setCropState = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_CROP_STATE, payload: value });
  }, []);

  const setIsComparisonVisible = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_COMPARISON_VISIBLE, payload: value });
  }, []);

  const setBatchQueue = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_BATCH_QUEUE, payload: value });
  }, []);

  const setBatchItemState = useCallback((fileKey, itemState) => {
    dispatch({
      type: PIPELINE_ACTIONS.SET_BATCH_ITEM_STATE,
      payload: { fileKey, itemState },
    });
  }, []);

  const setBatchProgress = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_BATCH_PROGRESS, payload: value });
  }, []);

  const clearBatch = useCallback(() => {
    dispatch({ type: PIPELINE_ACTIONS.CLEAR_BATCH });
  }, []);

  const removeBatchItem = useCallback((fileKey) => {
    dispatch({ type: PIPELINE_ACTIONS.REMOVE_BATCH_ITEM, payload: { fileKey } });
  }, []);

  const setToast = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_TOAST, payload: value });
  }, []);

  const setIsDragOver = useCallback((value) => {
    dispatch({ type: PIPELINE_ACTIONS.SET_DRAG_OVER, payload: value });
  }, []);

  // --- Undo/Redo ---

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      dispatch({
        type: PIPELINE_ACTIONS.SET_OPERATIONS,
        payload: historyRef.current[historyIndexRef.current],
      });
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      dispatch({
        type: PIPELINE_ACTIONS.SET_OPERATIONS,
        payload: historyRef.current[historyIndexRef.current],
      });
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Push initial pipeline to history on mount (after image size is known)
  const initializePipeline = useCallback((size) => {
    if (size.width && size.height) {
      const initialOps = createDefaultOperations();
      // Optionally: pre-configure resize/crop based on image size here
      historyRef.current = [initialOps];
      historyIndexRef.current = 0;
      dispatch({ type: PIPELINE_ACTIONS.SET_OPERATIONS, payload: initialOps });
    }
  }, []);

  return {
    // State
    ...state,

    // Actions
    updateOperation,
    toggleOperation,
    expandOperation,
    resetPipeline,
    initializePipeline,

    // UI setters
    setIsCropMode,
    setCropState,
    setIsComparisonVisible,
    setBatchQueue,
     setBatchItemState,
     setBatchProgress,
     clearBatch,
     removeBatchItem,
     setToast,
    setIsDragOver,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
