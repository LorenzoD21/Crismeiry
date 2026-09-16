/**
 * Resolves photo URLs cleanly so they work across root domains,
 * preview environments, and GitHub Pages subfolders (e.g. /Crismeiry/).
 */
export const getPhotoUrl = (photo?: { customSrc?: string; defaultSrc: string } | null): string => {
  if (!photo) return '';
  const raw = photo.customSrc || photo.defaultSrc;
  return resolveAssetPath(raw);
};

export const resolveAssetPath = (path?: string): string => {
  if (!path) return '';
  // Keep data URLs, blob URLs, and external URLs intact
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Convert absolute path /photos/... into relative ./photos/...
  if (path.startsWith('/')) {
    return `.${path}`;
  }
  if (!path.startsWith('./')) {
    return `./${path}`;
  }
  return path;
};
