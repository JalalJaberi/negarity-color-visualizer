/**
 * CMYK 2D Visualization Example
 * Shows C vs M plot
 */

import { ColorVisualizer, CMYK_COLOR_SPACE, ColorChannelVisualizer } from '../index';
import { PresetConfig } from '../types';
import { cmykToRgb } from '../utils/colorConversion';
import { initColorChannelVisualizer } from './initColorChannelVisualizer';

const container = document.getElementById('cmyk-visualizer');
if (!container) {
  throw new Error('Container element not found');
}

const cmykPreset: PresetConfig = {
  name: 'CMYK C vs M',
  colorSpace: CMYK_COLOR_SPACE,
  shape: 'custom',
  size: {
    width: container.clientWidth || 800,
    height: 600,
  },
  points: [
    {
      values: [100, 0, 0, 0], // CMYK: C=100%, M=0%, Y=0%, K=0%
      color: '#00ffff',
      label: 'Cyan',
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

visualizer.render(cmykPreset);

let ccvInstance: ReturnType<typeof ColorChannelVisualizer> | null = null;
try {
  ccvInstance = initColorChannelVisualizer({
    containerId: 'ccv-container',
    colorSpace: 'CMYK',
    initialValues: { c: 100, m: 0, y: 0, k: 0 },
    showPreview: true,
    onCCVChange: (vals) => {
      const c = vals.c ?? 0;
      const m = vals.m ?? 0;
      const y = vals.y ?? 0;
      const k = vals.k ?? 0;
      (window as any).updatePoint?.(c, m, y, k, `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`);
    },
  });
} catch (_) {}

(window as any).updatePoint = (c: number, m: number, y: number, k: number, label?: string) => {
  const [r, g, b] = cmykToRgb(c, m, y, k);
  const hexColor = `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, '0'))
    .join('')}`;

  const newPreset: PresetConfig = {
    ...cmykPreset,
    points: [
      {
        values: [c, m, y, k],
        color: hexColor,
        label: label || `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`,
      },
    ],
  };

  visualizer.render(newPreset);
  if (ccvInstance) ccvInstance.setValues({ c, m, y, k });
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
