jest.mock('react-router-dom', () => ({
  Link: () => null,
  useLocation: () => ({ pathname: '/image' }),
}), { virtual: true });

jest.mock('../../components/Toast', () => () => null);
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {},
  batchProcessImages: jest.fn(),
  downloadFile: jest.fn(),
  getImageMetadata: jest.fn(),
  getSupportedImageFormats: jest.fn(),
  processImagePipeline: jest.fn(),
  uploadFile: jest.fn(),
}), { virtual: true });

import { getBatchQueueKey } from '../image-studio/batchWorkflow';

describe('getBatchQueueKey', () => {
  it('returns different keys for different file objects with the same metadata', () => {
    const commonProps = {
      name: 'hero image.png',
      size: 1024,
      lastModified: 1700000000000,
      type: 'image/png',
    };

    const firstFile = new File(['first'], commonProps.name, commonProps);
    const secondFile = new File(['second'], commonProps.name, commonProps);

    expect(getBatchQueueKey(firstFile)).not.toBe(getBatchQueueKey(secondFile));
  });
});
