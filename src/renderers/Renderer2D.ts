/**
 * 2D Renderer using Konva
 */

import Konva from 'konva';
import { IRenderer } from '../types';
import { VisualizerConfig, PresetConfig, ColorPoint } from '../types';
import {
  rgbToXy,
  getRgbGamutVertices,
  getSpectralLocus,
  xyToRgb,
} from '../utils/colorConversion';

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
      // Check if we should render CIE xy chromaticity diagram
      if (preset.config?.custom?.showChromaticity !== false) {
        this.renderRgbChromaticity(centerX, centerY, size, preset);
      } else {
        this.renderRGBCube2D(centerX, centerY, size);
      }
    } else if (preset.colorSpace.name === 'HSL') {
      this.renderHSL2D(centerX, centerY, size);
    } else {
      // Generic 2D visualization
      this.renderGeneric2D(centerX, centerY, size);
    }

    // Render color points if provided
    if (preset.points && preset.points.length > 0) {
      // this.renderColorPoints(preset.points, centerX, centerY, size);
    }

    this.layer.draw();
  }

  update(points: ColorPoint[]): void {
    // Update visualization with new color points
    if (this.layer && points.length > 0) {
      // Remove existing color point circles (keep background/axes if any)
      const existingCircles = this.layer.find('Circle');
      existingCircles.forEach((node) => {
        // Only remove circles that are color points (not part of axes/grid)
        if (node.getAttr('isColorPoint')) {
          node.destroy();
        }
      });

      // Add new color points
      this.renderColorPoints(points, this.stage!.width() / 2, this.stage!.height() / 2, {
        width: this.stage!.width(),
        height: this.stage!.height(),
      });

      this.layer.draw();
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

  private renderHSL2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number }
  ): void {
    if (!this.layer) return;

    // Create a circular hue wheel for HSL
    const radius = Math.min(size.width, size.height) / 2.5;
    
    // Create hue wheel using multiple segments
    for (let i = 0; i < 360; i += 5) {
      // Convert HSL to RGB for visualization
      const h = i / 360;
      const s = 1;
      const l = 0.5;
      const rgb = this.hslToRgb(h, s, l);
      const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      
      const wedge = new Konva.Wedge({
        x: centerX,
        y: centerY,
        radius: radius,
        angle: 5,
        rotation: i - 90, // Start from top
        fill: color,
        stroke: '#333',
        strokeWidth: 1,
      });
      
      this.layer.add(wedge);
    }

    // Add center circle for lightness variation
    const centerCircle = new Konva.Circle({
      x: centerX,
      y: centerY,
      radius: radius * 0.3,
      fill: '#ffffff',
      stroke: '#333',
      strokeWidth: 2,
    });
    this.layer.add(centerCircle);
  }

  private renderColorPoints(
    points: ColorPoint[],
    _centerX: number,
    _centerY: number,
    size: { width: number; height: number; depth?: number }
  ): void {
    if (!this.layer) return;

    const cols = Math.ceil(Math.sqrt(points.length));
    const spacing = Math.min(size.width, size.height) / (cols + 1);
    const radius = spacing * 0.3;

    points.forEach((point, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = (col + 1) * spacing;
      const y = (row + 1) * spacing;

      const circle = new Konva.Circle({
        x: x,
        y: y,
        radius: radius,
        fill: point.color,
        stroke: '#333',
        strokeWidth: 2,
        shadowBlur: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: 2 },
      });

      // Mark as color point for easy removal
      circle.setAttr('isColorPoint', true);

      if (this.layer) {
        this.layer.add(circle);

        // Add label if provided
        if (point.label && this.config?.showLabels !== false) {
          const label = new Konva.Text({
            x: x,
            y: y + radius + 15,
            text: point.label,
            fontSize: 12,
            fill: '#333',
            align: 'center',
            width: spacing,
          });
          label.setAttr('isColorPoint', true);
          this.layer.add(label);
        }
      }
    });
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Render RGB gamut in CIE xy chromaticity diagram
   */
  private renderRgbChromaticity(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number },
    preset: PresetConfig
  ): void {
    if (!this.layer) return;

    // Calculate scale and offset for xy space (0-1) to screen coordinates
    // xy space typically ranges from about 0 to 0.8 for x and 0 to 0.9 for y
    // We need to map xy coordinates (0-0.8 for x, 0-0.9 for y) to screen space
    const maxX = 0.8; // Maximum x value in xy space
    const maxY = 0.9; // Maximum y value in xy space
    const scale = Math.min(size.width / maxX, size.height / maxY) * 0.7; // Use 70% of available space
    const offsetX = centerX - (maxX * scale) * 0.5; // Center horizontally
    const offsetY = centerY + (maxY * scale) * 0.5; // Flip Y axis (xy has y increasing upward)

    // Get RGB gamut triangle vertices
    const vertices = getRgbGamutVertices();

    // Draw CIE visible spectrum background first
    this.renderVisibleSpectrum(offsetX, offsetY, scale, maxX, maxY);

    // Convert xy coordinates to screen coordinates using the same scale
    const screenVertices = vertices.map(([x, y]) => [
      offsetX + x * scale,
      offsetY - y * scale, // Flip Y
    ]);

    // Draw the RGB gamut triangle with thin dotted line
    const triangle = new Konva.Line({
      points: [
        screenVertices[0][0],
        screenVertices[0][1],
        screenVertices[1][0],
        screenVertices[1][1],
        screenVertices[2][0],
        screenVertices[2][1],
        screenVertices[0][0],
        screenVertices[0][1], // Close the triangle
      ],
      stroke: '#333',
      strokeWidth: 1,
      dash: [5, 5],
      fill: 'rgba(200, 200, 200, 0.1)',
      closed: true,
    });
    this.layer.add(triangle);

    // Draw vertex labels only (no black circles)
    const vertexLabels = ['R', 'G', 'B'];
    screenVertices.forEach(([x, y], index) => {
      if (this.config?.showLabels !== false) {
        const label = new Konva.Text({
          x: x + 8,
          y: y - 8,
          text: vertexLabels[index],
          fontSize: 14,
          fill: '#333',
          fontStyle: 'bold',
        });
        this.layer!.add(label);
      }
    });

    // White point (D65) removed per user request

    // Draw axes if enabled
    if (this.config?.showAxes !== false) {
      // X axis (horizontal)
      const xAxis = new Konva.Line({
        points: [offsetX, offsetY, offsetX + maxX * scale, offsetY],
        stroke: '#999',
        strokeWidth: 1,
        dash: [5, 5],
      });
      this.layer.add(xAxis);

      // Y axis (vertical)
      const yAxis = new Konva.Line({
        points: [offsetX, offsetY, offsetX, offsetY - maxY * scale],
        stroke: '#999',
        strokeWidth: 1,
        dash: [5, 5],
      });
      this.layer.add(yAxis);

      // Axis labels
      if (this.config?.showLabels !== false) {
        const xLabel = new Konva.Text({
          x: offsetX + maxX * scale - 20,
          y: offsetY + 20,
          text: 'x',
          fontSize: 14,
          fill: '#666',
        });
        this.layer.add(xLabel);

        const yLabel = new Konva.Text({
          x: offsetX - 25,
          y: offsetY - maxY * scale + 15,
          text: 'y',
          fontSize: 14,
          fill: '#666',
        });
        this.layer.add(yLabel);
      }
    }

    // Plot the point if provided (inside RGB triangle)
    if (preset.points && preset.points.length > 0) {
      preset.points.forEach((point) => {
        if (point.values.length >= 3) {
          const [r, g, b] = point.values;
          const [x, y] = rgbToXy(r, g, b);

          // Use the same scale and offset as above
          const screenX = offsetX + x * scale;
          const screenY = offsetY - y * scale;

          // Always show the point with black border
          const pointCircle = new Konva.Circle({
            x: screenX,
            y: screenY,
            radius: 6,
            fill: point.color,
            stroke: '#000',
            strokeWidth: 2,
          });
          this.layer!.add(pointCircle);
        }
      });
    }
  }

  /**
   * Render the visible spectrum (CIE color space) background
   */
  private renderVisibleSpectrum(
    offsetX: number,
    offsetY: number,
    scale: number,
    maxX: number,
    maxY: number
  ): void {
    if (!this.layer) return;

    const spectralLocus = getSpectralLocus();

    // Create a very high-resolution grid for ultra-smooth edges
    const gridSize = 200; // Very high resolution for smooth, anti-aliased edges
    const stepX = (maxX * scale) / gridSize;
    const stepY = (maxY * scale) / gridSize;

    // Draw color grid for visible spectrum - only inside the spectral locus
    // Use smaller rectangles with better anti-aliasing for ultra-smooth edges
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * stepX;
        const y = j * stepY;
        // Convert screen coordinates back to xy space
        const xyX = (x / (maxX * scale)) * maxX;
        const xyY = (y / (maxY * scale)) * maxY;

        // Check if point is inside the spectral locus boundary
        if (this.isPointInsideSpectralLocus([xyX, xyY], spectralLocus)) {
          // Convert xy to RGB for display with higher luminance for better color visibility
          const [r, g, b] = xyToRgb(xyX, xyY, 0.8); // Increased Y for brighter, more vibrant colors
          const color = `rgb(${r}, ${g}, ${b})`;

          const rect = new Konva.Rect({
            x: offsetX + x,
            y: offsetY - y,
            width: stepX + 0.1, // Minimal overlap for seamless coverage
            height: stepY + 0.1,
            fill: color,
            opacity: 0.6, // Semi-transparent to show RGB triangle on top
            perfectDrawEnabled: false, // Disable perfect drawing for better performance
            shadowForStrokeEnabled: false,
          });
          this.layer.add(rect);
        }
      }
    }

    // Spectral locus curve removed per user request - colors are enough
  }

  /**
   * Check if a point is inside the spectral locus (CIE visible spectrum)
   * Uses ray casting algorithm to determine if point is inside the closed curve
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

}
