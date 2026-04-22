import { API_URL } from '@/constant/env';

function getApiBase(): string {
  return API_URL.replace(/\/+$/, '');
}

export function extractStoragePath(value: string): string {
  const input = value.trim();
  if (!input) return '';

  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return input.startsWith('/') ? input.slice(1) : input;
  }

  try {
    const parsed = new URL(input);

    if (parsed.searchParams.has('path')) {
      const queryPath = parsed.searchParams.get('path') || '';
      return decodeURIComponent(queryPath).replace(/^\/+/, '');
    }

    if (parsed.hostname === 'firebasestorage.googleapis.com') {
      const marker = '/o/';
      const markerIndex = parsed.pathname.indexOf(marker);
      if (markerIndex !== -1) {
        const encoded = parsed.pathname.slice(markerIndex + marker.length);
        return decodeURIComponent(encoded).replace(/^\/+/, '');
      }
    }
  } catch {
    return input;
  }

  return input;
}

export function buildMediaViewUrl(pathOrUrl: string): string {
  const filePath = extractStoragePath(pathOrUrl);
  if (!filePath) return '';

  const base = getApiBase();
  if (!base) {
    return filePath.startsWith('http://') || filePath.startsWith('https://')
      ? filePath
      : `/${filePath}`;
  }

  return `${base}/v1/media/view?path=${encodeURIComponent(filePath)}`;
}
