/**
 * HSV Hue Wheel Component
 * Renders a circular hue wheel with configurable saturation and value
 */

import Konva from 'konva';
import { HSVHueWheelConfig } from './types';
import { hsvToRgb } from '../utils/colorConversion';

export class HSVHueWheel {
  private layer: Konva.Layer | null = null;
  private config: HSVHueWheelConfig = {};
  private centerX: number = 0;
  private centerY: number = 0;
  private radius: number = 0;
  private initialized: boolean = false;
  private shapes: Konva.Wedge[] = [];

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    centerX: number,
    centerY: number,
    radius: number,
    config: HSVHueWheelConfig = {}
  ): void {
    this.layer = layer;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    
    // If already initialized, preserve existing config and only update geometry
    // Otherwise, set defaults
    if (!this.initialized) {
      this.config = {
        show: true,
        saturation: 100,
        value: 100,
        innerRadius: 0, // 0 = complete circle, no hole
        showDividers: false, // No dividing lines
        dividerStyle: {
          weight: 1,
          color: '#333',
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
   * Render the HSV hue wheel
   */
  render(): void {
    if (!this.layer) {
      throw new Error('HSVHueWheel not initialized. Call init() first.');
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

    const saturation = this.config.saturation ?? 100;
    const value = this.config.value ?? 100;
    const innerRadius = (this.config.innerRadius ?? 0) * this.radius;
    const showDividers = this.config.showDividers ?? false;

    // Create hue wheel using multiple segments for smooth gradient
    const segmentAngle = 1; // 1 degree per segment for smooth appearance
    const numSegments = 360 / segmentAngle;

    for (let i = 0; i < numSegments; i++) {
      const hue = i * segmentAngle;
      const [r, g, b] = hsvToRgb(hue, saturation, value);
      const color = `rgb(${r}, ${g}, ${b})`;
      
      const wedge = new Konva.Wedge({
        x: this.centerX,
        y: this.centerY,
        radius: this.radius,
        angle: segmentAngle,
        rotation: hue - 90, // Start from top (0° = red at top)
        fill: color,
        stroke: showDividers ? (this.config.dividerStyle?.color || '#333') : undefined,
        strokeWidth: showDividers ? (this.config.dividerStyle?.weight || 1) : 0,
        innerRadius: innerRadius, // 0 = complete circle, no hole
      });
      
      this.layer.add(wedge);
      this.shapes.push(wedge);
    }
    
    this.layer.draw();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HSVHueWheelConfig>): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): HSVHueWheelConfig {
    return { ...this.config };
  }

  /**
   * Convert HSV coordinates to screen coordinates (polar to cartesian)
   */
  hsvToScreenCoords(hue: number, saturation: number): [number, number] {
    // Convert HSV to polar coordinates
    // Hue (0-360) -> angle
    // Saturation (0-100) -> radius (0 to max radius)
    const angle = ((hue - 90) * Math.PI) / 180; // -90 to start from top
    const r = (saturation / 100) * this.radius;
    
    const x = this.centerX + r * Math.cos(angle);
    const y = this.centerY + r * Math.sin(angle);
    
    return [x, y];
  }

  /**
   * Get center and radius for coordinate system
   */
  getGeometry(): { centerX: number; centerY: number; radius: number } {
    return {
      centerX: this.centerX,
      centerY: this.centerY,
      radius: this.radius,
    };
  }
}
