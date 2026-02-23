/**
 * Color Channel Visualizer – main component.
 */

import { getColorSpace, getValuesForSpace } from './channelConfig';
import { createChannelSlider, computeDependentGradient } from './createSlider';
import { valuesToHex } from './valuesToHex';

export interface ColorChannelVisualizerOptions {
  colorSpace?: string;
  values?: Record<string, number>;
  onChange?: (values: Record<string, number>) => void;
  onChannelChange?: (channelKey: string, value: number) => void;
  showPreview?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export interface ColorChannelVisualizerInstance {
  getElement(): HTMLElement;
  getColorSpace(): string;
  getValues(): Record<string, number>;
  setValues(newValues: Record<string, number>): void;
  destroy(): void;
}

export function ColorChannelVisualizer(
  container: HTMLElement,
  options: ColorChannelVisualizerOptions = {}
): ColorChannelVisualizerInstance {
  const opts = options;
  const colorSpaceKey = opts.colorSpace || 'RGB';
  const space = getColorSpace(colorSpaceKey);
  let values = getValuesForSpace(colorSpaceKey, opts.values);

  const showPreview = opts.showPreview !== false;
  const layout = opts.layout || 'vertical';
  const onChange = opts.onChange;
  const onChannelChange = opts.onChannelChange;

  const root = document.createElement('div');
  root.className =
    'negarity-ccv negarity-ccv--layout-' + layout + (showPreview ? ' negarity-ccv--with-preview' : '');

  let previewEl: HTMLElement | null = null;
  if (showPreview) {
    previewEl = document.createElement('div');
    previewEl.className = 'negarity-ccv__preview';
    previewEl.setAttribute('aria-label', 'Current color');
    previewEl.style.backgroundColor = valuesToHex(colorSpaceKey, values);
    root.appendChild(previewEl);
  }

  const slidersWrap = document.createElement('div');
  slidersWrap.className = 'negarity-ccv__sliders';
  root.appendChild(slidersWrap);

  const sliders: ReturnType<typeof createChannelSlider>[] = [];
  const idPrefix = 'negarity-ccv-' + colorSpaceKey + '-';

  let rafId: number | null = null;
  let pendingChangedKey: string | null = null;
  function flush() {
    rafId = null;
    const changedKey = pendingChangedKey;
    pendingChangedKey = null;
    notifyChange();
    sliders.forEach((s, i) => {
      const ch = space.channels[i];
      const dependsOnChanged = ch.dependsOn?.includes(changedKey ?? '');
      if (dependsOnChanged) {
        s.updateGradient();
      }
    });
  }
  function scheduleFlush(key: string) {
    pendingChangedKey = key;
    if (rafId == null) rafId = requestAnimationFrame(flush);
  }

  function getDependentGradient(channelKey: string, currentValues: Record<string, number>) {
    const ch = space.channels.find((c) => c.key === channelKey);
    return computeDependentGradient(colorSpaceKey, channelKey, currentValues, ch) ?? null;
  }

  function notifyChange() {
    onChange?.({ ...values });
    if (previewEl) previewEl.style.backgroundColor = valuesToHex(colorSpaceKey, values);
  }

    space.channels.forEach((channelDef) => {
    const key = channelDef.key;
    const currentValue = values[key] ?? channelDef.min;
    const slider = createChannelSlider(slidersWrap, channelDef, {
      value: currentValue,
      values,
      colorSpace: colorSpaceKey,
      sliderId: idPrefix + key,
      getDependentGradient,
      onChange(newVal: number) {
        values[key] = newVal;
        onChannelChange?.(key, newVal);
        scheduleFlush(key);
      },
    });
    sliders.push(slider);
  });

  container.appendChild(root);

  return {
    getElement() {
      return root;
    },
    getColorSpace() {
      return colorSpaceKey;
    },
    getValues() {
      return { ...values };
    },
    setValues(newValues: Record<string, number>) {
      if (!newValues || typeof newValues !== 'object') return;
      space.channels.forEach((ch, i) => {
        if (newValues[ch.key] !== undefined) {
          const v = Number(newValues[ch.key]);
          values[ch.key] = v;
          sliders[i].setValue(v);
        }
      });
      // Refresh all slider track gradients (e.g. Lab a*/b*, YCbCr Cb/Cr) so they reflect the new color
      sliders.forEach((s) => s.updateGradient());
      if (previewEl) previewEl.style.backgroundColor = valuesToHex(colorSpaceKey, values);
      // Do not call notifyChange() here: setValues is used when the parent syncs state back
      // (e.g. after updatePoint). Calling onChange would re-invoke updatePoint and cause a loop.
    },
    destroy() {
      sliders.forEach((s) => s.destroy());
      root.remove();
    },
  };
}

export default ColorChannelVisualizer;
