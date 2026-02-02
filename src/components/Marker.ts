/**
 * Marker Component
 * Renders color point markers with configurable shape, border, and label
 */

import Konva from 'konva';
import { MarkerConfig, CoordinateSystem } from './types';
import { ColorPoint } from '../types';

export class Marker {
  private layer: Konva.Layer | null = null;
  private config: MarkerConfig = {};
  private coordinateSystem: CoordinateSystem | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    coordinateSystem: CoordinateSystem,
    config: MarkerConfig = {}
  ): void {
    this.layer = layer;
    this.coordinateSystem = coordinateSystem;
    // If already initialized, preserve existing config and only update layer/coordinate system
    // Otherwise, set defaults
    if (!this.initialized) {
      this.config = {
        show: true,
        shape: 'circle',
        size: 6,
        border: {
          weight: 2,
          color: '#000',
          style: 'solid',
        },
        showLabel: false,
        labelStyle: {
          fontSize: 12,
          color: '#000',
          fontFamily: 'Arial',
          offsetX: 8,
          offsetY: -8,
        },
        ...config,
      };
      this.initialized = true;
    }
    // If config is provided and component is already initialized, merge it
    if (this.initialized && Object.keys(config).length > 0) {
      const existingLabelStyle = this.config.labelStyle || {};
      this.config = {
        ...this.config,
        ...config,
        // Deep merge for nested objects
        border: config.border !== undefined ? config.border : this.config.border,
        labelStyle: config.labelStyle ? {
          ...existingLabelStyle,
          ...config.labelStyle,
        } : existingLabelStyle,
      };
    }
  }

  /**
   * Render a single marker
   */
  render(point: ColorPoint, xyCoords: [number, number]): void {
    if (!this.layer || !this.coordinateSystem) {
      throw new Error('Marker not initialized. Call init() first.');
    }

    if (this.config.show === false) {
      return;
    }

    const { offsetX, offsetY, scale } = this.coordinateSystem;
    const [x, y] = xyCoords;

    const screenX = offsetX + x * scale;
    const screenY = offsetY - y * scale;

    // Render the marker shape
    const shape = this.createShape(screenX, screenY, point.color);
    if (shape) {
      this.layer.add(shape);
    }

    // Render label if enabled
    if (this.config.showLabel && point.label) {
      this.renderLabel(screenX, screenY, point.label);
    }
  }

  /**
   * Render multiple markers
   */
  renderMultiple(points: ColorPoint[], xyCoordsArray: Array<[number, number]>): void {
    points.forEach((point, index) => {
      if (xyCoordsArray[index]) {
        this.render(point, xyCoordsArray[index]);
      }
    });
  }

  /**
   * Create the marker shape based on configuration
   */
  private createShape(x: number, y: number, fillColor: string): Konva.Shape | null {
    const size = this.config.size || 6;
    const border = this.config.border;

    let shape: Konva.Shape | null = null;

    switch (this.config.shape) {
      case 'circle':
        shape = new Konva.Circle({
          x: x,
          y: y,
          radius: size,
          fill: fillColor,
          stroke: border !== false ? border?.color || '#000' : undefined,
          strokeWidth: border !== false ? border?.weight || 2 : 0,
          dash: border !== false ? this.getDashPattern(border?.style || 'solid') : undefined,
        });
        break;

      case 'square':
        shape = new Konva.Rect({
          x: x - size,
          y: y - size,
          width: size * 2,
          height: size * 2,
          fill: fillColor,
          stroke: border !== false ? border?.color || '#000' : undefined,
          strokeWidth: border !== false ? border?.weight || 2 : 0,
          dash: border !== false ? this.getDashPattern(border?.style || 'solid') : undefined,
        });
        break;

      case 'triangle':
        shape = new Konva.RegularPolygon({
          x: x,
          y: y,
          sides: 3,
          radius: size,
          fill: fillColor,
          stroke: border !== false ? border?.color || '#000' : undefined,
          strokeWidth: border !== false ? border?.weight || 2 : 0,
          dash: border !== false ? this.getDashPattern(border?.style || 'solid') : undefined,
        });
        break;

      case 'diamond':
        shape = new Konva.RegularPolygon({
          x: x,
          y: y,
          sides: 4,
          radius: size,
          rotation: 45,
          fill: fillColor,
          stroke: border !== false ? border?.color || '#000' : undefined,
          strokeWidth: border !== false ? border?.weight || 2 : 0,
          dash: border !== false ? this.getDashPattern(border?.style || 'solid') : undefined,
        });
        break;

      default:
        return null;
    }

    return shape;
  }

  /**
   * Render the label for a marker
   */
  private renderLabel(x: number, y: number, text: string): void {
    if (!this.layer || !this.config.labelStyle) return;

    const labelStyle = this.config.labelStyle;

    const label = new Konva.Text({
      x: x + (labelStyle.offsetX || 8),
      y: y + (labelStyle.offsetY || -8),
      text: text,
      fontSize: labelStyle.fontSize || 12,
      fill: labelStyle.color || '#000',
      fontFamily: labelStyle.fontFamily || 'Arial',
    });

    this.layer.add(label);
  }

  /**
   * Get dash pattern for line style
   */
  private getDashPattern(style: string): number[] | undefined {
    switch (style) {
      case 'dashed':
        return [5, 3];
      case 'dotted':
        return [1, 3];
      case 'solid':
      default:
        return undefined;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MarkerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MarkerConfig {
    return { ...this.config };
  }
}
