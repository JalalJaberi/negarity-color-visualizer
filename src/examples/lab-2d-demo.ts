/**
 * Lab 2D Visualization Example
 * Shows a* vs b* plane
 */

import { ColorVisualizer, LAB_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';

const container = document.getElementById('lab-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const labPreset: PresetConfig = {
  name: 'Lab a* vs b*',
  colorSpace: LAB_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [50, 0, 0], // Lab: L*=50, a*=0, b*=0 (neutral gray)
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

visualizer.render(labPreset);

(window as any).updatePoint = (l: number, a: number, b: number, label?: string) => {
  // Convert Lab to RGB for display (simplified)
  const hexColor = '#808080'; // Placeholder

  const newPreset: PresetConfig = {
    ...labPreset,
    points: [
      {
        values: [l, a, b],
        color: hexColor,
        label: label || `Lab(${l}, ${a}, ${b})`,
      },
    ],
  };

  visualizer.render(newPreset);
};

window.addEventListener('resize', () => {
  visualizer.handleResize();
});
