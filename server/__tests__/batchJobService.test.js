const {
  createBatchJob,
  getBatchJob,
  updateBatchJob,
  listBatchJobs,
  resetBatchJobs,
} = require('../services/batchJobService');

describe('batch job service', () => {
  beforeEach(() => {
    resetBatchJobs();
  });

  test('creates, updates, and lists in-memory batch job records', () => {
    const job = createBatchJob({
      type: 'image',
      status: 'queued',
      fileCount: 2,
      metadata: { source: 'ImagePage' },
    });

    expect(job.id).toMatch(/^batch_job_/);
    expect(job.type).toBe('image');
    expect(job.status).toBe('queued');
    expect(job.fileCount).toBe(2);
    expect(job.metadata).toEqual({ source: 'ImagePage' });
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.updatedAt).toBeInstanceOf(Date);

    const updated = updateBatchJob(job.id, {
      status: 'processing',
      progress: 50,
    });

    expect(updated.status).toBe('processing');
    expect(updated.progress).toBe(50);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(job.updatedAt.getTime());

    expect(getBatchJob(job.id)).toEqual(updated);
    expect(listBatchJobs()).toHaveLength(1);
  });
});
