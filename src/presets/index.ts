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
