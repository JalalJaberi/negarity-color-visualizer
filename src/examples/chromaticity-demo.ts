/**
 * CIE xy Chromaticity Diagram Example
 * Shows RGB gamut and a point in the color space
 */

import { ColorVisualizer, RGB_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

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
    showAxes: false,
    showLabels: true,
    showGrid: false,
    interactive: true,
    custom: {
      showChromaticity: true, // Enable chromaticity diagram
    },
  },
};

// Create visualizer
const visualizer = new ColorVisualizer(container, chromaticityPreset.config);

// Render the chromaticity diagram
visualizer.render(chromaticityPreset);

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'RGB',
    initialValues: { r: 255, g: 0, b: 0 },
    showPreview: true,
    onCCVChange: (vals) => {
      const t0 = performance.now();
      const r = vals.r ?? 0;
      const g = vals.g ?? 0;
      const b = vals.b ?? 0;
      (window as any).updatePoint?.(r, g, b, `RGB(${r}, ${g}, ${b})`);
      console.log(`[chromaticity-demo] onCCVChange -> updatePoint: ${(performance.now() - t0).toFixed(2)}ms`);
    },
  });
} catch (_) {}

// Make functions available globally for interactive demos
(window as any).updatePoint = (r: number, g: number, b: number, label?: string) => {
  const t0 = performance.now();
  console.warn('[chromaticity-demo] updatePoint START → about to visualizer.render()');
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
  const t1 = performance.now();
  console.warn(`[chromaticity-demo] updatePoint: visualizer.render() DONE in ${(t1 - t0).toFixed(0)}ms`);
  if (ccvInstance) ccvInstance.setValues({ r, g, b });
  console.log(`[chromaticity-demo] updatePoint: setValues: ${(performance.now() - t1).toFixed(2)}ms, total: ${(performance.now() - t0).toFixed(2)}ms`);
};

// Handle window resize
window.addEventListener('resize', () => {
  visualizer.handleResize();
});

// Expose update functions for component controls
// The HTML will define window.updateCIEBackground to read from DOM and call this
// We only expose updateCIEBackgroundFn, not updateCIEBackground, to avoid conflicts
(window as any).updateCIEBackgroundFn = (config: any) => {
  if (!config) {
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

