/**
 * LCh 2D Visualization Example
 * Shows CIE chromaticity diagram (same as Lab/XYZ)
 */

import { ColorVisualizer, LCH_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { lchToLab, labToRgb, rgbToLab, rgbToXyz, xyzToLab } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

const container = document.getElementById('lch-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const lchPreset: PresetConfig = {
  name: 'LCh Chromaticity',
  colorSpace: LCH_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [50, 0, 0], // LCh: L*=50, C*=0, h*=0 (neutral gray)
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

visualizer.render(lchPreset);

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'LCH',
    initialValues: { L: 50, C: 0, h: 0 },
    showPreview: true,
    onCCVChange: (vals) => {
      const L = vals.L ?? 50;
      const C = vals.C ?? 0;
      const h = vals.h ?? 0;
      (window as any).updatePoint?.(L, C, h, `LCh(${L.toFixed(1)}, ${C.toFixed(1)}, ${h.toFixed(1)}°)`);
    },
  });
} catch (_) {}

(window as any).updatePoint = (l: number, c: number, h: number, label?: string) => {
  // Convert LCh to Lab, then to RGB for display
  const [l_lab, a, b] = lchToLab(l, c, h);
  const [r, g, b_rgb] = labToRgb(l_lab, a, b);
  const hexColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b_rgb).toString(16).padStart(2, '0')}`;

  const newPreset: PresetConfig = {
    ...lchPreset,
    points: [
      {
        values: [l, c, h],
        color: hexColor,
        label: label || `LCh(${l.toFixed(1)}, ${c.toFixed(1)}, ${h.toFixed(1)}°)`,
      },
    ],
  };

  visualizer.render(newPreset);
  if (ccvInstance) ccvInstance.setValues({ L: l, C: c, h });
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
