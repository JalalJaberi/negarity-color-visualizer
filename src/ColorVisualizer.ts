/**
 * Main ColorVisualizer class
 */

import { Renderer3D } from './renderers/Renderer3D';
import { Renderer2D } from './renderers/Renderer2D';
import { IRenderer } from './types';
import {
  VisualizerConfig,
  PresetConfig,
  ColorPoint,
} from './types';

export class ColorVisualizer {
  private renderer: IRenderer | null = null;
  private container: HTMLElement | null = null;
  private config: VisualizerConfig;
  public currentPreset: PresetConfig | null = null;

  constructor(container: HTMLElement | string, config?: Partial<VisualizerConfig>) {
    // Resolve container
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container element not found: ${container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = container;
    }

    // Merge default config with user config
    this.config = {
      mode: '3d',
      width: this.container.clientWidth || 800,
      height: this.container.clientHeight || 600,
      backgroundColor: '#f0f0f0',
      showAxes: true,
      showLabels: true,
      showGrid: true,
      interactive: true,
      animation: {
        enabled: false,
        speed: 0.01,
      },
      ...config,
    };

    // Initialize renderer based on mode
    this.initializeRenderer();
  }

  /**
   * Render a preset visualization
   */
  render(preset: PresetConfig): void {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }

    // Update renderer if mode changed
    if (preset.config?.mode && preset.config.mode !== this.config.mode) {
      this.config.mode = preset.config.mode;
      this.initializeRenderer();
    }

    this.currentPreset = preset;
    this.renderer.render(preset);
  }

  /**
   * Update visualization with new color points
   */
  update(points: ColorPoint[]): void {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }

    this.renderer.update(points);
  }

  /**
   * Resize the visualization
   */
  resize(width: number, height: number): void {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }

    this.config.width = width;
    this.config.height = height;
    this.renderer.resize(width, height);
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<VisualizerConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize if mode changed
    if (config.mode && config.mode !== this.config.mode) {
      this.initializeRenderer();
      // Re-render current preset if exists
      if (this.currentPreset) {
        this.render(this.currentPreset);
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): VisualizerConfig {
    return { ...this.config };
  }

  /**
   * Update CIE background configuration (2D only)
   */
  updateCIEBackground(config: Partial<import('./components/types').CIEBackgroundConfig>): void {
    if (this.renderer && 'updateCIEBackground' in this.renderer) {
      (this.renderer as any).updateCIEBackground(config);
    }
  }

  /**
   * Update axes configuration (2D only)
   */
  updateAxes(config: Partial<import('./components/types').AxesConfig>): void {
    if (this.renderer && 'updateAxes' in this.renderer) {
      (this.renderer as any).updateAxes(config);
    }
  }

  /**
   * Update marker configuration (2D only)
   */
  updateMarker(config: Partial<import('./components/types').MarkerConfig>): void {
    if (this.renderer && 'updateMarker' in this.renderer) {
      (this.renderer as any).updateMarker(config);
    }
  }

  /**
   * Destroy the visualizer and clean up resources
   */
  destroy(): void {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    this.container = null;
    this.currentPreset = null;
  }

  /**
   * Initialize the appropriate renderer based on mode
   */
  private initializeRenderer(): void {
    // Clean up existing renderer
    if (this.renderer) {
      this.renderer.destroy();
    }

    if (!this.container) {
      throw new Error('Container not set');
    }

    // Create new renderer based on mode
    if (this.config.mode === '3d') {
      this.renderer = new Renderer3D();
    } else {
      this.renderer = new Renderer2D();
    }

    // Initialize renderer
    this.renderer.init(this.container, this.config);
  }

  /**
   * Handle window resize
   */
  handleResize(): void {
    if (this.container && this.renderer) {
      const width = this.container.clientWidth || this.config.width || 800;
      const height = this.container.clientHeight || this.config.height || 600;
      this.resize(width, height);
    }
  }
}
