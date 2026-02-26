/**
 * HSV 2D Visualization Example
 * Shows Hue wheel
 */

import { ColorVisualizer, HSV_COLOR_SPACE, ColorChannelVisualizer } from '../index';

if (typeof window !== 'undefined') {
  (window as any).CIRCLE_IMAGE_URL = new URL('../assets/images/circle.png', import.meta.url).href;
}
import { PresetConfig } from '../types';
import { hsvToRgb } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

const container = document.getElementById('hsv-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const hsvPreset: PresetConfig = {
  name: 'HSV Hue Wheel',
  colorSpace: HSV_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [0, 100, 100], // HSV: Hue=0, Saturation=100%, Value=100%
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

visualizer.render(hsvPreset);

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'HSV',
    initialValues: { h: 0, s: 100, v: 100 },
    showPreview: true,
    onCCVChange: (vals) => {
      const h = vals.h ?? 0;
      const s = vals.s ?? 100;
      const v = vals.v ?? 100;
      (window as any).updatePoint?.(h, s, v, `HSV(${h}, ${s}%, ${v}%)`);
    },
  });
} catch (_) {}

(window as any).updatePoint = (h: number, s: number, v: number, label?: string) => {
  const [r, g, b] = hsvToRgb(h, s, v);
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...hsvPreset,
    points: [
      {
        values: [h, s, v],
        color: hexColor,
        label: label || `HSV(${h}, ${s}%, ${v}%)`,
      },
    ],
  };

  visualizer.render(newPreset);
  if (ccvInstance) ccvInstance.setValues({ h, s, v });
};

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

(window as any).updateHSVHueWheelFn = (config: any) => {
  visualizer.updateHSVHueWheel(config);
};
