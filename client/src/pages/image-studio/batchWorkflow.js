const batchQueueKeyRegistry = new WeakMap();
let batchQueueKeySequence = 0;

export const getBatchQueueKey = (file) => {
  if (!file) return '';

  if (!batchQueueKeyRegistry.has(file)) {
    batchQueueKeySequence += 1;
    batchQueueKeyRegistry.set(file, `batch-${batchQueueKeySequence}`);
  }

  return batchQueueKeyRegistry.get(file);
};

export const prependSelectedBatchFile = (selectedFile, batchQueue = []) => {
  if (!selectedFile) return batchQueue;

  const selectedKey = getBatchQueueKey(selectedFile);
  if (batchQueue.some((file) => getBatchQueueKey(file) === selectedKey)) {
    return batchQueue;
  }

  return [selectedFile, ...batchQueue];
};

export const buildBatchProcessRequest = (files, operation, settings) => ({
  files,
  operation,
  settings,
});
