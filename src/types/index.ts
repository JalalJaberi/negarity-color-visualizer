/**
 * Type definitions for Negarity Color Visualizer
 */

/**
 * Rendering mode
 */
export type RenderMode = '2d' | '3d';

/**
 * Color space definition
 */
export interface ColorSpace {
  name: string;
  axes: ColorAxis[];
  bounds?: {
    min: number[];
    max: number[];
  };
}

/**
 * Color axis definition
 */
export interface ColorAxis {
  name: string;
  label: string;
  min: number;
  max: number;
  unit?: string;
}

/**
 * Color point in a color space
 */
export interface ColorPoint {
  values: number[];
  color: string; // Hex color
  label?: string;
}

/**
 * Visualization configuration
 */
export interface VisualizerConfig {
  mode: RenderMode;
  width?: number;
  height?: number;
  backgroundColor?: string;
  showAxes?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  animation?: {
    enabled: boolean;
    speed?: number;
  };
  custom?: Record<string, unknown>;
}

/**
 * Preset configuration
 */
export interface PresetConfig {
  name: string;
  colorSpace: ColorSpace;
  shape?: 'cube' | 'sphere' | 'cylinder' | 'custom';
  size?: {
    width: number;
    height: number;
    depth?: number;
  };
  points?: ColorPoint[];
  config?: Partial<VisualizerConfig>;
}

/**
 * Renderer interface
 */
export interface IRenderer {
  init(container: HTMLElement, config: VisualizerConfig): void;
  render(preset: PresetConfig): void;
  update(points: ColorPoint[]): void;
  destroy(): void;
  resize(width: number, height: number): void;
}
