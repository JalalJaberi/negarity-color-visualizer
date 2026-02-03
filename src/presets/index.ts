/**
 * Built-in color space presets
 */

import { ColorSpace, PresetConfig } from '../types';

/**
 * RGB Color Space
 */
export const RGB_COLOR_SPACE: ColorSpace = {
  name: 'RGB',
  axes: [
    { name: 'r', label: 'Red', min: 0, max: 255 },
    { name: 'g', label: 'Green', min: 0, max: 255 },
    { name: 'b', label: 'Blue', min: 0, max: 255 },
  ],
  bounds: {
    min: [0, 0, 0],
    max: [255, 255, 255],
  },
};

/**
 * HSL Color Space
 */
export const HSL_COLOR_SPACE: ColorSpace = {
  name: 'HSL',
  axes: [
    { name: 'h', label: 'Hue', min: 0, max: 360, unit: '°' },
    { name: 's', label: 'Saturation', min: 0, max: 100, unit: '%' },
    { name: 'l', label: 'Lightness', min: 0, max: 100, unit: '%' },
  ],
  bounds: {
    min: [0, 0, 0],
    max: [360, 100, 100],
  },
};

/**
 * LAB Color Space
 */
export const LAB_COLOR_SPACE: ColorSpace = {
  name: 'LAB',
  axes: [
    { name: 'l', label: 'L*', min: 0, max: 100 },
    { name: 'a', label: 'a*', min: -128, max: 127 },
    { name: 'b', label: 'b*', min: -128, max: 127 },
  ],
  bounds: {
    min: [0, -128, -128],
    max: [100, 127, 127],
  },
};

/**
 * HSV Color Space
 */
export const HSV_COLOR_SPACE: ColorSpace = {
  name: 'HSV',
  axes: [
    { name: 'h', label: 'Hue', min: 0, max: 360, unit: '°' },
    { name: 's', label: 'Saturation', min: 0, max: 100, unit: '%' },
    { name: 'v', label: 'Value', min: 0, max: 100, unit: '%' },
  ],
  bounds: {
    min: [0, 0, 0],
    max: [360, 100, 100],
  },
};

/**
 * CMYK Color Space
 */
export const CMYK_COLOR_SPACE: ColorSpace = {
  name: 'CMYK',
  axes: [
    { name: 'c', label: 'Cyan', min: 0, max: 100, unit: '%' },
    { name: 'm', label: 'Magenta', min: 0, max: 100, unit: '%' },
    { name: 'y', label: 'Yellow', min: 0, max: 100, unit: '%' },
    { name: 'k', label: 'Key (Black)', min: 0, max: 100, unit: '%' },
  ],
  bounds: {
    min: [0, 0, 0, 0],
    max: [100, 100, 100, 100],
  },
};

/**
 * XYZ Color Space
 */
export const XYZ_COLOR_SPACE: ColorSpace = {
  name: 'XYZ',
  axes: [
    { name: 'x', label: 'X', min: 0, max: 100 },
    { name: 'y', label: 'Y', min: 0, max: 100 },
    { name: 'z', label: 'Z', min: 0, max: 100 },
  ],
  bounds: {
    min: [0, 0, 0],
    max: [100, 100, 100],
  },
};

/**
 * LCh Color Space
 */
export const LCH_COLOR_SPACE: ColorSpace = {
  name: 'LCh',
  axes: [
    { name: 'l', label: 'L*', min: 0, max: 100 },
    { name: 'c', label: 'C*', min: 0, max: 150 },
    { name: 'h', label: 'h*', min: 0, max: 360, unit: '°' },
  ],
  bounds: {
    min: [0, 0, 0],
    max: [100, 150, 360],
  },
};

/**
 * YCbCr Color Space
 */
export const YCBCR_COLOR_SPACE: ColorSpace = {
  name: 'YCbCr',
  axes: [
    { name: 'y', label: 'Y', min: 16, max: 235 },
    { name: 'cb', label: 'Cb', min: 16, max: 240 },
    { name: 'cr', label: 'Cr', min: 16, max: 240 },
  ],
  bounds: {
    min: [16, 16, 16],
    max: [235, 240, 240],
  },
};

/**
 * RGB Cube Preset
 */
export const RGB_CUBE_PRESET: PresetConfig = {
  name: 'RGB Cube',
  colorSpace: RGB_COLOR_SPACE,
  shape: 'cube',
  size: {
    width: 255,
    height: 255,
    depth: 255,
  },
  config: {
    mode: '3d',
    showAxes: true,
    showLabels: true,
    showGrid: true,
    interactive: true,
  },
};

/**
 * Get all built-in presets
 */
export function getBuiltInPresets(): PresetConfig[] {
  return [RGB_CUBE_PRESET];
}

/**
 * Get preset by name
 */
export function getPresetByName(name: string): PresetConfig | null {
  const presets = getBuiltInPresets();
  return presets.find((p) => p.name === name) || null;
}
