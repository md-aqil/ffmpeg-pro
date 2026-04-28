const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const SAMPLE_FILE_ID = '031741f8-8a48-4ee9-9592-9aefe8ab09a0';
const SAMPLE_FILE_NAME = 'sample.jpg';

describe('image pipeline', () => {
  jest.setTimeout(60000);

  test('simple resize pipeline returns a converted file', async () => {
    const response = await axios.post(`${API_BASE}/image/pipeline`, {
      fileId: SAMPLE_FILE_ID,
      fileName: SAMPLE_FILE_NAME,
      operations: [
        { type: 'resize', width: 200, height: 200 },
      ],
      outputFormat: 'png',
      quality: 80,
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data.filename).toMatch(/\.png$/);

    const outputPath = path.join(__dirname, '../converted', response.data.data.filename);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
