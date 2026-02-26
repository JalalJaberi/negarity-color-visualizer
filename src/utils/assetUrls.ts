/**
 * Resolve default asset URLs for bundled images.
 * Images are shipped with the library and resolved relative to the script.
 */

let _baseUrl: string | null = null;

function getScriptBaseUrl(): string {
  if (_baseUrl !== null) return _baseUrl;
  if (typeof document === 'undefined') {
    _baseUrl = '';
    return '';
  }
  const script =
    document.currentScript ||
    document.querySelector('script[src*="negarity-color-visualizer"]');
  const src = script && 'src' in script ? (script as HTMLScriptElement).src : '';
  if (src) {
    const lastSlash = src.lastIndexOf('/');
    _baseUrl = lastSlash >= 0 ? src.substring(0, lastSlash + 1) : '';
  } else {
    _baseUrl = '';
  }
  return _baseUrl;
}

/** Base URL for asset directory (same folder as UMD script, or assets/ subdir) */
export function getAssetBaseUrl(): string {
  return getScriptBaseUrl();
}

/** Default circle.png URL (hue wheel) - uses bundled asset when no custom URL given */
export function getDefaultCircleImageUrl(): string {
  const base = getAssetBaseUrl();
  return base ? base + 'circle.png' : '';
}

/** Default horseshoe.png URL (CIE chromaticity) - uses bundled asset when no custom URL given */
export function getDefaultHorseshoeImageUrl(): string {
  const base = getAssetBaseUrl();
  return base ? base + 'horseshoe.png' : '';
}
