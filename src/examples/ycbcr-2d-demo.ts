/**
 * YCbCr 2D Visualization Example
 * Shows Cb vs Cr plot
 */

import { ColorVisualizer, YCBCR_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';
import { ycbcrToRgb } from '../utils/colorConversion';

const container = document.getElementById('ycbcr-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const ycbcrPreset: PresetConfig = {
  name: 'YCbCr Cb vs Cr',
  colorSpace: YCBCR_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [128, 128, 128], // YCbCr: Y=128, Cb=128, Cr=128 (neutral)
      color: '#808080',
      label: 'Neutral',
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
