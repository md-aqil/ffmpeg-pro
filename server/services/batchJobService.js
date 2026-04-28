const batchJobs = new Map();

const cloneJob = (job) => {
  if (!job) {
    return null;
  }

  return {
    ...job,
    metadata: job.metadata ? { ...job.metadata } : undefined,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
  };
};

const createBatchJob = (payload = {}) => {
  const now = new Date();
  const id = `batch_job_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`;

  const job = {
    id,
    type: payload.type || 'image',
    status: payload.status || 'queued',
    fileCount: Number.isFinite(payload.fileCount) ? payload.fileCount : 0,
    progress: Number.isFinite(payload.progress) ? payload.progress : 0,
    metadata: payload.metadata ? { ...payload.metadata } : undefined,
    createdAt: now,
    updatedAt: now,
  };

  batchJobs.set(id, job);
  return cloneJob(job);
};

const getBatchJob = (id) => cloneJob(batchJobs.get(id));

const updateBatchJob = (id, updates = {}) => {
  const existing = batchJobs.get(id);
  if (!existing) {
    return null;
  }

  const nextJob = {
    ...existing,
    ...updates,
    metadata: updates.metadata ? { ...updates.metadata } : existing.metadata,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  };

  batchJobs.set(id, nextJob);
  return cloneJob(nextJob);
};

const listBatchJobs = () => Array.from(batchJobs.values()).map(cloneJob);

const resetBatchJobs = () => {
  batchJobs.clear();
};

module.exports = {
  createBatchJob,
  getBatchJob,
  updateBatchJob,
  listBatchJobs,
  resetBatchJobs,
};
