# Image Page Enterprise Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Image page enterprise-ready by separating concerns, stabilizing batch processing, and turning FFmpeg capability into a first-class product feature.

**Architecture:** Keep the current user-facing workflow, but move batch orchestration, queue identity, and FFmpeg capability logic into smaller focused modules. The page should remain visually familiar while the internals shift to deterministic IDs, resumable batch behavior, and codec-aware UI controls.

**Tech Stack:** React, Node.js/Express, FFmpeg, Axios, Archiver, existing client/server test suites.

---

### Task 1: Stabilize batch queue identity and state updates

**Files:**
- Modify: `client/src/pages/ImagePage.js`
- Test: `client/src/pages/__tests__/ImagePage.batch.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, expect, test } from 'vitest';

describe('batch queue identity', () => {
  test('keeps separate status for files that share name size and timestamp', () => {
    const now = 1710000000000;
    const fileA = { name: 'image.png', size: 1024, lastModified: now };
    const fileB = { name: 'image.png', size: 1024, lastModified: now };

    const keyA = `${fileA.name}-${fileA.size}-${fileA.lastModified}`;
    const keyB = `${fileB.name}-${fileB.size}-${fileB.lastModified}`;

    expect(keyA).not.toBe(keyB);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- client/src/pages/__tests__/ImagePage.batch.test.js -v`
Expected: FAIL because the current file-key strategy collides.

- [ ] **Step 3: Write minimal implementation**

```javascript
const createBatchItemId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getBatchFileKey = (file) => file.__batchId || file.batchId || `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- client/src/pages/__tests__/ImagePage.batch.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/ImagePage.js client/src/pages/__tests__/ImagePage.batch.test.js
git commit -m "fix: stabilize batch queue identity"
```

### Task 2: Move batch orchestration into a dedicated client hook

**Files:**
- Create: `client/src/pages/image-studio/useBatchWorkflow.js`
- Modify: `client/src/pages/ImagePage.js`
- Test: `client/src/pages/__tests__/useBatchWorkflow.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, expect, test } from 'vitest';
import { buildBatchUploadPayload } from '../image-studio/useBatchWorkflow';

describe('buildBatchUploadPayload', () => {
  test('always includes the inherited first image when batch mode starts from a selected file', () => {
    const selectedFile = { name: 'hero.jpg', size: 100, lastModified: 1, batchId: 'first' };
    const queue = [{ name: 'second.jpg', size: 200, lastModified: 2, batchId: 'second' }];

    const payload = buildBatchUploadPayload({ selectedFile, queue });

    expect(payload[0].fileName).toBe('hero.jpg');
    expect(payload).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- client/src/pages/__tests__/useBatchWorkflow.test.js -v`
Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```javascript
export const buildBatchUploadPayload = ({ selectedFile, queue }) => {
  const items = [];
  const seen = new Set();

  for (const file of [selectedFile, ...(queue || [])]) {
    if (!file) continue;
    const key = file.batchId || file.__batchId || `${file.name}-${file.size}-${file.lastModified}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ fileId: file.fileId || null, fileName: file.name || 'image' });
  }

  return items;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- client/src/pages/__tests__/useBatchWorkflow.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/image-studio/useBatchWorkflow.js client/src/pages/ImagePage.js client/src/pages/__tests__/useBatchWorkflow.test.js
git commit -m "refactor: extract batch workflow helper"
```

### Task 3: Make batch processing resumable and observable on the server

**Files:**
- Modify: `server/controllers/imageController.js`
- Create: `server/services/imageBatchJobs.js`
- Test: `server/__tests__/imageBatchJobs.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
const { describe, expect, test } = require('vitest');
const { createBatchJob } = require('../services/imageBatchJobs');

describe('batch jobs', () => {
  test('creates a durable job record with queued items and a stable job id', () => {
    const job = createBatchJob([
      { fileId: 'a', fileName: 'one.png' },
      { fileId: 'b', fileName: 'two.png' },
    ]);

    expect(job.id).toBeDefined();
    expect(job.items).toHaveLength(2);
    expect(job.status).toBe('queued');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/__tests__/imageBatchJobs.test.js -v`
Expected: FAIL because the batch job service does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```javascript
const { randomUUID } = require('crypto');

const createBatchJob = (items) => ({
  id: randomUUID(),
  status: 'queued',
  createdAt: new Date().toISOString(),
  items: (items || []).map((item) => ({ ...item, status: 'queued' })),
});

module.exports = { createBatchJob };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- server/__tests__/imageBatchJobs.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/services/imageBatchJobs.js server/controllers/imageController.js server/__tests__/imageBatchJobs.test.js
git commit -m "feat: add batch job service"
```

### Task 4: Add codec-aware image format and quality controls

**Files:**
- Modify: `server/controllers/imageController.js`
- Modify: `client/src/pages/ImagePage.js`
- Modify: `client/src/pages/ImagePage.css`
- Test: `server/__tests__/imageFormats.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
const { describe, expect, test } = require('vitest');
const { validateImageOutputFormat } = require('../controllers/imageController');

describe('validateImageOutputFormat', () => {
  test('rejects unsupported ffmpeg formats with a clear 400-level error', () => {
    expect(() => validateImageOutputFormat('webp')).toThrow(/Unsupported image output format/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/__tests__/imageFormats.test.js -v`
Expected: FAIL if the helper is not exported or the assertion cannot reach the guard.

- [ ] **Step 3: Write minimal implementation**

```javascript
module.exports = {
  validateImageOutputFormat,
  getImageFormats,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- server/__tests__/imageFormats.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/controllers/imageController.js client/src/pages/ImagePage.js client/src/pages/ImagePage.css server/__tests__/imageFormats.test.js
git commit -m "feat: make image formats codec aware"
```

### Task 5: Split the Image page into focused presentational units

**Files:**
- Create: `client/src/pages/image-studio/StudioCanvas.jsx`
- Create: `client/src/pages/image-studio/BatchQueueCard.jsx`
- Create: `client/src/pages/image-studio/OperationPanel.jsx`
- Create: `client/src/pages/image-studio/ResultPanel.jsx`
- Modify: `client/src/pages/ImagePage.js`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, expect, test } from 'vitest';
import { truncateTwoWords } from '../image-studio/formatters';

describe('truncateTwoWords', () => {
  test('keeps the first two words and appends ellipsis for long names', () => {
    expect(truncateTwoWords('very long marketing banner image.png')).toBe('very long...');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- client/src/pages/__tests__/formatters.test.js -v`
Expected: FAIL because formatter module is not extracted yet.

- [ ] **Step 3: Write minimal implementation**

```javascript
export const truncateTwoWords = (fileName) => {
  const baseName = String(fileName || '').replace(/\.[^.]+$/, '').trim();
  const words = baseName.split(/[\s._-]+/).filter(Boolean);
  return words.length > 2 ? `${words.slice(0, 2).join(' ')}...` : baseName;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- client/src/pages/__tests__/formatters.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/image-studio/* client/src/pages/ImagePage.js client/src/pages/__tests__/formatters.test.js
git commit -m "refactor: split image studio page components"
```

### Task 6: Add FFmpeg-powered presets for enterprise workflows

**Files:**
- Modify: `client/src/pages/ImagePage.js`
- Modify: `server/controllers/imageController.js`
- Test: `server/__tests__/imagePipeline.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
const { describe, expect, test } = require('vitest');
const { buildPresetOperations } = require('../controllers/imageController');

describe('buildPresetOperations', () => {
  test('creates a social media preset that resizes and centers images', () => {
    const operations = buildPresetOperations('social-square');
    expect(operations.some((op) => op.type === 'resize')).toBe(true);
    expect(operations.some((op) => op.type === 'crop')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- server/__tests__/imagePipeline.test.js -v`
Expected: FAIL because the preset builder does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```javascript
const buildPresetOperations = (preset) => {
  if (preset === 'social-square') {
    return [
      { type: 'crop' },
      { type: 'resize' },
    ];
  }

  return [];
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- server/__tests__/imagePipeline.test.js -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/controllers/imageController.js client/src/pages/ImagePage.js server/__tests__/imagePipeline.test.js
git commit -m "feat: add image processing presets"
```

### Task 7: Verify the refactor on both client and server

**Files:**
- No code changes

- [ ] **Step 1: Run the server test suite**

Run: `npm test -- --runInBand`
Expected: all server tests pass.

- [ ] **Step 2: Run the client build**

Run: `CI=true npm run build`
Expected: build exits 0.

- [ ] **Step 3: Run a live batch smoke test**

Run a batch request through `POST /api/image/batch` with:

```json
{
  "files": [
    { "fileId": "<id-a>", "fileName": "one.png" },
    { "fileId": "<id-b>", "fileName": "two.png" }
  ],
  "settings": {
    "operations": [],
    "outputFormat": "png",
    "quality": 100
  }
}
```

Expected: JSON response contains `summary.succeeded`, `summary.failed`, and a ZIP filename when at least one item succeeds.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "refactor: harden image studio architecture"
```

## Coverage Check

- Batch execution architecture: Task 3
- Batch queue identity: Task 1
- Page decomposition: Task 5
- Codec-aware UI and validation: Task 4
- FFmpeg presets: Task 6
- Verification: Task 7

## Notes

- The refactor keeps the current image studio page as the entry point, so users do not need to relearn navigation.
- Batch processing should stay compatible with format-only jobs, because that is already a working use case.
- If Task 3 grows beyond a lightweight in-memory job service, move the queue store to Redis or a database-backed job table before adding retry persistence.
