/**
 * Type definitions for 2D chromaticity diagram components
 */

/**
 * Line style configuration
 */
export interface LineStyle {
  weight?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  dash?: number[];
}

/**
 * CIE Background configuration
 */
export interface CIEBackgroundConfig {
  show?: boolean;
  brightness?: number; // 0-1, controls Y luminance value
  opacity?: number; // 0-1, controls rectangle opacity
  boundaryLine?: LineStyle | false; // false to hide boundary line
}

/**
 * Axes configuration
 */
export interface AxesConfig {
  show?: boolean;
  showLines?: boolean;
  showLabels?: boolean;
  lineStyle?: LineStyle;
  labelStyle?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
  };
}

/**
 * Marker configuration
 */
export interface MarkerConfig {
  show?: boolean;
  shape?: 'circle' | 'square' | 'triangle' | 'diamond';
  size?: number;
  border?: LineStyle | false; // false to hide border
  showLabel?: boolean;
  labelStyle?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    offsetX?: number;
    offsetY?: number;
  };
}

/**
 * Coordinate system configuration
 */
export interface CoordinateSystem {
  offsetX: number;
  offsetY: number;
  scale: number;
  maxX: number;
  maxY: number;
}

/**
 * HSL Hue Wheel configuration
 */
export interface HSLHueWheelConfig {
  show?: boolean;
  saturation?: number; // 0-100, default 100
  lightness?: number; // 0-100, default 50
  innerRadius?: number; // 0-1, relative to outer radius, 0 = complete circle
  showDividers?: boolean; // Show lines between segments
  dividerStyle?: LineStyle;
}

/**
 * HSV Hue Wheel configuration
 */
export interface HSVHueWheelConfig {
  show?: boolean;
  saturation?: number; // 0-100, default 100
  value?: number; // 0-100, default 100
  innerRadius?: number; // 0-1, relative to outer radius, 0 = complete circle
  showDividers?: boolean; // Show lines between segments
  dividerStyle?: LineStyle;
}
