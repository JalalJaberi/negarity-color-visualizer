/**
 * HSL Hue Wheel Component
 * Renders a circular hue wheel with configurable saturation and lightness
 */

import Konva from 'konva';
import { HSLHueWheelConfig } from './types';
import { hslToRgb } from '../utils/colorConversion';

export class HSLHueWheel {
  private layer: Konva.Layer | null = null;
  private config: HSLHueWheelConfig = {};
  private centerX: number = 0;
  private centerY: number = 0;
  private radius: number = 0;
  private initialized: boolean = false;

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    centerX: number,
    centerY: number,
    radius: number,
    config: HSLHueWheelConfig = {}
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
        lightness: 50,
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
      if (Object.keys(config).length > 0) {
        this.config = {
          ...this.config,
          ...config,
        };
      }
    }
  }

  /**
   * Render the HSL hue wheel
   */
  render(): void {
    if (!this.layer) {
      throw new Error('HSLHueWheel not initialized. Call init() first.');
    }

    if (this.config.show === false) {
      return;
    }

    const saturation = this.config.saturation ?? 100;
    const lightness = this.config.lightness ?? 50;
    const innerRadius = (this.config.innerRadius ?? 0) * this.radius;
    const showDividers = this.config.showDividers ?? false;

    // Create hue wheel using multiple segments for smooth gradient
    const segmentAngle = 1; // 1 degree per segment for smooth appearance
    const numSegments = 360 / segmentAngle;

    for (let i = 0; i < numSegments; i++) {
      const hue = i * segmentAngle;
      const [r, g, b] = hslToRgb(hue, saturation, lightness);
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
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HSLHueWheelConfig>): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): HSLHueWheelConfig {
    return { ...this.config };
  }

  /**
   * Convert HSL coordinates to screen coordinates (polar to cartesian)
   */
  hslToScreenCoords(hue: number, saturation: number): [number, number] {
    // Convert HSL to polar coordinates
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
