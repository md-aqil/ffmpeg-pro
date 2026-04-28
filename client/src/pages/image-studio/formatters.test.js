import { formatBytes, formatDimension, truncateTwoWords } from './formatters';

describe('formatters', () => {
  test('truncates long image names to two words', () => {
    expect(truncateTwoWords('very long marketing banner image.png')).toBe('very long...');
  });

  test('formats byte counts with readable units', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  test('formats missing dimensions as an em dash', () => {
    expect(formatDimension(null)).toBe('—');
  });
});
