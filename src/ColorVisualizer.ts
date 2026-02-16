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

/** Fallback size when container has no layout (e.g. not yet visible). */
const DEFAULT_FALLBACK_WIDTH = 800;
const DEFAULT_FALLBACK_HEIGHT = 600;

/**
 * Resolve pixel dimensions: prefer explicit config, then container size, then fallback only if container is 0.
 * Pass undefined for width/height in config to mean "use container size" (e.g. parent controls via CSS).
 */
function resolveSize(
  container: HTMLElement,
  configWidth: number | undefined,
  configHeight: number | undefined
): { width: number; height: number } {
  const cw = container.clientWidth || 0;
  const ch = container.clientHeight || 0;
  const width =
    configWidth !== undefined && configWidth !== null
      ? configWidth
      : cw > 0
        ? cw
        : DEFAULT_FALLBACK_WIDTH;
  const height =
    configHeight !== undefined && configHeight !== null
      ? configHeight
      : ch > 0
        ? ch
        : DEFAULT_FALLBACK_HEIGHT;
  return { width, height };
}

export class ColorVisualizer {
  private renderer: IRenderer | null = null;
  private container: HTMLElement | null = null;
  private config: VisualizerConfig;
  public currentPreset: PresetConfig | null = null;
  private resizeObserver: ResizeObserver | null = null;

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

    const { width, height } = resolveSize(
      this.container,
      config?.width,
      config?.height
    );

    // Merge default config with user config. Omit width/height in config to use container size (parent-controlled).
    this.config = {
      mode: '3d',
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
      width,
      height,
    };

    // Initialize renderer based on mode
    this.initializeRenderer();

    // When parent controls size (e.g. CSS width/height 100%), keep canvas in sync
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }
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
   * Update HSL hue wheel configuration (2D only)
   */
  updateHSLHueWheel(config: Partial<import('./components/types').HSLHueWheelConfig>): void {
    if (this.renderer && 'updateHSLHueWheel' in this.renderer) {
      (this.renderer as any).updateHSLHueWheel(config);
    }
  }

  /**
   * Update HSV hue wheel configuration (2D only)
   */
  updateHSVHueWheel(config: Partial<import('./components/types').HSVHueWheelConfig>): void {
    if (this.renderer && 'updateHSVHueWheel' in this.renderer) {
      (this.renderer as any).updateHSVHueWheel(config);
    }
  }

  /**
   * Update CMYK grid configuration (2D only)
   */
  updateCMYKGrid(config: Partial<import('./components/types').CMYKGridConfig>): void {
    if (this.renderer && 'updateCMYKGrid' in this.renderer) {
      (this.renderer as any).updateCMYKGrid(config);
    }
  }

  /**
   * Destroy the visualizer and clean up resources
   */
  destroy(): void {
    this.disposeResizeObserver();
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
   * Handle container or window resize. Uses container dimensions when available so parent-controlled sizing (e.g. 100%) stays in sync.
   * Re-renders the current preset after resize so 2D content (diagrams, wheels) is laid out for the new size.
   */
  handleResize(): void {
    if (this.container && this.renderer) {
      const width = this.container.clientWidth || this.config.width || DEFAULT_FALLBACK_WIDTH;
      const height = this.container.clientHeight || this.config.height || DEFAULT_FALLBACK_HEIGHT;
      this.resize(width, height);
      if (this.currentPreset) {
        this.render(this.currentPreset);
      }
    }
  }

  private disposeResizeObserver(): void {
    if (this.resizeObserver && this.container) {
      this.resizeObserver.unobserve(this.container);
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
