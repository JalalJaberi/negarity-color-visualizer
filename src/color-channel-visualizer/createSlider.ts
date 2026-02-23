/**
 * Creates a single channel slider (linear, circular, or dependent).
 */

import { CHANNEL_TYPES } from './channelConfig';
import type { ChannelDef } from './channelConfig';
import { rgbToHex } from './valuesToHex';
import {
  hslToRgb,
  hsvToRgb,
  labToRgb,
  lchToLab,
  ycbcrToRgb,
} from '../utils/colorConversion';

export interface SliderOptions {
  value?: number;
  values?: Record<string, number>;
  colorSpace?: string;
  onChange?: (value: number) => void;
  getDependentGradient?: (channelKey: string, values: Record<string, number>) => { type: string; stops?: Array<{ pos: number; color: string }> } | null;
  sliderId?: string;
}

export interface SliderInstance {
  el: HTMLElement;
  value: number;
  setValue(v: number): void;
  updateGradient(): void;
  destroy(): void;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function formatValue(value: number, channel: ChannelDef): string {
  const unit = channel.unit || '';
  if (channel.max - channel.min > 50 && Number.isInteger(value)) return value + unit;
  return Math.round(value * 10) / 10 + unit;
}

export function createChannelSlider(
  container: HTMLElement,
  channelDef: ChannelDef,
  options: SliderOptions = {}
): SliderInstance {
  const { value: initialValue, values = {}, colorSpace: _colorSpace = 'RGB', onChange, getDependentGradient, sliderId } = options;
  const idBase = sliderId || 'ccv-' + (channelDef.key || 'ch');
  const min = channelDef.min;
  const max = channelDef.max;
  const range = max - min;

  let value = clamp(initialValue ?? min, min, max);

  const wrap = document.createElement('div');
  wrap.className = 'negarity-ccv-slider negarity-ccv-slider--' + (channelDef.type || 'linear');
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', channelDef.label + ' channel');

  const label = document.createElement('label');
  label.className = 'negarity-ccv-slider__label';
  label.textContent = channelDef.label;
  label.id = idBase + '-label';
  label.htmlFor = idBase + '-input';

  const trackWrap = document.createElement('div');
  trackWrap.className = 'negarity-ccv-slider__track-wrap';

  const track = document.createElement('div');
  track.className = 'negarity-ccv-slider__track';
  track.setAttribute('aria-hidden', 'true');

  const thumb = document.createElement('div');
  thumb.className = 'negarity-ccv-slider__thumb';
  thumb.setAttribute('aria-hidden', 'true');

  const valueEl = document.createElement('span');
  valueEl.className = 'negarity-ccv-slider__value';
  valueEl.id = idBase + '-value';
  valueEl.textContent = formatValue(value, channelDef);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(range <= 360 && range > 0 ? range / 360 : range > 100 ? 1 : 0.1);
  input.value = String(value);
  input.id = idBase + '-input';
  input.className = 'negarity-ccv-slider__input';
  input.setAttribute('aria-valuemin', String(min));
  input.setAttribute('aria-valuemax', String(max));
  input.setAttribute('aria-valuenow', String(value));
  input.setAttribute('aria-valuetext', formatValue(value, channelDef));
  input.setAttribute('aria-labelledby', label.id + ' ' + valueEl.id);

  trackWrap.appendChild(track);
  trackWrap.appendChild(thumb);
  wrap.appendChild(label);
  wrap.appendChild(trackWrap);
  wrap.appendChild(input);
  wrap.appendChild(valueEl);
  container.appendChild(wrap);

  const isCircular = channelDef.type === CHANNEL_TYPES.CIRCULAR || channelDef.type === CHANNEL_TYPES.CIRCULAR_DEPENDENT;
  let circularCanvas: HTMLCanvasElement | null = null;
  if (channelDef.type === CHANNEL_TYPES.CIRCULAR_DEPENDENT) {
    circularCanvas = document.createElement('canvas');
    circularCanvas.className = 'negarity-ccv-slider__track-circular';
    circularCanvas.setAttribute('aria-hidden', 'true');
    track.appendChild(circularCanvas);
    circularCanvas.width = 120;
    circularCanvas.height = 120;
  }

  function setGradientCSS(css: string): void {
    track.style.backgroundImage = css;
    track.style.background = css;
  }

  function drawCircularThumb(): void {
    if (!isCircular) return;
    const cx = trackWrap.offsetWidth / 2;
    const cy = trackWrap.offsetHeight / 2;
    const r = Math.min(cx, cy) * 0.75;
    if (r <= 0) {
      // Not laid out yet. Defer once; if still no size next frame, don't loop.
      requestAnimationFrame(() => {
        if (trackWrap.offsetWidth > 0 && trackWrap.offsetHeight > 0) drawCircularThumb();
      });
      return;
    }
    // Same angle convention as click: 0 = top, clockwise. value 0..range maps to angle 0..2π with thumbAngle = (value-min)/range * 2π - π/2
    const thumbAngle = ((value - min) / range) * 2 * Math.PI - Math.PI / 2;
    // With transform: translate(-50%, -50%), left/top are the center position. Compensate for CSS margin-left: -10px.
    const marginLeft = 10; // match .negarity-ccv-slider__thumb { margin-left: -10px }
    const leftPx = cx + r * Math.cos(thumbAngle) - marginLeft;
    const topPx = cy + r * Math.sin(thumbAngle);
    thumb.style.left = leftPx + 'px';
    thumb.style.top = topPx + 'px';
  }

  function drawCircularDependentGradient(): void {
    if (!circularCanvas) return;
    const ctx = circularCanvas.getContext('2d');
    if (!ctx) return;
    const w = circularCanvas.width;
    const h = circularCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 4;
    const L = values.L ?? values.l ?? 50;
    const C = values.C ?? values.c ?? 50;
    // Use 72 segments (every 5°) for performance; still smooth visually
    const steps = 72;
    const stepAngle = 360 / steps;
    for (let i = 0; i < steps; i++) {
      const angle = i * stepAngle;
      const [l, a, b] = lchToLab(L, C, angle);
      const [r, g, b_rgb] = labToRgb(l, a, b);
      const hex = rgbToHex(r, g, b_rgb);
      const rad = (angle / 360) * 2 * Math.PI - Math.PI / 2;
      const nextRad = ((angle + stepAngle) / 360) * 2 * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, rad, nextRad);
      ctx.closePath();
      ctx.fillStyle = hex;
      ctx.fill();
    }
  }

  function updateTrackGradient(): void {
    const g = channelDef.gradient || {};
    if (channelDef.type === CHANNEL_TYPES.LINEAR) {
      const minC = g.minColor || '#000000';
      const maxC = g.maxColor || '#ffffff';
      setGradientCSS(`linear-gradient(to right, ${minC}, ${maxC})`);
      return;
    }
    if (channelDef.type === CHANNEL_TYPES.CIRCULAR) {
      setGradientCSS('conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)');
      drawCircularThumb();
      return;
    }
    if (channelDef.type === CHANNEL_TYPES.DEPENDENT_2 || channelDef.type === CHANNEL_TYPES.DEPENDENT_3) {
      const dep = getDependentGradient ? getDependentGradient(channelDef.key, values) : null;
      if (dep?.stops?.length) {
        const parts = dep.stops.map((s) => `${s.pos * 100}% ${s.color}`).join(', ');
        const gradientCss = `linear-gradient(to right, ${parts})`;
        track.style.background = gradientCss;
        track.style.backgroundImage = gradientCss;
      } else {
        const minC = g.minColor || '#000';
        const maxC = g.maxColor || '#fff';
        const midC = g.midColor;
        const gradientCss = midC !== undefined ? `linear-gradient(to right, ${minC}, ${midC}, ${maxC})` : `linear-gradient(to right, ${minC}, ${maxC})`;
        track.style.background = gradientCss;
        track.style.backgroundImage = gradientCss;
      }
      return;
    }
    if (channelDef.type === CHANNEL_TYPES.CIRCULAR_DEPENDENT && circularCanvas) {
      drawCircularDependentGradient();
      drawCircularThumb();
    }
  }

  function updateThumbPosition(): void {
    if (isCircular) {
      drawCircularThumb();
      return;
    }
    const p = (value - min) / (range || 1);
    thumb.style.left = p * 100 + '%';
  }

  function notifyChange(newVal: number): void {
    console.log('[CCV] slider input', channelDef.key, '=', newVal);
    value = clamp(newVal, min, max);
    input.value = String(value);
    input.setAttribute('aria-valuenow', String(value));
    input.setAttribute('aria-valuetext', formatValue(value, channelDef));
    valueEl.textContent = formatValue(value, channelDef);
    updateThumbPosition();
    onChange?.(value);
  }

  function onTrackClick(e: MouseEvent): void {
    if (isCircular) {
      // CIRCULAR type: track is a div with conic-gradient (no circularCanvas). Compute angle from center.
      const rect = trackWrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const atan2Angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      let angle = (atan2Angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
      const newVal = min + (angle / (2 * Math.PI)) * range;
      console.log('[CCV hue circle click]', {
        click: { x: e.clientX, y: e.clientY },
        trackWrap: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        center: { cx, cy },
        atan2Rad: atan2Angle,
        angleRad: angle,
        angleDeg: (angle * 180 / Math.PI).toFixed(1),
        newVal: Math.round(newVal * 10) / 10,
      });
      notifyChange(newVal);
      return;
    }
    const rect = track.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    notifyChange(min + p * range);
  }

  track.addEventListener('click', onTrackClick);
  input.addEventListener('input', () => notifyChange(parseFloat(input.value)));
  input.addEventListener('change', () => notifyChange(parseFloat(input.value)));

  if (isCircular && circularCanvas) {
    circularCanvas.addEventListener('click', (e: MouseEvent) => {
      const rect = circularCanvas!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      angle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
      notifyChange(min + (angle / (2 * Math.PI)) * range);
    });
  }

  updateTrackGradient();
  updateThumbPosition();

  return {
    get el() {
      return wrap;
    },
    get value() {
      return value;
    },
    setValue(v: number) {
      value = clamp(v, min, max);
      input.value = String(value);
      input.setAttribute('aria-valuenow', String(value));
      input.setAttribute('aria-valuetext', formatValue(value, channelDef));
      valueEl.textContent = formatValue(value, channelDef);
      updateThumbPosition();
    },
    updateGradient() {
      updateTrackGradient();
      updateThumbPosition();
    },
    destroy() {
      track.removeEventListener('click', onTrackClick);
      wrap.remove();
    },
  };
}

export function computeDependentGradient(
  colorSpace: string,
  channelKey: string,
  values: Record<string, number>,
  _channelDef?: ChannelDef
): { type: string; stops: Array<{ pos: number; color: string }> } | null {
  const space = (colorSpace || '').toUpperCase();
  const v = values || {};

  const toHex = (r: number, g: number, b: number) => rgbToHex(r, g, b);

  if (space === 'HSL' && channelKey === 's') {
    const [r, g, b] = hslToRgb(v.h ?? 0, 100, 50);
    return { type: 'linear', stops: [{ pos: 0, color: '#808080' }, { pos: 1, color: toHex(r, g, b) }] };
  }
  if (space === 'HSL' && channelKey === 'l') {
    const [r, g, b] = hslToRgb(v.h ?? 0, v.s ?? 50, 50);
    return { type: 'linear', stops: [{ pos: 0, color: '#000000' }, { pos: 0.5, color: toHex(r, g, b) }, { pos: 1, color: '#ffffff' }] };
  }
  if (space === 'HSV' && channelKey === 's') {
    const [r, g, b] = hsvToRgb(v.h ?? 0, 100, 100);
    return { type: 'linear', stops: [{ pos: 0, color: '#808080' }, { pos: 1, color: toHex(r, g, b) }] };
  }
  if (space === 'HSV' && channelKey === 'v') {
    const [r, g, b] = hsvToRgb(v.h ?? 0, v.s ?? 50, 100);
    return { type: 'linear', stops: [{ pos: 0, color: '#000000' }, { pos: 0.5, color: toHex(r, g, b) }, { pos: 1, color: '#ffffff' }] };
  }
  if (space === 'LAB' && (channelKey === 'a' || channelKey === 'b')) {
    const L = v.L ?? v.l ?? 50;
    const minColor = channelKey === 'a' ? toHex(...labToRgb(L, -128, 0)) : toHex(...labToRgb(L, 0, -128));
    const midColor = toHex(...labToRgb(L, 0, 0));
    const maxColor = channelKey === 'a' ? toHex(...labToRgb(L, 127, 0)) : toHex(...labToRgb(L, 0, 127));
    return { type: 'linear', stops: [{ pos: 0, color: minColor }, { pos: 0.5, color: midColor }, { pos: 1, color: maxColor }] };
  }
  if (space === 'LCH' && channelKey === 'C') {
    const L = v.L ?? v.l ?? 50;
    const h = v.h ?? 0;
    const gray = toHex(...labToRgb(...lchToLab(L, 0, h)));
    const full = toHex(...labToRgb(...lchToLab(L, 132, h)));
    return { type: 'linear', stops: [{ pos: 0, color: gray }, { pos: 1, color: full }] };
  }
  if (space === 'YCBCR' && (channelKey === 'cb' || channelKey === 'cr')) {
    const y = v.y ?? 128;
    const [r, g, b] = ycbcrToRgb(y, 128, 128);
    const mid = toHex(r, g, b);
    const minC = channelKey === 'cb' ? '#0000ff' : '#008000';
    const maxC = channelKey === 'cb' ? '#ffff00' : '#ff0000';
    return { type: 'linear', stops: [{ pos: 0, color: minC }, { pos: 0.5, color: mid }, { pos: 1, color: maxC }] };
  }
  return null;
}
