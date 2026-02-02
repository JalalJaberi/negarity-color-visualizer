/**
 * Axes Component
 * Renders X and Y axes with configurable lines and labels
 */

import Konva from 'konva';
import { AxesConfig, CoordinateSystem } from './types';

export class Axes {
  private layer: Konva.Layer | null = null;
  private config: AxesConfig = {};
  private coordinateSystem: CoordinateSystem | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the component
   */
  init(
    layer: Konva.Layer,
    coordinateSystem: CoordinateSystem,
    config: AxesConfig = {}
  ): void {
    this.layer = layer;
    this.coordinateSystem = coordinateSystem;
    // If already initialized, preserve existing config and only update layer/coordinate system
    // Otherwise, set defaults
    if (!this.initialized) {
      this.config = {
        show: true,
        showLines: true,
        showLabels: true,
        lineStyle: {
          weight: 1,
          color: '#999',
          style: 'dashed',
          dash: [5, 5],
        },
        labelStyle: {
          fontSize: 14,
          color: '#666',
          fontFamily: 'Arial',
        },
        ...config,
      };
      this.initialized = true;
    }
    // If config is provided and component is already initialized, merge it
    if (this.initialized && Object.keys(config).length > 0) {
      const existingLineStyle = this.config.lineStyle || {};
      const existingLabelStyle = this.config.labelStyle || {};
      this.config = {
        ...this.config,
        ...config,
        // Deep merge for nested objects
        lineStyle: config.lineStyle ? {
          ...existingLineStyle,
          ...config.lineStyle,
        } : existingLineStyle,
        labelStyle: config.labelStyle ? {
          ...existingLabelStyle,
          ...config.labelStyle,
        } : existingLabelStyle,
      };
    }
  }

  /**
   * Render the axes
   */
  render(): void {
    if (!this.layer || !this.coordinateSystem) {
      throw new Error('Axes not initialized. Call init() first.');
    }

    if (this.config.show === false) {
      return;
    }

    const { offsetX, offsetY, scale, maxX, maxY } = this.coordinateSystem;

    // Draw X axis if enabled
    if (this.config.showLines !== false) {
      this.renderXAxis(offsetX, offsetY, maxX, scale);
    }

    // Draw Y axis if enabled
    if (this.config.showLines !== false) {
      this.renderYAxis(offsetX, offsetY, maxY, scale);
    }

    // Draw labels if enabled
    if (this.config.showLabels !== false) {
      this.renderLabels(offsetX, offsetY, maxX, maxY, scale);
    }
  }

  /**
   * Render X axis line
   */
  private renderXAxis(
    offsetX: number,
    offsetY: number,
    maxX: number,
    scale: number
  ): void {
    if (!this.layer || !this.config.lineStyle) return;

    const lineStyle = this.config.lineStyle;
    const dash = lineStyle.dash || this.getDashPattern(lineStyle.style || 'solid');

    const xAxis = new Konva.Line({
      points: [offsetX, offsetY, offsetX + maxX * scale, offsetY],
      stroke: lineStyle.color || '#999',
      strokeWidth: lineStyle.weight || 1,
      dash: dash,
    });

    this.layer.add(xAxis);
  }

  /**
   * Render Y axis line
   */
  private renderYAxis(
    offsetX: number,
    offsetY: number,
    maxY: number,
    scale: number
  ): void {
    if (!this.layer || !this.config.lineStyle) return;

    const lineStyle = this.config.lineStyle;
    const dash = lineStyle.dash || this.getDashPattern(lineStyle.style || 'solid');

    const yAxis = new Konva.Line({
      points: [offsetX, offsetY, offsetX, offsetY - maxY * scale],
      stroke: lineStyle.color || '#999',
      strokeWidth: lineStyle.weight || 1,
      dash: dash,
    });

    this.layer.add(yAxis);
  }

  /**
   * Render axis labels
   */
  private renderLabels(
    offsetX: number,
    offsetY: number,
    maxX: number,
    maxY: number,
    scale: number
  ): void {
    if (!this.layer || !this.config.labelStyle) return;

    const labelStyle = this.config.labelStyle;

    // X axis label
    const xLabel = new Konva.Text({
      x: offsetX + maxX * scale - 20,
      y: offsetY + 20,
      text: 'x',
      fontSize: labelStyle.fontSize || 14,
      fill: labelStyle.color || '#666',
      fontFamily: labelStyle.fontFamily || 'Arial',
    });
    this.layer.add(xLabel);

    // Y axis label
    const yLabel = new Konva.Text({
      x: offsetX - 25,
      y: offsetY - maxY * scale + 15,
      text: 'y',
      fontSize: labelStyle.fontSize || 14,
      fill: labelStyle.color || '#666',
      fontFamily: labelStyle.fontFamily || 'Arial',
    });
    this.layer.add(yLabel);
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
   * Update configuration
   */
  updateConfig(config: Partial<AxesConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AxesConfig {
    return { ...this.config };
  }
}
