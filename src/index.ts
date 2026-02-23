/**
 * Negarity Color Visualizer
 * Main entry point
 */

export { ColorVisualizer } from './ColorVisualizer';
export { Renderer3D } from './renderers/Renderer3D';
export { Renderer2D } from './renderers/Renderer2D';
export * from './types';
export * from './presets';

// Re-export for convenience
export { RGB_CUBE_PRESET, RGB_COLOR_SPACE, HSL_COLOR_SPACE, LAB_COLOR_SPACE } from './presets';

// Color Channel Visualizer (sliders for each channel)
export {
  ColorChannelVisualizer,
  getColorSpace as getColorSpaceChannel,
  getValuesForSpace as getValuesForSpaceChannel,
  valuesToHex as valuesToHexChannel,
} from './color-channel-visualizer';
export type { ColorChannelVisualizerOptions, ColorChannelVisualizerInstance } from './color-channel-visualizer';
