/**
 * HSL Hue Wheel Component
 * Renders a circular hue wheel with configurable saturation and lightness
 * Supports two algorithms: 'wedges' (default) = pie segments, 'conic' = smooth canvas conic gradient
 */

import Konva from 'konva';
import { HSLHueWheelConfig } from './types';
import { hslToRgb } from '../utils/colorConversion';
import { getDefaultCircleImageUrl } from '../utils/assetUrls';

export class HSLHueWheel {
  private layer: Konva.Layer | null = null;
  private config: HSLHueWheelConfig = {};
  private centerX: number = 0;
  private centerY: number = 0;
  private radius: number = 0;
  private initialized: boolean = false;
  private shapes: Konva.Node[] = [];

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
        segmentCount: 360, // Quality: number of hue segments (wedges only)
        algorithm: 'wedges', // 'wedges' | 'conic'
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
   * Render the HSL hue wheel
   */
  render(): void {
    if (!this.layer) {
      throw new Error('HSLHueWheel not initialized. Call init() first.');
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
    const lightness = this.config.lightness ?? 50;
    const innerRadius = (this.config.innerRadius ?? 0) * this.radius;
    const showDividers = this.config.showDividers ?? false;
    const algorithm = this.config.algorithm ?? 'wedges';

    const imageUrl = this.config.imageUrl || getDefaultCircleImageUrl();
    if (algorithm === 'image' && imageUrl && this.renderImage(innerRadius, imageUrl)) {
      this.layer.draw();
      return;
    }

    if (algorithm === 'conic' && this.renderConicGradient(saturation, lightness, innerRadius)) {
      this.layer.draw();
      return;
    }

    // Wedges algorithm (default)
    const segmentCount = Math.min(720, Math.max(36, this.config.segmentCount ?? 360));
    const segmentAngle = 360 / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
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
      this.shapes.push(wedge);
    }
    
    this.layer.draw();
  }

  /**
   * Render using pre-rendered circle/hue wheel image
   * Applies lightness (0-100): L=0 black, L=50 normal, L=100 white
   * Returns true if image was used
   */
  private renderImage(_innerRadius: number, imageUrl: string): boolean {
    const cx = this.centerX;
    const cy = this.centerY;
    const outerR = this.radius;
    const lightness = this.config.lightness ?? 50;
    // Map HSL lightness 0-100 to Konva Brighten -1..1: L=0→-1, L=50→0, L=100→1
    const brightness = Math.max(-1, Math.min(1, (lightness - 50) / 50));

    const img = new Image();
    img.onload = () => {
      const w = outerR * 2;
      const h = outerR * 2;
      const konvaImage = new Konva.Image({
        x: cx - outerR,
        y: cy - outerR,
        image: img,
        width: w,
        height: h,
      });
      konvaImage.cache();
      konvaImage.filters([Konva.Filters.Brighten]);
      konvaImage.brightness(brightness);
      this.layer!.add(konvaImage);
      konvaImage.moveToBottom();
      this.shapes.push(konvaImage);
      this.layer!.draw();
    };
    img.src = imageUrl;
    return true;
  }

  /**
   * Render using canvas conic gradient (smooth, CSS-like quality)
   * Returns true if conic gradient was used, false if falling back to wedges
   */
  private renderConicGradient(saturation: number, lightness: number, innerRadius: number): boolean {
    const cx = this.centerX;
    const cy = this.centerY;
    const outerR = this.radius;
    const d = outerR * 2;

    // Use Konva context so drawing respects shape transform and doesn't block markers
    const localCx = outerR;
    const localCy = outerR;
    const shape = new Konva.Shape({
      x: cx - outerR,
      y: cy - outerR,
      width: d,
      height: d,
      listening: false,
      sceneFunc: (context) => {
        const ctx = (context as any)._context || (context as any).getContext?.() || context;
        if (!ctx || typeof (ctx as any).createConicGradient !== 'function') {
          return;
        }
        const createConic = (ctx as any).createConicGradient.bind(ctx);
        const gradient = createConic(-Math.PI / 2, localCx, localCy);
        const stops = 36;
        for (let i = 0; i <= stops; i++) {
          const hue = (i / stops) * 360;
          const [r, g, b] = hslToRgb(hue, saturation, lightness);
          gradient.addColorStop(i / stops, `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(localCx, localCy, outerR, 0, 2 * Math.PI);
        if (innerRadius > 0) {
          ctx.arc(localCx, localCy, innerRadius, 2 * Math.PI, 0, true);
        }
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      },
    });

    this.layer!.add(shape);
    this.shapes.push(shape);
    return true;
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
