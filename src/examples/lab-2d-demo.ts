/**
 * Lab 2D Visualization Example
 * Shows a* vs b* plane
 */

import { ColorVisualizer, LAB_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { labToRgb, rgbToLab, rgbToXyz, xyzToLab } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

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

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'LAB',
    initialValues: { L: 50, a: 0, b: 0 },
    showPreview: true,
    onCCVChange: (vals) => {
      const L = vals.L ?? 50;
      const a = vals.a ?? 0;
      const b = vals.b ?? 0;
      (window as any).updatePoint?.(L, a, b, `Lab(${L.toFixed(1)}, ${a.toFixed(1)}, ${b.toFixed(1)})`);
    },
  });
} catch (_) {}

(window as any).updatePoint = (l: number, a: number, b: number, label?: string) => {
  // Convert Lab to RGB for display
  const [r, g, b_rgb] = labToRgb(l, a, b);
  const hexColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b_rgb).toString(16).padStart(2, '0')}`;

  const newPreset: PresetConfig = {
    ...labPreset,
    points: [
      {
        values: [l, a, b],
        color: hexColor,
        label: label || `Lab(${l.toFixed(1)}, ${a.toFixed(1)}, ${b.toFixed(1)})`,
      },
    ],
  };

  visualizer.render(newPreset);
  if (ccvInstance) ccvInstance.setValues({ L: l, a, b });
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

// Expose rgbToLab for HTML use
(window as any).rgbToLab = (r: number, g: number, b: number) => {
  return rgbToLab(r, g, b);
};

(window as any).rgbToXyz = (r: number, g: number, b: number) => {
  return rgbToXyz(r, g, b);
};

(window as any).xyzToLab = (x: number, y: number, z: number) => {
  return xyzToLab(x, y, z);
};
