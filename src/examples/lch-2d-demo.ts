/**
 * LCh 2D Visualization Example
 * Shows Chroma vs Hue (polar)
 */

import { ColorVisualizer, LCH_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';

const container = document.getElementById('lch-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const lchPreset: PresetConfig = {
  name: 'LCh Chroma vs Hue',
  colorSpace: LCH_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [50, 0, 0], // LCh: L*=50, C*=0, h*=0
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

visualizer.render(lchPreset);

(window as any).updatePoint = (l: number, c: number, h: number, label?: string) => {
  const hexColor = '#808080'; // Placeholder

  const newPreset: PresetConfig = {
    ...lchPreset,
    points: [
      {
        values: [l, c, h],
        color: hexColor,
        label: label || `LCh(${l}, ${c}, ${h}°)`,
      },
    ],
  };

  visualizer.render(newPreset);
};

window.addEventListener('resize', () => {
  visualizer.handleResize();
});
