/**
 * Helper to mount the Color Channel Visualizer in an example and sync with the main visualizer's updatePoint.
 * Call this from *-2d-demo.ts after creating the main visualizer.
 */

import { ColorChannelVisualizer } from '../color-channel-visualizer';

export type UpdatePointFn = (...args: number[]) => void;

export interface InitCCVOptions {
  containerId: string;
  colorSpace: string;
  initialValues: Record<string, number>;
  /** When CCV values change, call this with the values in the order expected by updatePoint (e.g. h, s, l for HSL) */
  onCCVChange: (values: Record<string, number>) => void;
  showPreview?: boolean;
}

/**
 * Initialize the Color Channel Visualizer in the given container and return the instance.
 * The demo should wire onCCVChange to call its updatePoint with the correct argument order,
 * and when the demo's updatePoint is called from elsewhere (e.g. presets), call ccv.setValues with the same values.
 */
export function initColorChannelVisualizer(options: InitCCVOptions): ReturnType<typeof ColorChannelVisualizer> | null {
  const container = document.getElementById(options.containerId);
  if (!container) return null;

  const ccv = ColorChannelVisualizer(container, {
    colorSpace: options.colorSpace,
    values: options.initialValues,
    showPreview: options.showPreview !== false,
    layout: 'vertical',
    onChange: options.onCCVChange,
  });

  return ccv;
}
