/**
 * 2D Renderer using Konva
 */

import Konva from 'konva';
import { IRenderer } from '../types';
import { VisualizerConfig, PresetConfig, ColorPoint } from '../types';

export class Renderer2D implements IRenderer {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private config: VisualizerConfig | null = null;

  init(container: HTMLElement, config: VisualizerConfig): void {
    this.config = config;

    const width = config.width || container.clientWidth || 800;
    const height = config.height || container.clientHeight || 600;

    // Create stage
    this.stage = new Konva.Stage({
      container: container as HTMLDivElement,
      width: width,
      height: height,
    });

    // Create layer
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Set background using a background rect
    if (config.backgroundColor) {
      const bgRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: config.backgroundColor,
      });
      this.layer.add(bgRect);
      this.layer.draw();
    }
  }

  render(preset: PresetConfig): void {
    if (!this.stage || !this.layer) {
      throw new Error('Renderer not initialized. Call init() first.');
    }

    // Clear layer
    this.layer.destroyChildren();

    const size = preset.size || { width: 400, height: 400 };
    const centerX = this.stage.width() / 2;
    const centerY = this.stage.height() / 2;

    // Render based on color space and shape
    if (preset.colorSpace.name === 'RGB' && preset.shape === 'cube') {
      this.renderRGBCube2D(centerX, centerY, size);
    } else {
      // Generic 2D visualization
      this.renderGeneric2D(centerX, centerY, size);
    }

    this.layer.draw();
  }

  update(points: ColorPoint[]): void {
    // Update visualization with new color points
    if (this.layer && points.length > 0) {
      // Clear and redraw with new points
      this.layer.destroyChildren();

      points.forEach((point, index) => {
        const circle = new Konva.Circle({
          x: (index % 10) * 50 + 50,
          y: Math.floor(index / 10) * 50 + 50,
          radius: 20,
          fill: point.color,
          stroke: '#333',
          strokeWidth: 2,
        });
        this.layer?.add(circle);
      });

      this.layer?.draw();
    }
  }

  resize(width: number, height: number): void {
    if (this.stage) {
      this.stage.width(width);
      this.stage.height(height);
      this.stage.draw();
    }
  }

  destroy(): void {
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
    }
  }

  private renderRGBCube2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number }
  ): void {
    if (!this.layer) return;

    // Render RGB cube as a 2D projection (front face)
    const cubeSize = Math.min(size.width, size.height) / 2;

    // Create gradient for RGB visualization
    const gradient = new Konva.Rect({
      x: centerX - cubeSize,
      y: centerY - cubeSize,
      width: cubeSize * 2,
      height: cubeSize * 2,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: cubeSize * 2, y: cubeSize * 2 },
      fillLinearGradientColorStops: [
        0,
        '#000000',
        0.33,
        '#ff0000',
        0.66,
        '#00ff00',
        1,
        '#ffffff',
      ],
      stroke: '#333',
      strokeWidth: 2,
    });

    this.layer.add(gradient);

    // Add axes labels if enabled
    if (this.config?.showLabels !== false) {
      const redLabel = new Konva.Text({
        x: centerX + cubeSize + 10,
        y: centerY - 10,
        text: 'Red',
        fontSize: 14,
        fill: '#ff0000',
      });
      this.layer.add(redLabel);

      const greenLabel = new Konva.Text({
        x: centerX - 30,
        y: centerY + cubeSize + 20,
        text: 'Green',
        fontSize: 14,
        fill: '#00ff00',
      });
      this.layer.add(greenLabel);
    }
  }

  private renderGeneric2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number }
  ): void {
    if (!this.layer) return;

    // Generic 2D visualization
    const radius = Math.min(size.width, size.height) / 4;

    const circle = new Konva.Circle({
      x: centerX,
      y: centerY,
      radius: radius,
      fill: '#888888',
      stroke: '#333',
      strokeWidth: 2,
    });

    this.layer.add(circle);
  }
}
