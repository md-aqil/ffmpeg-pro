export const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDimension = (value) => (value ? value.toLocaleString() : '—');

export const truncateTwoWords = (fileName) => {
  const baseName = String(fileName || '').replace(/\.[^.]+$/, '').trim();
  if (!baseName) return '';

  const words = baseName.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) {
    return baseName.length > 24 ? `${baseName.slice(0, 24)}...` : baseName;
  }

  if (words.length === 1) {
    return baseName.length > 24 ? `${baseName.slice(0, 24)}...` : baseName;
  }

  if (words.length === 2) {
    return words.join(' ');
  }

  return `${words.slice(0, 2).join(' ')}...`;
};
