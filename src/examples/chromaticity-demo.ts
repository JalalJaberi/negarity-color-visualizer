/**
 * CIE xy Chromaticity Diagram Example
 * Shows RGB gamut and a point in the color space
 */

import { ColorVisualizer, RGB_COLOR_SPACE } from '../index';
import { PresetConfig } from '../types';

// Get container element
const container = document.getElementById('chromaticity-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

// Create a preset for RGB chromaticity visualization
const chromaticityPreset: PresetConfig = {
  name: 'RGB Chromaticity',
  colorSpace: RGB_COLOR_SPACE,
  shape: 'cube',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  // Add a point to visualize (example: pure red)
  points: [
    {
      values: [255, 0, 0], // RGB values - Pure Red
      color: '#ff0000', // Hex color for the point
      label: 'Pure Red',
    },
  ],
  config: {
    mode: '2d',
    width: container.clientWidth || 800,
    height: 600,
    backgroundColor: '#ffffff',
    showAxes: true,
    showLabels: true,
    showGrid: false,
    interactive: true,
    custom: {
      showChromaticity: true, // Enable chromaticity diagram
    },
  },
};

// Create visualizer
const visualizer = new ColorVisualizer(container, {
  mode: '2d',
  width: container.clientWidth || 800,
  height: 600,
  backgroundColor: '#ffffff',
  showAxes: true,
  showLabels: true,
  showGrid: false,
  interactive: true,
});

// Render the chromaticity diagram
visualizer.render(chromaticityPreset);

// Make functions available globally for interactive demos
(window as any).updatePoint = (r: number, g: number, b: number, label?: string) => {
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...chromaticityPreset,
    points: [
      {
        values: [r, g, b],
        color: hexColor,
        label: label || `RGB(${r}, ${g}, ${b})`,
      },
    ],
  };

  visualizer.render(newPreset);
};

// Handle window resize
window.addEventListener('resize', () => {
  visualizer.handleResize();
});

// Expose update functions for component controls
// The HTML will define window.updateCIEBackground to read from DOM and call this
// We only expose updateCIEBackgroundFn, not updateCIEBackground, to avoid conflicts
(window as any).updateCIEBackgroundFn = (config: any) => {
  console.log('examples updateCIEBackgroundFn', config);
  if (!config) {
    console.error('updateCIEBackgroundFn called without config!');
    return;
  }
  visualizer.updateCIEBackground(config);
};

(window as any).updateAxesFn = (config: any) => {
  visualizer.updateAxes(config);
};

(window as any).updateMarkerFn = (config: any) => {
  visualizer.updateMarker(config);
};

console.log('Chromaticity diagram loaded!');
console.log('Try: updatePoint(255, 0, 0, "Pure Red")');
