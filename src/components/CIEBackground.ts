/**
 * CIE Background Component
 * Renders the CIE visible spectrum background with configurable brightness and boundary
 */

import Konva from 'konva';
import { getSpectralLocus, xyToRgb } from '../utils/colorConversion';
import { CIEBackgroundConfig, CoordinateSystem } from './types';

export class CIEBackground {
  private layer: Konva.Layer | null = null;
  private config: CIEBackgroundConfig = {};
  private coordinateSystem: CoordinateSystem | null = null;
  private size: { width: number; height: number; depth?: number } | null = null;

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    coordinateSystem: CoordinateSystem,
    size: { width: number; height: number; depth?: number },
    config: CIEBackgroundConfig = {}
  ): void {
    this.layer = layer;
    this.coordinateSystem = coordinateSystem;
    this.size = size;
    this.config = {
      show: true,
      brightness: 1.0,
      opacity: 0.85,
      boundaryLine: false, // Default: no boundary line
      ...config,
    };
  }

  /**
   * Render the CIE background
   */
  render(): void {
    if (!this.layer || !this.coordinateSystem || !this.size) {
      throw new Error('CIEBackground not initialized. Call init() first.');
    }

    if (this.config.show === false) {
      return;
    }

    const { offsetX, offsetY, scale, maxX, maxY } = this.coordinateSystem;
    const brightness = this.config.brightness ?? 1.0;
    const opacity = this.config.opacity ?? 0.85;
    const spectralLocus = getSpectralLocus();

    // Create a very high-resolution grid for ultra-smooth edges
    const gridSize = 200;
    const stepX = (maxX * scale) / gridSize;
    const stepY = (maxY * scale) / gridSize;

    // Draw color grid for visible spectrum - only inside the spectral locus
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * stepX;
        const y = j * stepY;
        // Convert screen coordinates back to xy space
        const xyX = (x / (maxX * scale)) * maxX;
        const xyY = (y / (maxY * scale)) * maxY;

        // Check if point is inside the spectral locus boundary
        if (this.isPointInsideSpectralLocus([xyX, xyY], spectralLocus)) {
          // Convert xy to RGB for display with configured brightness
          const [r, g, b] = xyToRgb(xyX, xyY, brightness);
          const color = `rgb(${r}, ${g}, ${b})`;

          const rect = new Konva.Rect({
            x: offsetX + x,
            y: offsetY - y,
            width: stepX + 0.1, // Minimal overlap for seamless coverage
            height: stepY + 0.1,
            fill: color,
            opacity: opacity,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
          });
          this.layer.add(rect);
        }
      }
    }

    // Draw boundary line if configured
    if (this.config.boundaryLine !== false && this.config.boundaryLine !== undefined) {
      this.renderBoundaryLine(spectralLocus);
    }
  }

  /**
   * Render the spectral locus boundary line
   */
  private renderBoundaryLine(spectralLocus: Array<[number, number]>): void {
    if (!this.layer || !this.coordinateSystem) return;

    const { offsetX, offsetY, scale } = this.coordinateSystem;
    const lineConfig = this.config.boundaryLine as any;

    const points: number[] = [];
    spectralLocus.forEach(([x, y]) => {
      const screenX = offsetX + x * scale;
      const screenY = offsetY - y * scale;
      points.push(screenX, screenY);
    });
    // Close the curve
    points.push(points[0], points[1]);

    const line = new Konva.Line({
      points: points,
      stroke: lineConfig.color || '#000',
      strokeWidth: lineConfig.weight || 1,
      dash: lineConfig.dash || this.getDashPattern(lineConfig.style || 'solid'),
      lineCap: 'round',
      lineJoin: 'round',
      closed: false,
    });

    this.layer.add(line);
  }

  /**
   * Get dash pattern for line style
   */
  private getDashPattern(style: string): number[] | undefined {
    switch (style) {
      case 'dashed':
        return [10, 5];
      case 'dotted':
        return [2, 5];
      case 'solid':
      default:
        return undefined;
    }
  }

  /**
   * Check if a point is inside the spectral locus (CIE visible spectrum)
   * Uses ray casting algorithm
   */
  private isPointInsideSpectralLocus(
    point: [number, number],
    spectralLocus: Array<[number, number]>
  ): boolean {
    const [px, py] = point;
    let inside = false;

    // Ray casting algorithm
    for (let i = 0, j = spectralLocus.length - 1; i < spectralLocus.length; j = i++) {
      const [xi, yi] = spectralLocus[i];
      const [xj, yj] = spectralLocus[j];

      const intersect =
        yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CIEBackgroundConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CIEBackgroundConfig {
    return { ...this.config };
  }
}
