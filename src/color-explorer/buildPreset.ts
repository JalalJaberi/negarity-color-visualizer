/**
 * Build a PresetConfig for ColorVisualizer from color-space key + channel values.
 */

import type { ColorSpace, PresetConfig, RenderMode } from '../types';
import {
  RGB_COLOR_SPACE,
  HSL_COLOR_SPACE,
  HSV_COLOR_SPACE,
  CMYK_COLOR_SPACE,
  XYZ_COLOR_SPACE,
  LAB_COLOR_SPACE,
  LCH_COLOR_SPACE,
  YCBCR_COLOR_SPACE,
  RGB_CUBE_PRESET,
} from '../presets';
import { getColorSpace } from '../color-channel-visualizer/channelConfig';
import { valuesToHex } from '../color-channel-visualizer/valuesToHex';
import {
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  rgbToXyz,
  rgbToLab,
  labToLch,
  rgbToYcbcr,
} from '../utils/colorConversion';

const SPACE_DEFS: Record<string, ColorSpace> = {
  RGB: RGB_COLOR_SPACE,
  HSL: HSL_COLOR_SPACE,
  HSV: HSV_COLOR_SPACE,
  CMYK: CMYK_COLOR_SPACE,
  XYZ: XYZ_COLOR_SPACE,
  LAB: LAB_COLOR_SPACE,
  LCH: LCH_COLOR_SPACE,
  YCBCR: YCBCR_COLOR_SPACE,
};

/** Human-readable slice caption under the plot (matches design copy). */
export function getSliceCaption(spaceKey: string): string {
  const k = normalizeSpaceKey(spaceKey);
  switch (k) {
    case 'RGB':
      return 'R–G plane · B fixed';
    case 'HSL':
      return 'Hue–Saturation · Lightness fixed';
    case 'HSV':
      return 'Hue–Saturation · Value fixed';
    case 'CMYK':
      return 'C–M plane · Y/K fixed';
    case 'XYZ':
      return 'X–Y slice · Z fixed';
    case 'LAB':
      return 'a*–b* slice · L* fixed';
    case 'LCH':
      return 'C*–h* · L* fixed';
    case 'YCBCR':
      return 'Cb–Cr slice · Y fixed';
    default:
      return '';
  }
}

export function normalizeSpaceKey(key: string): string {
  return (key || 'RGB').toUpperCase().replace(/\s/g, '');
}

export function displaySpaceLabel(key: string): string {
  const k = normalizeSpaceKey(key);
  const labels: Record<string, string> = {
    RGB: 'RGB',
    HSL: 'HSL',
    HSV: 'HSV',
    CMYK: 'CMYK',
    XYZ: 'XYZ',
    LAB: 'Lab',
    LCH: 'LCh',
    YCBCR: 'YCbCr',
  };
  return labels[k] || k;
}

/** Ordered channel values for ColorPoint.values */
export function valuesToPointArray(spaceKey: string, values: Record<string, number>): number[] {
  const space = getColorSpace(spaceKey);
  return space.channels.map((ch) => values[ch.key] ?? space.defaultValues[ch.key] ?? 0);
}

export function parseHexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Convert an RGB triple into channel values for the target space. */
export function rgbToSpaceValues(spaceKey: string, r: number, g: number, b: number): Record<string, number> {
  const k = normalizeSpaceKey(spaceKey);
  switch (k) {
    case 'RGB':
      return { r, g, b };
    case 'HSL': {
      const [h, s, l] = rgbToHsl(r, g, b);
      return { h, s, l };
    }
    case 'HSV': {
      const [h, s, v] = rgbToHsv(r, g, b);
      return { h, s, v };
    }
    case 'CMYK': {
      const [c, m, y, kk] = rgbToCmyk(r, g, b);
      return { c, m, y, k: kk };
    }
    case 'XYZ': {
      const [x, y, z] = rgbToXyz(r, g, b);
      return { x, y, z };
    }
    case 'LAB': {
      const [L, a, bb] = rgbToLab(r, g, b);
      return { L, a, b: bb };
    }
    case 'LCH': {
      const [L, a, bb] = rgbToLab(r, g, b);
      const [l, C, h] = labToLch(L, a, bb);
      return { L: l, C, h };
    }
    case 'YCBCR': {
      const [y, cb, cr] = rgbToYcbcr(r, g, b);
      return { y, cb, cr };
    }
    default:
      return { r, g, b };
  }
}

export interface BuildPresetOptions {
  colorSpace: string;
  mode: RenderMode;
  values: Record<string, number>;
  backgroundColor?: string;
  interactive?: boolean;
}

/**
 * Build a preset for the active space + mode.
 * 3D always uses the RGB cube with the current color as a marker (other 3D solids TBD).
 */
export function buildExplorerPreset(options: BuildPresetOptions): PresetConfig {
  const spaceKey = normalizeSpaceKey(options.colorSpace);
  const hex = valuesToHex(spaceKey, options.values);
  const pointValues = valuesToPointArray(spaceKey, options.values);
  const label = `${displaySpaceLabel(spaceKey)} · ${hex.toUpperCase()}`;

  if (options.mode === '3d') {
    const rgb = parseHexToRgb(hex) || [128, 128, 128];
    return {
      ...RGB_CUBE_PRESET,
      name: `RGB Cube · ${hex.toUpperCase()}`,
      points: [
        {
          values: rgb,
          color: hex,
          label,
        },
      ],
      config: {
        ...RGB_CUBE_PRESET.config,
        mode: '3d',
        backgroundColor: options.backgroundColor ?? '#f0f0f0',
        interactive: options.interactive !== false,
      },
    };
  }

  const colorSpace = SPACE_DEFS[spaceKey] || RGB_COLOR_SPACE;
  const custom: Record<string, unknown> = {};

  if (spaceKey === 'RGB' || spaceKey === 'XYZ') {
    custom.showChromaticity = true;
  }
  if (spaceKey === 'HSL') {
    custom.projection = 'hue-saturation';
    custom.fixedLightness = options.values.l ?? 50;
  }
  if (spaceKey === 'HSV') {
    custom.fixedValue = options.values.v ?? 100;
  }

  const shape = spaceKey === 'RGB' ? 'cube' : 'custom';

  return {
    name: `${displaySpaceLabel(spaceKey)} explorer`,
    colorSpace,
    shape,
    size: { width: 400, height: 400 },
    points: [
      {
        values: pointValues,
        color: hex,
        label,
      },
    ],
    config: {
      mode: '2d',
      backgroundColor: options.backgroundColor ?? '#ffffff',
      showAxes: true,
      showLabels: true,
      showGrid: spaceKey === 'RGB',
      interactive: options.interactive !== false,
      custom,
    },
  };
}
