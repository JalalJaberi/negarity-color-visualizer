/**
 * Convert current color space values to hex for preview.
 * Uses the library's colorConversion utils.
 */

import {
  cmykToRgb,
  hslToRgb,
  hsvToRgb,
  labToRgb,
  lchToLab,
  xyzToRgb,
  ycbcrToRgb,
} from '../utils/colorConversion';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

export function valuesToHex(
  colorSpace: string,
  values: Record<string, number>
): string {
  const v = values;
  const space = (colorSpace || '').toUpperCase();

  switch (space) {
    case 'RGB':
      return rgbToHex(v.r ?? v[0] ?? 0, v.g ?? v[1] ?? 0, v.b ?? v[2] ?? 0);
    case 'HSL': {
      const [r, g, b] = hslToRgb(v.h ?? v[0] ?? 0, v.s ?? v[1] ?? 0, v.l ?? v[2] ?? 0);
      return rgbToHex(r, g, b);
    }
    case 'HSV': {
      const [r, g, b] = hsvToRgb(v.h ?? v[0] ?? 0, v.s ?? v[1] ?? 0, v.v ?? v[2] ?? 0);
      return rgbToHex(r, g, b);
    }
    case 'CMYK': {
      const [r, g, b] = cmykToRgb(v.c ?? v[0] ?? 0, v.m ?? v[1] ?? 0, v.y ?? v[2] ?? 0, v.k ?? v[3] ?? 0);
      return rgbToHex(r, g, b);
    }
    case 'XYZ': {
      const [r, g, b] = xyzToRgb(v.x ?? v[0] ?? 0, v.y ?? v[1] ?? 0, v.z ?? v[2] ?? 0);
      return rgbToHex(r, g, b);
    }
    case 'LAB': {
      const [r, g, b] = labToRgb(v.L ?? v.l ?? v[0] ?? 0, v.a ?? v[1] ?? 0, v.b ?? v[2] ?? 0);
      return rgbToHex(r, g, b);
    }
    case 'LCH': {
      const [l, a, b] = lchToLab(v.L ?? v.l ?? v[0] ?? 0, v.C ?? v.c ?? v[1] ?? 0, v.h ?? v[2] ?? 0);
      const [r, g, b_rgb] = labToRgb(l, a, b);
      return rgbToHex(r, g, b_rgb);
    }
    case 'YCBCR': {
      const [r, g, b] = ycbcrToRgb(v.y ?? v[0] ?? 16, v.cb ?? v[1] ?? 128, v.cr ?? v[2] ?? 128);
      return rgbToHex(r, g, b);
    }
    default:
      return '#808080';
  }
}
