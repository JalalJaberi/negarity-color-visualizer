/**
 * Declarative color space and channel definitions for the Color Channel Visualizer.
 */

export const CHANNEL_TYPES = {
  LINEAR: 'linear',
  CIRCULAR: 'circular',
  DEPENDENT_2: 'dependent2',
  DEPENDENT_3: 'dependent3',
  CIRCULAR_DEPENDENT: 'circularDependent',
} as const;

export interface ChannelDef {
  key: string;
  label: string;
  type: string;
  min: number;
  max: number;
  unit?: string;
  dependsOn?: string[];
  gradient?: { minColor?: string; maxColor?: string; midColor?: string };
}

export interface ColorSpaceDef {
  name: string;
  channels: ChannelDef[];
  defaultValues: Record<string, number>;
}

export const COLOR_SPACES: Record<string, ColorSpaceDef> = {
  RGB: {
    name: 'RGB',
    channels: [
      { key: 'r', label: 'R', type: CHANNEL_TYPES.LINEAR, min: 0, max: 255, gradient: { minColor: '#000000', maxColor: '#ff0000' } },
      { key: 'g', label: 'G', type: CHANNEL_TYPES.LINEAR, min: 0, max: 255, gradient: { minColor: '#000000', maxColor: '#00ff00' } },
      { key: 'b', label: 'B', type: CHANNEL_TYPES.LINEAR, min: 0, max: 255, gradient: { minColor: '#000000', maxColor: '#0000ff' } },
    ],
    defaultValues: { r: 128, g: 128, b: 128 },
  },
  CMYK: {
    name: 'CMYK',
    channels: [
      { key: 'c', label: 'C', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, unit: '%', gradient: { minColor: '#ffffff', maxColor: '#00ffff' } },
      { key: 'm', label: 'M', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, unit: '%', gradient: { minColor: '#ffffff', maxColor: '#ff00ff' } },
      { key: 'y', label: 'Y', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, unit: '%', gradient: { minColor: '#ffffff', maxColor: '#ffff00' } },
      { key: 'k', label: 'K', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, unit: '%', gradient: { minColor: '#ffffff', maxColor: '#000000' } },
    ],
    defaultValues: { c: 0, m: 0, y: 0, k: 0 },
  },
  HSL: {
    name: 'HSL',
    channels: [
      { key: 'h', label: 'H', type: CHANNEL_TYPES.CIRCULAR, min: 0, max: 360, unit: '°', dependsOn: [] },
      { key: 's', label: 'S', type: CHANNEL_TYPES.DEPENDENT_2, min: 0, max: 100, unit: '%', dependsOn: ['h'] },
      { key: 'l', label: 'L', type: CHANNEL_TYPES.DEPENDENT_3, min: 0, max: 100, unit: '%', dependsOn: ['h', 's'], gradient: { minColor: '#000000', midColor: 'hsl', maxColor: '#ffffff' } },
    ],
    defaultValues: { h: 0, s: 50, l: 50 },
  },
  HSV: {
    name: 'HSV',
    channels: [
      { key: 'h', label: 'H', type: CHANNEL_TYPES.CIRCULAR, min: 0, max: 360, unit: '°', dependsOn: [] },
      { key: 's', label: 'S', type: CHANNEL_TYPES.DEPENDENT_2, min: 0, max: 100, unit: '%', dependsOn: ['h'] },
      { key: 'v', label: 'V', type: CHANNEL_TYPES.DEPENDENT_3, min: 0, max: 100, unit: '%', dependsOn: ['h', 's'], gradient: { minColor: '#000000', midColor: 'hsv', maxColor: '#ffffff' } },
    ],
    defaultValues: { h: 0, s: 50, v: 50 },
  },
  LAB: {
    name: 'Lab',
    channels: [
      { key: 'L', label: 'L*', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
      { key: 'a', label: 'a*', type: CHANNEL_TYPES.DEPENDENT_3, min: -128, max: 127, dependsOn: ['L'], gradient: { minColor: 'green', midColor: '#808080', maxColor: 'red' } },
      { key: 'b', label: 'b*', type: CHANNEL_TYPES.DEPENDENT_3, min: -128, max: 127, dependsOn: ['L'], gradient: { minColor: 'blue', midColor: '#808080', maxColor: 'yellow' } },
    ],
    defaultValues: { L: 50, a: 0, b: 0 },
  },
  LCH: {
    name: 'LCh',
    channels: [
      { key: 'L', label: 'L*', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
      { key: 'C', label: 'C*', type: CHANNEL_TYPES.DEPENDENT_2, min: 0, max: 132, dependsOn: ['L', 'h'] },
      { key: 'h', label: 'h°', type: CHANNEL_TYPES.CIRCULAR_DEPENDENT, min: 0, max: 360, unit: '°', dependsOn: ['L', 'C'] },
    ],
    defaultValues: { L: 50, C: 0, h: 0 },
  },
  XYZ: {
    name: 'XYZ',
    channels: [
      { key: 'x', label: 'X', type: CHANNEL_TYPES.LINEAR, min: 0, max: 95.05, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
      { key: 'y', label: 'Y', type: CHANNEL_TYPES.LINEAR, min: 0, max: 100, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
      { key: 'z', label: 'Z', type: CHANNEL_TYPES.LINEAR, min: 0, max: 108.9, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
    ],
    defaultValues: { x: 41.24, y: 21.26, z: 1.93 },
  },
  YCBCR: {
    name: 'YCbCr',
    channels: [
      { key: 'y', label: 'Y', type: CHANNEL_TYPES.LINEAR, min: 16, max: 235, gradient: { minColor: '#000000', maxColor: '#ffffff' } },
      { key: 'cb', label: 'Cb', type: CHANNEL_TYPES.DEPENDENT_3, min: 16, max: 240, dependsOn: ['y'], gradient: { minColor: 'blue', midColor: '#808080', maxColor: 'yellow' } },
      { key: 'cr', label: 'Cr', type: CHANNEL_TYPES.DEPENDENT_3, min: 16, max: 240, dependsOn: ['y'], gradient: { minColor: 'green', midColor: '#808080', maxColor: 'red' } },
    ],
    defaultValues: { y: 128, cb: 128, cr: 128 },
  },
};

export function getColorSpace(key: string): ColorSpaceDef {
  const k = (key || '').toUpperCase().replace(/\s/g, '');
  return COLOR_SPACES[k] || COLOR_SPACES['RGB'];
}

export function getValuesForSpace(colorSpaceKey: string, overrides?: Record<string, number>): Record<string, number> {
  const space = getColorSpace(colorSpaceKey);
  const out = { ...space.defaultValues };
  if (overrides && typeof overrides === 'object') {
    space.channels.forEach((ch) => {
      if (overrides[ch.key] !== undefined) out[ch.key] = Number(overrides[ch.key]);
    });
  }
  return out;
}
