import { buildBatchProcessRequest, getBatchQueueKey, prependSelectedBatchFile } from './batchWorkflow';

describe('batchWorkflow helpers', () => {
  test('prepends the selected file once when entering batch mode', () => {
    const selectedFile = {
      name: 'cover image.png',
      size: 1200,
      lastModified: 1700000000000,
    };
    const queue = [
      {
        name: 'second image.png',
        size: 2400,
        lastModified: 1700000000100,
      },
    ];

    const nextQueue = prependSelectedBatchFile(selectedFile, queue);

    expect(nextQueue).toHaveLength(2);
    expect(nextQueue[0]).toBe(selectedFile);
    expect(nextQueue[1]).toBe(queue[0]);
  });

  test('reuses the same queue key for the same file object', () => {
    const file = {
      name: 'cover image.png',
      size: 1200,
      lastModified: 1700000000000,
    };

    expect(getBatchQueueKey(file)).toBe(getBatchQueueKey(file));
  });

  test('builds the batch process payload with files, operation, and settings', () => {
    const files = [
      { fileId: 'a-1', fileName: 'one.png' },
      { fileId: 'b-2', fileName: 'two.png' },
    ];
    const settings = {
      operations: [{ type: 'resize', width: 1200, height: 900 }],
      outputFormat: 'png',
      quality: 90,
    };

    expect(buildBatchProcessRequest(files, 'process', settings)).toEqual({
      files,
      operation: 'process',
      settings,
    });
  });
});
