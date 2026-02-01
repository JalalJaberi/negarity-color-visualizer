/**
 * Demo/Example usage of Negarity Color Visualizer
 */

import { ColorVisualizer, RGB_CUBE_PRESET } from '../index';

const container = document.getElementById('visualizer');
if (!container) {
  throw new Error('Container element not found');
}

let visualizer = new ColorVisualizer(container, {
  mode: '3d',
  width: container.clientWidth,
  height: 600,
  interactive: true,
  showAxes: true,
  showLabels: true,
  showGrid: true,
});

// Render RGB cube by default
visualizer.render(RGB_CUBE_PRESET);

// Make functions available globally
(window as any).renderRGBCube = () => {
  visualizer.setConfig({ mode: '3d' });
  visualizer.render(RGB_CUBE_PRESET);
};

(window as any).renderRGB2D = () => {
  visualizer.setConfig({ mode: '2d' });
  visualizer.render(RGB_CUBE_PRESET);
};

(window as any).toggleAnimation = () => {
  const config = visualizer.getConfig();
  visualizer.setConfig({
    animation: {
      enabled: !config.animation?.enabled,
      speed: 0.01,
    },
  });
  if (visualizer.currentPreset) {
    visualizer.render(visualizer.currentPreset);
  }
};

// Handle window resize
window.addEventListener('resize', () => {
  visualizer.handleResize();
});
