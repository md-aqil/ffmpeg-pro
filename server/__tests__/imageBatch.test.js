const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

describe('image batch processing', () => {
  jest.setTimeout(120000);

  test('processes multiple uploaded images and returns per-file results', async () => {
    const response = await axios.post(`${API_BASE}/image/batch`, {
      operation: 'process',
      files: [
        { fileId: '031741f8-8a48-4ee9-9592-9aefe8ab09a0', fileName: '031741f8-8a48-4ee9-9592-9aefe8ab09a0.jpg' },
        { fileId: '1238720a-7349-4bed-b144-affed54d5515', fileName: '1238720a-7349-4bed-b144-affed54d5515.jpg' },
      ],
      settings: {
        operations: [
          { type: 'resize', width: 160, height: 160 },
        ],
        outputFormat: 'png',
        quality: 80,
      },
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data.results).toHaveLength(2);
    expect(response.data.data.results.every((item) => item.success === true)).toBe(true);
    expect(response.data.data.archiveFilename).toMatch(/\.zip$/);

    const archivePath = path.join(__dirname, '../converted', response.data.data.archiveFilename);
    expect(fs.existsSync(archivePath)).toBe(true);
  });

  test('allows format-only batch conversion without extra image operations', async () => {
    const response = await axios.post(`${API_BASE}/image/batch`, {
      operation: 'process',
      files: [
        { fileId: '031741f8-8a48-4ee9-9592-9aefe8ab09a0', fileName: '031741f8-8a48-4ee9-9592-9aefe8ab09a0.jpg' },
        { fileId: '1238720a-7349-4bed-b144-affed54d5515', fileName: '1238720a-7349-4bed-b144-affed54d5515.jpg' },
      ],
      settings: {
        operations: [],
        outputFormat: 'png',
        quality: 80,
      },
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data.results).toHaveLength(2);
    expect(response.data.data.results.every((item) => item.success === true)).toBe(true);
    expect(response.data.data.archiveFilename).toMatch(/\.zip$/);
  });
});
