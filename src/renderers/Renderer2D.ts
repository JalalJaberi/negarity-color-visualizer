/**
 * 2D Renderer using Konva
 */

import Konva from 'konva';
import { IRenderer } from '../types';
import { VisualizerConfig, PresetConfig, ColorPoint } from '../types';
import {
  rgbToXy,
  getRgbGamutVertices,
} from '../utils/colorConversion';
import { CIEBackground, Axes, Marker, CoordinateSystem } from '../components';

export class Renderer2D implements IRenderer {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private config: VisualizerConfig | null = null;
  private cieBackground: CIEBackground | null = null;
  private axes: Axes | null = null;
  private marker: Marker | null = null;
  private currentPreset: PresetConfig | null = null;

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

    // Store current preset for re-rendering
    this.currentPreset = preset;

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

    // Create coordinate system
    const coordinateSystem: CoordinateSystem = {
      offsetX,
      offsetY,
      scale,
      maxX,
      maxY,
    };

    // Get RGB gamut triangle vertices
    const vertices = getRgbGamutVertices();

    // Initialize and render CIE background component
    // Reuse existing instance if config was updated, otherwise create new
    if (!this.cieBackground) {
      this.cieBackground = new CIEBackground();
      // First time initialization - use defaults
      this.cieBackground.init(this.layer, coordinateSystem, size, {});
    } else {
      // Component already exists - just update layer/coordinate system if needed
      // and preserve the existing config (which may have been updated)
      this.cieBackground.init(this.layer, coordinateSystem, size, {});
    }
    this.cieBackground.render();

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

    // Initialize and render axes component
    // Reuse existing instance if config was updated, otherwise create new
    if (!this.axes) {
      this.axes = new Axes();
    }
    // Get existing config (which may have been updated) and pass it to init
    // The component's init() will merge it with defaults
    const existingAxesConfig = this.axes.getConfig();
    // Merge with initial defaults if config is empty
    const axesConfigToUse = Object.keys(existingAxesConfig).length > 0 
      ? existingAxesConfig 
      : {
          show: this.config?.showAxes !== false,
          showLines: true,
          showLabels: this.config?.showLabels !== false,
        };
    this.axes.init(this.layer, coordinateSystem, axesConfigToUse);
    this.axes.render();

    // Initialize and render marker component
    // Reuse existing instance if config was updated, otherwise create new
    if (!this.marker) {
      this.marker = new Marker();
    }
    // Get existing config (which may have been updated) and pass it to init
    // The component's init() will merge it with defaults
    const existingMarkerConfig = this.marker.getConfig();
    this.marker.init(this.layer, coordinateSystem, existingMarkerConfig);

    // Plot the points if provided
    if (preset.points && preset.points.length > 0) {
      preset.points.forEach((point) => {
        if (point.values.length >= 3) {
          const [r, g, b] = point.values;
          const [x, y] = rgbToXy(r, g, b);
          this.marker!.render(point, [x, y]);
        }
      });
    }
  }

  /**
   * Update CIE background configuration and re-render
   */
  updateCIEBackground(config: Partial<import('../components/types').CIEBackgroundConfig>): void {
    if (!this.cieBackground) {
      this.cieBackground = new CIEBackground();
    }
    // Update the config
    this.cieBackground.updateConfig(config);
    // Re-render the current preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }

  /**
   * Update axes configuration and re-render
   */
  updateAxes(config: Partial<import('../components/types').AxesConfig>): void {
    if (!this.axes) {
      this.axes = new Axes();
    }
    this.axes.updateConfig(config);
    // Re-render the current preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }

  /**
   * Update marker configuration and re-render
   */
  updateMarker(config: Partial<import('../components/types').MarkerConfig>): void {
    if (!this.marker) {
      this.marker = new Marker();
    }
    this.marker.updateConfig(config);
    // Re-render the current preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }
}
