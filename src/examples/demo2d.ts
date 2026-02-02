/**
 * 2D Visualizer Example
 * Demonstrates various 2D color visualization techniques
 */

import { ColorVisualizer, RGB_COLOR_SPACE, HSL_COLOR_SPACE } from '../index';
import { PresetConfig, ColorPoint } from '../types';

// Get container elements
const container1 = document.getElementById('visualizer-2d-1');
const container2 = document.getElementById('visualizer-2d-2');
const container3 = document.getElementById('visualizer-2d-3');

if (!container1 || !container2 || !container3) {
  throw new Error('Container elements not found');
}

// Example 1: RGB Color Space 2D Projection
const rgb2DPreset: PresetConfig = {
  name: 'RGB 2D Projection',
  colorSpace: RGB_COLOR_SPACE,
  shape: 'cube',
  size: {
    width: 400,
    height: 400,
  },
  config: {
    mode: '2d',
    width: container1.clientWidth || 600,
    height: 400,
    backgroundColor: '#ffffff',
    showAxes: true,
    showLabels: true,
    showGrid: false,
    interactive: true,
  },
};

const visualizer1 = new ColorVisualizer(container1, {
  mode: '2d',
  width: container1.clientWidth || 600,
  height: 400,
  backgroundColor: '#ffffff',
  showAxes: true,
  showLabels: true,
  showGrid: false,
  interactive: true,
});

visualizer1.render(rgb2DPreset);

// Example 2: HSL Color Space Visualization with Color Points
const hsl2DPreset: PresetConfig = {
  name: 'HSL Color Space',
  colorSpace: HSL_COLOR_SPACE,
  shape: 'cube',
  size: {
    width: 360, // Hue range
    height: 100, // Saturation/Lightness range
  },
  points: [
    { values: [0, 100, 50], color: '#ff0000', label: 'Red' },
    { values: [120, 100, 50], color: '#00ff00', label: 'Green' },
    { values: [240, 100, 50], color: '#0000ff', label: 'Blue' },
    { values: [60, 100, 50], color: '#ffff00', label: 'Yellow' },
    { values: [180, 100, 50], color: '#00ffff', label: 'Cyan' },
    { values: [300, 100, 50], color: '#ff00ff', label: 'Magenta' },
  ],
  config: {
    mode: '2d',
    width: container2.clientWidth || 600,
    height: 400,
    backgroundColor: '#f8f8f8',
    showAxes: true,
    showLabels: true,
    showGrid: true,
    interactive: true,
  },
};

const visualizer2 = new ColorVisualizer(container2, {
  mode: '2d',
  width: container2.clientWidth || 600,
  height: 400,
  backgroundColor: '#f8f8f8',
  showAxes: true,
  showLabels: true,
  showGrid: true,
  interactive: true,
});

visualizer2.render(hsl2DPreset);

// Example 3: Custom Color Points Visualization
const customColorPoints: ColorPoint[] = [
  { values: [255, 0, 0], color: '#ff0000', label: 'Pure Red' },
  { values: [0, 255, 0], color: '#00ff00', label: 'Pure Green' },
  { values: [0, 0, 255], color: '#0000ff', label: 'Pure Blue' },
  { values: [255, 255, 0], color: '#ffff00', label: 'Yellow' },
  { values: [255, 0, 255], color: '#ff00ff', label: 'Magenta' },
  { values: [0, 255, 255], color: '#00ffff', label: 'Cyan' },
  { values: [128, 128, 128], color: '#808080', label: 'Gray' },
  { values: [255, 128, 0], color: '#ff8000', label: 'Orange' },
  { values: [128, 0, 255], color: '#8000ff', label: 'Purple' },
  { values: [0, 128, 255], color: '#0080ff', label: 'Sky Blue' },
];

const customPreset: PresetConfig = {
  name: 'Custom Color Points',
  colorSpace: RGB_COLOR_SPACE,
  shape: 'cube',
  size: {
    width: 400,
    height: 400,
  },
  points: customColorPoints,
  config: {
    mode: '2d',
    width: container3.clientWidth || 600,
    height: 400,
    backgroundColor: '#ffffff',
    showAxes: false,
    showLabels: false,
    showGrid: false,
    interactive: true,
  },
};

const visualizer3 = new ColorVisualizer(container3, {
  mode: '2d',
  width: container3.clientWidth || 600,
  height: 400,
  backgroundColor: '#ffffff',
  showAxes: false,
  showLabels: false,
  showGrid: false,
  interactive: true,
});

visualizer3.render(customPreset);

// Update visualizer3 with color points
visualizer3.update(customColorPoints);

// Make functions available globally for interactive demos
(window as any).updateColorPoints = (points: ColorPoint[]) => {
  visualizer3.update(points);
};

(window as any).addRandomColorPoint = () => {
  const randomPoint: ColorPoint = {
    values: [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ],
    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    label: `Random ${Math.floor(Math.random() * 1000)}`,
  };
  const newPoints = [...customColorPoints, randomPoint];
  visualizer3.update(newPoints);
};

// Handle window resize
window.addEventListener('resize', () => {
  visualizer1.handleResize();
  visualizer2.handleResize();
  visualizer3.handleResize();
});

console.log('2D Visualizer examples loaded!');
console.log('Try: addRandomColorPoint() to add a random color point');
