/**
 * HSL 2D Visualization Example
 * Shows Hue vs Saturation at a fixed Lightness
 */

import { ColorVisualizer, HSL_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { hslToRgb } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

// Get container element
const container = document.getElementById('hsl-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

// Default lightness for the 2D visualization
let currentLightness = 50;

// Create a preset for HSL visualization (Hue vs Saturation)
const hslPreset: PresetConfig = {
  name: 'HSL Hue vs Saturation',
  colorSpace: HSL_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [0, 100, currentLightness], // HSL: Hue=0, Saturation=100%, Lightness=50%
      color: '#ff0000',
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
    custom: {
      projection: 'hue-saturation', // Project Hue (X) vs Saturation (Y)
      fixedLightness: currentLightness,
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
  interactive: true,
});

// Render the HSL diagram
visualizer.render(hslPreset);

// Initialize Color Channel Visualizer and sync with updatePoint
let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'HSL',
    initialValues: { h: 0, s: 100, l: 50 },
    showPreview: true,
    onCCVChange: (vals) => {
      const t0 = performance.now();
      const h = vals.h ?? 0;
      const s = vals.s ?? 100;
      const l = vals.l ?? 50;
      (window as any).updatePoint?.(h, s, l, `HSL(${h}, ${s}%, ${l}%)`);
      console.log(`[hsl-2d-demo] onCCVChange -> updatePoint: ${(performance.now() - t0).toFixed(2)}ms`);
    },
  });
} catch (_) {
  // CCV not available
}

// Make functions available globally for interactive demos
(window as any).updatePoint = (h: number, s: number, l: number, label?: string) => {
  const t0 = performance.now();
  console.warn('[hsl-2d-demo] updatePoint START → about to visualizer.render()');
  const [r, g, b] = hslToRgb(h, s, l);
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...hslPreset,
    points: [
      {
        values: [h, s, l],
        color: hexColor,
        label: label || `HSL(${h}, ${s}%, ${l}%)`,
      },
    ],
  };

  visualizer.render(newPreset);
  const t1 = performance.now();
  console.warn(`[hsl-2d-demo] updatePoint: visualizer.render() DONE in ${(t1 - t0).toFixed(0)}ms`);
  if (ccvInstance) ccvInstance.setValues({ h, s, l });
  console.log(`[hsl-2d-demo] updatePoint: setValues: ${(performance.now() - t1).toFixed(2)}ms, total: ${(performance.now() - t0).toFixed(2)}ms`);
};

(window as any).updateLightness = (l: number) => {
  currentLightness = l;
  hslPreset.config = {
    ...hslPreset.config,
    custom: {
      ...hslPreset.config?.custom,
      fixedLightness: l,
    },
  };
  visualizer.render(hslPreset);
};

// Handle window resize
window.addEventListener('resize', () => {
  visualizer.handleResize();
});

// Expose update functions for component controls
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

(window as any).updateHSLHueWheelFn = (config: any) => {
  visualizer.updateHSLHueWheel(config);
};
