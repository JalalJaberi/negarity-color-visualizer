/**
 * YCbCr 2D Visualization Example
 * Shows CIE chromaticity diagram with YCbCr gamut triangle
 */

import { ColorVisualizer, YCBCR_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';
import { ycbcrToRgb, rgbToYcbcr } from '../utils/colorConversion';

const container = document.getElementById('ycbcr-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const ycbcrPreset: PresetConfig = {
  name: 'YCbCr Chromaticity',
  colorSpace: YCBCR_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [128, 128, 128], // YCbCr: Y=128, Cb=128, Cr=128 (neutral gray)
      color: '#808080',
      label: 'Neutral Gray',
    },
  ],
  config: {
    mode: '2d',
    width: container.clientWidth || 800,
    height: 600,
    backgroundColor: '#ffffff',
    showAxes: true,
    showLabels: true,
  },
};

const visualizer = new ColorVisualizer(container, {
  mode: '2d',
  width: container.clientWidth || 800,
  height: 600,
  backgroundColor: '#ffffff',
  showAxes: true,
  showLabels: true,
  interactive: true,
});

visualizer.render(ycbcrPreset);

(window as any).updatePoint = (y: number, cb: number, cr: number, label?: string) => {
  const [r, g, b] = ycbcrToRgb(y, cb, cr);
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...ycbcrPreset,
    points: [
      {
        values: [y, cb, cr],
        color: hexColor,
        label: label || `YCbCr(${y}, ${cb}, ${cr})`,
      },
    ],
  };

  visualizer.render(newPreset);
};

window.addEventListener('resize', () => {
  visualizer.handleResize();
});

// Expose update functions for CIE background, axes, and marker
(window as any).updateCIEBackgroundFn = (config?: any) => {
  if (config) {
    visualizer.updateCIEBackground(config);
  }
};

(window as any).updateAxesFn = (config?: any) => {
  if (config) {
    visualizer.updateAxes(config);
  }
};

(window as any).updateMarkerFn = (config?: any) => {
  if (config) {
    visualizer.updateMarker(config);
  }
};

// Expose rgbToYcbcr for HTML use
(window as any).rgbToYcbcr = (r: number, g: number, b: number) => {
  return rgbToYcbcr(r, g, b);
};
