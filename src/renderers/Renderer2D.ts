/**
 * 2D Renderer using Konva
 */

import Konva from 'konva';
import { IRenderer } from '../types';
import { VisualizerConfig, PresetConfig, ColorPoint } from '../types';
import {
  rgbToXy,
  getRgbGamutVertices,
  getCmykGamutVertices,
  ycbcrToRgb,
  cmykToRgb,
} from '../utils/colorConversion';
import { CIEBackground, Axes, Marker, HSLHueWheel, HSVHueWheel, CMYKGrid, CoordinateSystem } from '../components';

export class Renderer2D implements IRenderer {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private config: VisualizerConfig | null = null;
  private cieBackground: CIEBackground | null = null;
  private axes: Axes | null = null;
  private marker: Marker | null = null;
  private hslHueWheel: HSLHueWheel | null = null;
  private hsvHueWheel: HSVHueWheel | null = null;
  private cmykGrid: CMYKGrid | null = null;
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
      this.renderHSL2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'HSV') {
      this.renderHSV2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'CMYK') {
      this.renderCMYK2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'XYZ') {
      this.renderXYZ2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'LAB') {
      this.renderLab2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'LCh') {
      this.renderLCh2D(centerX, centerY, size, preset);
    } else if (preset.colorSpace.name === 'YCbCr') {
      this.renderYCbCr2D(centerX, centerY, size, preset);
    } else {
      // Generic 2D visualization
      this.renderGeneric2D(centerX, centerY, size);
    }

    // Render color points if provided
    if (preset.points && preset.points.length > 0) {
      // For HSL, HSV, and CMYK, use special rendering that positions markers correctly
      if (preset.colorSpace.name === 'HSL' && this.hslHueWheel) {
        this.renderHSLColorPoints(preset.points);
      } else if (preset.colorSpace.name === 'HSV' && this.hsvHueWheel) {
        this.renderHSVColorPoints(preset.points);
      } else if (preset.colorSpace.name === 'CMYK') {
        this.renderCMYKColorPoints(preset.points);
      } else {
        this.renderColorPoints(preset.points, centerX, centerY, size);
      }
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
    size: { width: number; height: number; depth?: number },
    preset: PresetConfig
  ): void {
    if (!this.layer) return;

    // Create HSL hue wheel component
    const radius = Math.min(size.width || 400, size.height || 400) / 2.5;
    
    // Get config from preset
    const wheelConfig = (preset.config?.custom?.hslHueWheel as any) || {};
    
    // Initialize or reuse existing hue wheel component
    if (!this.hslHueWheel) {
      this.hslHueWheel = new HSLHueWheel();
    }
    
    // Get default lightness from first point if available, otherwise use config or default
    let defaultLightness = wheelConfig.lightness ?? 50;
    if (preset.points && preset.points.length > 0 && preset.points[0].values.length >= 3) {
      defaultLightness = preset.points[0].values[2]; // L value from HSL
    }
    
    // Get existing config from component if it's already initialized, otherwise use preset config
    let mergedConfig: any = {};
    try {
      const existingConfig = this.hslHueWheel.getConfig();
      // Preserve existing config values, only override with preset config if explicitly provided
      mergedConfig = {
        saturation: wheelConfig.saturation !== undefined ? wheelConfig.saturation : (existingConfig.saturation ?? 100),
        lightness: defaultLightness,
        innerRadius: wheelConfig.innerRadius !== undefined ? wheelConfig.innerRadius : (existingConfig.innerRadius ?? 0), // 0 = complete circle, no hole
        showDividers: wheelConfig.showDividers !== undefined ? wheelConfig.showDividers : (existingConfig.showDividers ?? false), // No dividing lines
        show: wheelConfig.show !== undefined ? wheelConfig.show : (existingConfig.show !== undefined ? existingConfig.show : true),
        dividerStyle: wheelConfig.dividerStyle || existingConfig.dividerStyle,
      };
    } catch (e) {
      // Component not initialized yet, use preset config with defaults
      mergedConfig = {
        saturation: wheelConfig.saturation ?? 100,
        lightness: defaultLightness,
        innerRadius: wheelConfig.innerRadius ?? 0,
        showDividers: wheelConfig.showDividers ?? false,
        show: wheelConfig.show !== undefined ? wheelConfig.show : true,
        dividerStyle: wheelConfig.dividerStyle,
      };
    }
    
    this.hslHueWheel.init(
      this.layer,
      centerX,
      centerY,
      radius,
      mergedConfig
    );
    
    this.hslHueWheel.render();
  }

  /**
   * Render HSL color points on the hue wheel
   */
  private renderHSLColorPoints(points: ColorPoint[]): void {
    if (!this.layer || !this.hslHueWheel) return;

    // Initialize marker if needed
    if (!this.marker) {
      this.marker = new Marker();
    }

    const geometry = this.hslHueWheel.getGeometry();
    
    // Create a coordinate system for the marker
    // Use the actual radius as the scale, with center at (0, 0) in normalized coords
    // The coordinate system will translate normalized coords to screen coords
    const coordinateSystem: CoordinateSystem = {
      offsetX: geometry.centerX,
      offsetY: geometry.centerY,
      scale: geometry.radius,
      maxX: 1, // Normalized: -1 to 1 for X (full circle width)
      maxY: 1, // Normalized: -1 to 1 for Y (full circle height)
    };
    
    this.marker.init(this.layer, coordinateSystem, {});

    points.forEach((point) => {
      if (point.values.length >= 3) {
        const [h, s] = point.values; // HSL values: Hue (0-360), Saturation (0-100), Lightness (0-100)
        
        // Convert HSL to screen coordinates using the hue wheel's coordinate system
        const [screenX, screenY] = this.hslHueWheel!.hslToScreenCoords(h, s);
        
        // Convert screen coords to normalized coords for marker
        // Normalized coords are relative to center, with radius = 1
        const normalizedX = (screenX - geometry.centerX) / geometry.radius;
        const normalizedY = (geometry.centerY - screenY) / geometry.radius; // Invert Y for screen coords
        
        // Render the marker
        this.marker!.render(point, [normalizedX, normalizedY]);
      }
    });
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

  /**
   * Update HSL hue wheel configuration and re-render
   */
  updateHSLHueWheel(config: Partial<import('../components/types').HSLHueWheelConfig>): void {
    if (!this.hslHueWheel || !this.layer) {
      // If hue wheel doesn't exist or layer is not available, re-render the full preset
      if (this.currentPreset) {
        this.render(this.currentPreset);
      }
      return;
    }
    
    // Update the config - this will merge with existing config
    this.hslHueWheel.updateConfig(config);
    
    // Re-render just the hue wheel if it's already initialized
    try {
      const geometry = this.hslHueWheel.getGeometry();
      if (geometry.radius > 0) {
        // Re-render the hue wheel with updated config
        // The render() method will use the updated config from updateConfig()
        this.hslHueWheel.render();
        
        // Also re-render the color points if they exist
        if (this.currentPreset && this.currentPreset.points && this.currentPreset.points.length > 0) {
          this.renderHSLColorPoints(this.currentPreset.points);
        }
        return;
      }
    } catch (e) {
      // If there's an error, fall through to full re-render
    }
    
    // Fallback: re-render the full preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }

  /**
   * Update HSV hue wheel configuration and re-render
   */
  updateHSVHueWheel(config: Partial<import('../components/types').HSVHueWheelConfig>): void {
    if (!this.hsvHueWheel || !this.layer) {
      // If hue wheel doesn't exist or layer is not available, re-render the full preset
      if (this.currentPreset) {
        this.render(this.currentPreset);
      }
      return;
    }
    
    // Update the config - this will merge with existing config
    this.hsvHueWheel.updateConfig(config);
    
    // Re-render just the hue wheel if it's already initialized
    try {
      const geometry = this.hsvHueWheel.getGeometry();
      if (geometry.radius > 0) {
        // Re-render the hue wheel with updated config
        // The render() method will use the updated config from updateConfig()
        this.hsvHueWheel.render();
        
        // Also re-render the color points if they exist
        if (this.currentPreset && this.currentPreset.points && this.currentPreset.points.length > 0) {
          this.renderHSVColorPoints(this.currentPreset.points);
        }
        return;
      }
    } catch (e) {
      // If there's an error, fall through to full re-render
    }
    
    // Fallback: re-render the full preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }

  /**
   * Update CMYK grid configuration and re-render
   */
  updateCMYKGrid(config: Partial<import('../components/types').CMYKGridConfig>): void {
    if (!this.cmykGrid || !this.layer) {
      // If grid doesn't exist or layer is not available, re-render the full preset
      if (this.currentPreset) {
        this.render(this.currentPreset);
      }
      return;
    }
    
    // Update the config - this will merge with existing config
    this.cmykGrid.updateConfig(config);
    
    // Re-render just the grid if it's already initialized
    try {
      const geometry = this.cmykGrid.getGeometry();
      if (geometry.width > 0 && geometry.height > 0) {
        // Re-render the grid with updated config
        // The render() method will use the updated config from updateConfig()
        this.cmykGrid.render();
        
        // Also re-render the color points if they exist
        if (this.currentPreset && this.currentPreset.points && this.currentPreset.points.length > 0) {
          this.renderCMYKColorPoints(this.currentPreset.points);
        }
        return;
      }
    } catch (e) {
      // If there's an error, fall through to full re-render
    }
    
    // Fallback: re-render the full preset
    if (this.currentPreset) {
      this.render(this.currentPreset);
    }
  }

  // Stub methods for other color spaces - basic implementations
  private renderHSV2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number },
    preset: PresetConfig
  ): void {
    if (!this.layer) return;

    // Create HSV hue wheel component
    const radius = Math.min(size.width || 400, size.height || 400) / 2.5;
    
    // Get config from preset
    const wheelConfig = (preset.config?.custom?.hsvHueWheel as any) || {};
    
    // Initialize or reuse existing hue wheel component
    if (!this.hsvHueWheel) {
      this.hsvHueWheel = new HSVHueWheel();
    }
    
    // Get default value from first point if available, otherwise use config or default
    let defaultValue = wheelConfig.value ?? 100;
    if (preset.points && preset.points.length > 0 && preset.points[0].values.length >= 3) {
      defaultValue = preset.points[0].values[2]; // V value from HSV
    }
    
    // Get existing config from component if it's already initialized, otherwise use preset config
    let mergedConfig: any = {};
    try {
      const existingConfig = this.hsvHueWheel.getConfig();
      // Preserve existing config values, only override with preset config if explicitly provided
      mergedConfig = {
        saturation: wheelConfig.saturation !== undefined ? wheelConfig.saturation : (existingConfig.saturation ?? 100),
        value: defaultValue,
        innerRadius: wheelConfig.innerRadius !== undefined ? wheelConfig.innerRadius : (existingConfig.innerRadius ?? 0), // 0 = complete circle, no hole
        showDividers: wheelConfig.showDividers !== undefined ? wheelConfig.showDividers : (existingConfig.showDividers ?? false), // No dividing lines
        show: wheelConfig.show !== undefined ? wheelConfig.show : (existingConfig.show !== undefined ? existingConfig.show : true),
        dividerStyle: wheelConfig.dividerStyle || existingConfig.dividerStyle,
      };
    } catch (e) {
      // Component not initialized yet, use preset config with defaults
      mergedConfig = {
        saturation: wheelConfig.saturation ?? 100,
        value: defaultValue,
        innerRadius: wheelConfig.innerRadius ?? 0,
        showDividers: wheelConfig.showDividers ?? false,
        show: wheelConfig.show !== undefined ? wheelConfig.show : true,
        dividerStyle: wheelConfig.dividerStyle,
      };
    }
    
    // Only pass the merged config, don't merge again in init() if already initialized
    this.hsvHueWheel.init(
      this.layer,
      centerX,
      centerY,
      radius,
      mergedConfig
    );
    
    this.hsvHueWheel.render();
  }

  /**
   * Render HSV color points on the hue wheel
   */
  private renderHSVColorPoints(points: ColorPoint[]): void {
    if (!this.layer || !this.hsvHueWheel) return;

    // Initialize marker if needed
    if (!this.marker) {
      this.marker = new Marker();
    }

    const geometry = this.hsvHueWheel.getGeometry();
    
    // Create a coordinate system for the marker
    // Use the actual radius as the scale, with center at (0, 0) in normalized coords
    // The coordinate system will translate normalized coords to screen coords
    const coordinateSystem: CoordinateSystem = {
      offsetX: geometry.centerX,
      offsetY: geometry.centerY,
      scale: geometry.radius,
      maxX: 1, // Normalized: -1 to 1 for X (full circle width)
      maxY: 1, // Normalized: -1 to 1 for Y (full circle height)
    };
    
    this.marker.init(this.layer, coordinateSystem, {});

    points.forEach((point) => {
      if (point.values.length >= 3) {
        const [h, s] = point.values; // HSV values: Hue (0-360), Saturation (0-100), Value (0-100)
        
        // Convert HSV to screen coordinates using the hue wheel's coordinate system
        const [screenX, screenY] = this.hsvHueWheel!.hsvToScreenCoords(h, s);
        
        // Convert screen coords to normalized coords for marker
        // Normalized coords are relative to center, with radius = 1
        const normalizedX = (screenX - geometry.centerX) / geometry.radius;
        const normalizedY = (geometry.centerY - screenY) / geometry.radius; // Invert Y for screen coords
        
        // Render the marker
        this.marker!.render(point, [normalizedX, normalizedY]);
      }
    });
  }

  private renderCMYK2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number },
    _preset: PresetConfig
  ): void {
    if (!this.layer) return;

    // Use the same CIE chromaticity diagram as RGB
    // Calculate scale and offset for xy space (0-1) to screen coordinates
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

    // Get CMYK gamut triangle vertices
    const vertices = getCmykGamutVertices();

    // Convert xy coordinates to screen coordinates using the same scale
    const screenVertices = vertices.map(([x, y]) => [
      offsetX + x * scale,
      offsetY - y * scale, // Flip Y
    ]);

    // Draw the CMYK gamut quadrilateral with thin dotted line
    const quadrilateral = new Konva.Line({
      points: [
        screenVertices[0][0],
        screenVertices[0][1],
        screenVertices[1][0],
        screenVertices[1][1],
        screenVertices[2][0],
        screenVertices[2][1],
        screenVertices[3][0],
        screenVertices[3][1],
        screenVertices[0][0],
        screenVertices[0][1], // Close the quadrilateral
      ],
      stroke: '#333',
      strokeWidth: 1,
      dash: [5, 5],
      fill: 'rgba(200, 200, 200, 0.1)',
      closed: true,
    });
    this.layer.add(quadrilateral);

    // Draw vertex labels only (no black circles)
    // Labels match the vertex order: C -> CM -> M -> Y
    const vertexLabels = ['C', 'CM', 'M', 'Y'];
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
  }

  /**
   * Render CMYK color points on the CIE chromaticity diagram
   */
  private renderCMYKColorPoints(points: ColorPoint[]): void {
    if (!this.layer) return;

    // Initialize marker if needed
    if (!this.marker) {
      this.marker = new Marker();
    }

    // Use the same coordinate system as the CIE background
    const size = this.currentPreset?.size || { width: 400, height: 400 };
    const centerX = this.stage!.width() / 2;
    const centerY = this.stage!.height() / 2;
    const maxX = 0.8;
    const maxY = 0.9;
    const scale = Math.min(size.width / maxX, size.height / maxY) * 0.7;
    const offsetX = centerX - (maxX * scale) * 0.5;
    const offsetY = centerY + (maxY * scale) * 0.5;

    const coordinateSystem: CoordinateSystem = {
      offsetX,
      offsetY,
      scale,
      maxX,
      maxY,
    };
    
    this.marker.init(this.layer, coordinateSystem, {});

    points.forEach((point) => {
      if (point.values.length >= 4) {
        const [c, m, y, k] = point.values; // CMYK values: C (0-100), M (0-100), Y (0-100), K (0-100)
        
        // Convert CMYK to RGB
        const [r, g, b] = cmykToRgb(c, m, y, k);
        
        // Convert RGB to xy chromaticity coordinates
        const [x_chrom, y_chrom] = rgbToXy(r, g, b);
        
        // Render the marker at the xy coordinates
        this.marker!.render(point, [x_chrom, y_chrom]);
      }
    });
  }

  private renderXYZ2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number },
    preset: PresetConfig
  ): void {
    // Use existing RGB chromaticity rendering for XYZ
    this.renderRgbChromaticity(centerX, centerY, size, preset);
  }

  private renderLab2D(
    _centerX: number,
    _centerY: number,
    size: { width: number; height: number; depth?: number },
    _preset: PresetConfig
  ): void {
    if (!this.layer) return;
    // Render Lab a* vs b* plane - simplified version
    const centerX = this.stage!.width() / 2;
    const centerY = this.stage!.height() / 2;
    this.renderGeneric2D(centerX, centerY, size);
  }

  private renderLCh2D(
    _centerX: number,
    _centerY: number,
    size: { width: number; height: number; depth?: number },
    _preset: PresetConfig
  ): void {
    if (!this.layer) return;
    // Render LCh as polar: Chroma vs Hue - simplified version
    const centerX = this.stage!.width() / 2;
    const centerY = this.stage!.height() / 2;
    this.renderGeneric2D(centerX, centerY, size);
  }

  private renderYCbCr2D(
    centerX: number,
    centerY: number,
    size: { width: number; height: number; depth?: number },
    _preset: PresetConfig
  ): void {
    if (!this.layer) return;
    // Render YCbCr as Cb vs Cr plot
    const width = size.width || 400;
    const height = size.height || 400;
    // Create a grid showing Cb vs Cr colors
    const fixedY = 128; // Default luma
    for (let cb = 16; cb <= 240; cb += 10) {
      for (let cr = 16; cr <= 240; cr += 10) {
        const [r, g, b] = ycbcrToRgb(fixedY, cb, cr);
        const rect = new Konva.Rect({
          x: centerX - width / 2 + ((cb - 16) / 224) * width,
          y: centerY - height / 2 + ((cr - 16) / 224) * height,
          width: width / 22,
          height: height / 22,
          fill: `rgb(${r}, ${g}, ${b})`,
        });
        this.layer.add(rect);
      }
    }
  }
}
