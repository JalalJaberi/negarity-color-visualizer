/**
 * CMYK Grid Component
 * Renders a 2D grid showing Cyan vs Magenta colors with fixed Yellow and Key values
 */

import Konva from 'konva';
import { CMYKGridConfig } from './types';
import { cmykToRgb } from '../utils/colorConversion';

export class CMYKGrid {
  private layer: Konva.Layer | null = null;
  private config: CMYKGridConfig = {};
  private x: number = 0;
  private y: number = 0;
  private width: number = 0;
  private height: number = 0;
  private initialized: boolean = false;
  private shapes: Konva.Rect[] = [];

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    x: number,
    y: number,
    width: number,
    height: number,
    config: CMYKGridConfig = {}
  ): void {
    this.layer = layer;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // If already initialized, preserve existing config and only update geometry
    // Otherwise, set defaults
    if (!this.initialized) {
      this.config = {
        show: true,
        yellow: 0,
        key: 0,
        gridSize: 5, // Step size for grid (5% increments)
        showGrid: true,
        gridStyle: {
          weight: 0,
          color: '#000',
          style: 'solid',
        },
        ...config,
      };
      this.initialized = true;
    } else {
      // Already initialized - preserve existing config and merge with new config
      // Only update if config is provided and has keys
      if (config && typeof config === 'object' && Object.keys(config).length > 0) {
        this.config = {
          ...this.config,
          ...config,
        };
      }
    }
  }

  /**
   * Render the CMYK grid
   */
  render(): void {
    if (!this.layer) {
      throw new Error('CMYKGrid not initialized. Call init() first.');
    }

    // Clear existing shapes (only if they still exist in the layer)
    this.shapes.forEach(shape => {
      if (shape.getLayer()) {
        shape.destroy();
      }
    });
    this.shapes = [];

    if (this.config.show === false) {
      this.layer.draw();
      return;
    }

    const yellow = this.config.yellow ?? 0;
    const key = this.config.key ?? 0;
    const gridSize = this.config.gridSize ?? 5;
    const showGrid = this.config.showGrid ?? true;

    // Create grid showing C vs M colors
    for (let c = 0; c <= 100; c += gridSize) {
      for (let m = 0; m <= 100; m += gridSize) {
        const [r, g, b] = cmykToRgb(c, m, yellow, key);
        const color = `rgb(${r}, ${g}, ${b})`;
        
        const rect = new Konva.Rect({
          x: this.x + (c / 100) * this.width,
          y: this.y + (m / 100) * this.height,
          width: (gridSize / 100) * this.width,
          height: (gridSize / 100) * this.height,
          fill: color,
          stroke: showGrid ? (this.config.gridStyle?.color || '#000') : undefined,
          strokeWidth: showGrid ? (this.config.gridStyle?.weight || 0) : 0,
          dash: showGrid && this.config.gridStyle?.style === 'dashed' ? [5, 3] : 
                showGrid && this.config.gridStyle?.style === 'dotted' ? [1, 3] : undefined,
        });
        
        this.layer.add(rect);
        this.shapes.push(rect);
      }
    }
    
    this.layer.draw();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CMYKGridConfig>): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CMYKGridConfig {
    return { ...this.config };
  }

  /**
   * Convert CMYK coordinates to screen coordinates
   */
  cmykToScreenCoords(c: number, m: number): [number, number] {
    // C (0-100) -> X position
    // M (0-100) -> Y position
    const screenX = this.x + (c / 100) * this.width;
    const screenY = this.y + (m / 100) * this.height;
    
    return [screenX, screenY];
  }

  /**
   * Get geometry for coordinate system
   */
  getGeometry(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
