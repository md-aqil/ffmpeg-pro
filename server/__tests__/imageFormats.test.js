const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const SAMPLE_FILE_ID = '031741f8-8a48-4ee9-9592-9aefe8ab09a0';
const SAMPLE_FILE_NAME = 'sample.jpg';

describe('image output formats', () => {
  jest.setTimeout(60000);

  test('returns supported image output formats from the server', async () => {
    const response = await axios.get(`${API_BASE}/image/formats`);

    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.output)).toBe(true);
    expect(response.data.output.map((item) => item.value)).toEqual(expect.arrayContaining(['jpg', 'png', 'tiff']));
  });

  test('rejects unsupported output formats before ffmpeg runs', async () => {
    await expect(axios.post(`${API_BASE}/image/pipeline`, {
      fileId: SAMPLE_FILE_ID,
      fileName: SAMPLE_FILE_NAME,
      operations: [
        { type: 'resize', width: 200, height: 200 },
      ],
      outputFormat: 'webp',
      quality: 80,
    })).rejects.toMatchObject({
      response: {
        status: 400,
      },
    });
  });
});
