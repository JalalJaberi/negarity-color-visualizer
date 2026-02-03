/**
 * CMYK 2D Visualization Example
 * Shows C vs M plot
 */

import { ColorVisualizer, CMYK_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';
import { cmykToRgb } from '../utils/colorConversion';

const container = document.getElementById('cmyk-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const cmykPreset: PresetConfig = {
  name: 'CMYK C vs M',
  colorSpace: CMYK_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [100, 0, 0, 0], // CMYK: C=100%, M=0%, Y=0%, K=0%
      color: '#00ffff',
      label: 'Cyan',
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

visualizer.render(cmykPreset);

(window as any).updatePoint = (c: number, m: number, y: number, k: number, label?: string) => {
  const [r, g, b] = cmykToRgb(c, m, y, k);
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...cmykPreset,
    points: [
      {
        values: [c, m, y, k],
        color: hexColor,
        label: label || `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`,
      },
    ],
  };

  visualizer.render(newPreset);
};

window.addEventListener('resize', () => {
  visualizer.handleResize();
});
