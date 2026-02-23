/**
 * XYZ 2D Visualization Example
 * Shows xy chromaticity diagram (same as RGB)
 */

import { ColorVisualizer, XYZ_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { xyzToRgb } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

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
      values: [24.0, 18.0, 3.0], // XYZ values
      color: '#ff0000', // Will be updated based on XYZ conversion
      label: 'Sample Point',
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

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'XYZ',
    initialValues: { x: 24.0, y: 18.0, z: 3.0 },
    showPreview: true,
    onCCVChange: (vals) => {
      const x = vals.x ?? 0;
      const y = vals.y ?? 0;
      const z = vals.z ?? 0;
      (window as any).updatePoint?.(x, y, z, `XYZ(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
    },
  });
} catch (_) {}

(window as any).updatePoint = (x: number, y: number, z: number, label?: string) => {
  // Convert XYZ to RGB for display
  const [r, g, b] = xyzToRgb(x, y, z);
  const hexColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;

  const newPreset: PresetConfig = {
    ...xyzPreset,
    points: [
      {
        values: [x, y, z],
        color: hexColor,
        label: label || `XYZ(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,
      },
    ],
  };

  visualizer.render(newPreset);
  if (ccvInstance) ccvInstance.setValues({ x, y, z });
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
