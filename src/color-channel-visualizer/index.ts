/**
 * Color Channel Visualizer – public API
 */

import './color-channel-visualizer.css';

export { ColorChannelVisualizer, type ColorChannelVisualizerOptions, type ColorChannelVisualizerInstance } from './ColorChannelVisualizer';
export { COLOR_SPACES, CHANNEL_TYPES, getColorSpace, getValuesForSpace } from './channelConfig';
export type { ChannelDef, ColorSpaceDef } from './channelConfig';
export { valuesToHex, rgbToHex } from './valuesToHex';
export { createChannelSlider, computeDependentGradient } from './createSlider';
export type { SliderOptions, SliderInstance } from './createSlider';
