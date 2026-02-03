/**
 * XYZ 2D Visualization Example
 * Shows xy chromaticity diagram (same as RGB)
 */

import { ColorVisualizer, XYZ_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';

const container = document.getElementById('xyz-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const xyzPreset: PresetConfig = {
  name: 'XYZ Chromaticity',
  colorSpace: XYZ_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [24.0, 18.0, 3.0], // XYZ values for red
      color: '#ff0000',
      label: 'Red',
    },
  ],
  config: {
    mode: '2d',
    width: container.clientWidth || 800,
    height: 600,
    backgroundColor: '#ffffff',
    showAxes: true,
    showLabels: true,
    custom: {
      showChromaticity: true,
    },
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

visualizer.render(xyzPreset);

(window as any).updatePoint = (x: number, y: number, z: number, label?: string) => {
  // Convert XYZ to RGB for display (placeholder - would need proper XYZ to RGB conversion)
  const hexColor = '#ff0000';

  const newPreset: PresetConfig = {
    ...xyzPreset,
    points: [
      {
        values: [x, y, z],
        color: hexColor,
        label: label || `XYZ(${x}, ${y}, ${z})`,
      },
    ],
  };

  visualizer.render(newPreset);
};

window.addEventListener('resize', () => {
  visualizer.handleResize();
});
