/**
 * ColorExplorer — one shell for every color space.
 *
 * Combines ColorVisualizer + ColorChannelVisualizer with configurable chrome
 * and responsive layouts (desktop / mobile / display-only).
 */

import { ColorVisualizer } from '../ColorVisualizer';
import { ColorChannelVisualizer } from '../color-channel-visualizer';
import type { ColorChannelVisualizerInstance } from '../color-channel-visualizer';
import { getValuesForSpace } from '../color-channel-visualizer/channelConfig';
import { valuesToHex } from '../color-channel-visualizer/valuesToHex';
import type { RenderMode } from '../types';
import {
  buildExplorerPreset,
  displaySpaceLabel,
  getSliceCaption,
  normalizeSpaceKey,
  parseHexToRgb,
  rgbToSpaceValues,
} from './buildPreset';
import {
  DEFAULT_COLOR_SPACES,
  normalizeUiControl,
  type ColorExplorerInstance,
  type ColorExplorerOptions,
  type ColorExplorerState,
  type LayoutMode,
} from './types';
import './color-explorer.css';

function ensureAssetUrls(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { CIRCLE_IMAGE_URL?: string; HORSESHOE_IMAGE_URL?: string };
  try {
    if (!w.CIRCLE_IMAGE_URL) {
      w.CIRCLE_IMAGE_URL = new URL('../assets/images/circle.png', import.meta.url).href;
    }
    if (!w.HORSESHOE_IMAGE_URL) {
      w.HORSESHOE_IMAGE_URL = new URL('../assets/images/horseshoe.png', import.meta.url).href;
    }
  } catch {
    // Asset URLs optional when consumed from UMD without Vite.
  }
}

function resolveContainer(container: HTMLElement | string): HTMLElement {
  if (typeof container === 'string') {
    const el = document.querySelector(container);
    if (!el) throw new Error(`Container element not found: ${container}`);
    return el as HTMLElement;
  }
  return container;
}

/**
 * Mount a Color Explorer into `container`.
 */
export function ColorExplorer(
  container: HTMLElement | string,
  options: ColorExplorerOptions = {}
): ColorExplorerInstance {
  ensureAssetUrls();

  const host = resolveContainer(container);
  let opts: ColorExplorerOptions = { ...options };

  const spaceCtrl = () =>
    normalizeUiControl(opts.colorSpace, {
      visible: opts.spaceSelect?.visible !== false,
      editable: opts.spaceSelect?.editable !== false,
      value: 'HSL',
    });

  const modeCtrl = () =>
    normalizeUiControl(opts.mode, {
      visible: opts.modeToggle?.visible !== false,
      editable: opts.modeToggle?.editable !== false,
      value: '2d' as RenderMode,
    });

  let colorSpace = normalizeSpaceKey(spaceCtrl().value);
  let mode: RenderMode = modeCtrl().value === '3d' ? '3d' : '2d';
  let values = getValuesForSpace(colorSpace, opts.values);
  const availableSpaces = (opts.availableColorSpaces?.length
    ? opts.availableColorSpaces
    : [...DEFAULT_COLOR_SPACES]
  ).map(normalizeSpaceKey);

  const root = document.createElement('div');
  root.className = 'negarity-ce';

  let swatchEl!: HTMLElement;
  let hexEl!: HTMLElement;
  let spaceSelect: HTMLSelectElement | null = null;
  let modeBtns: { btn: HTMLButtonElement; mode: RenderMode }[] = [];
  let vizEl!: HTMLElement;
  let sliceEl!: HTMLElement;
  let legendEl!: HTMLElement;
  let previewEl: HTMLElement | null = null;
  let slidersEl!: HTMLElement;
  let captionEl!: HTMLElement;
  let hintEl!: HTMLElement;

  let visualizer: ColorVisualizer | null = null;
  let ccv: ColorChannelVisualizerInstance | null = null;
  let syncing = false;

  function layoutMode(): LayoutMode {
    if (opts.layout === 'display') return 'display';
    return opts.layout || 'auto';
  }

  function showHeader(): boolean {
    if (layoutMode() === 'display') return false;
    return opts.header?.visible !== false;
  }

  function showSliders(): boolean {
    if (layoutMode() === 'display') return false;
    return opts.sliders?.visible !== false;
  }

  function slidersEditable(): boolean {
    return opts.sliders?.editable !== false;
  }

  function showPreview(): boolean {
    if (!showSliders()) return false;
    return opts.preview?.visible !== false;
  }

  function showFooter(): boolean {
    if (layoutMode() === 'display') return false;
    return opts.footer?.visible !== false;
  }

  function showLegend(): boolean {
    return opts.showOutsideSrgbLegend !== false && mode === '2d';
  }

  function showViewMenu(): boolean {
    if (layoutMode() === 'display') return false;
    return opts.viewMenu?.visible !== false;
  }

  function currentHex(): string {
    return valuesToHex(colorSpace, values).toUpperCase();
  }

  function emitChange(): void {
    opts.onChange?.({
      colorSpace,
      mode,
      values: { ...values },
      hex: currentHex(),
    });
  }

  function applyRootClasses(): void {
    const layout = layoutMode();
    root.className = [
      'negarity-ce',
      `negarity-ce--layout-${layout}`,
      showHeader() ? '' : 'negarity-ce--no-header',
      showFooter() ? '' : 'negarity-ce--no-footer',
      showSliders() ? '' : 'negarity-ce--no-controls',
    ]
      .filter(Boolean)
      .join(' ');
  }

  function updateChrome(): void {
    const hex = currentHex();
    swatchEl.style.backgroundColor = hex;
    hexEl.textContent = hex;
    sliceEl.textContent = mode === '2d' ? getSliceCaption(colorSpace) : 'RGB cube · orbit to explore';
    legendEl.hidden = !showLegend();
    captionEl.textContent = `${displaySpaceLabel(colorSpace)} · ${hex}`;
    hintEl.textContent =
      mode === '3d' ? 'Drag to rotate · Scroll to zoom' : 'Drag marker · Adjust sliders';
    if (previewEl) previewEl.style.backgroundColor = hex;
    if (spaceSelect && spaceSelect.value !== colorSpace) {
      spaceSelect.value = colorSpace;
    }
    modeBtns.forEach(({ btn, mode: m }) => {
      btn.classList.toggle('is-active', m === mode);
    });
  }

  function destroyVisualizer(): void {
    if (visualizer) {
      visualizer.destroy();
      visualizer = null;
    }
    vizEl.innerHTML = '';
  }

  function destroyCcv(): void {
    if (ccv) {
      ccv.destroy();
      ccv = null;
    }
    slidersEl.innerHTML = '';
  }

  function renderVisualizer(): void {
    const preset = buildExplorerPreset({
      colorSpace,
      mode,
      values,
      backgroundColor: opts.backgroundColor ?? (mode === '3d' ? '#f0f0f0' : '#ffffff'),
      interactive: true,
    });

    if (!visualizer || visualizer.getConfig().mode !== mode) {
      destroyVisualizer();
      visualizer = new ColorVisualizer(vizEl, {
        mode,
        backgroundColor: preset.config?.backgroundColor,
        showAxes: true,
        showLabels: true,
        showGrid: mode === '3d',
        interactive: true,
      });
    }

    visualizer.render(preset);
    requestAnimationFrame(() => visualizer?.handleResize());
  }

  function mountCcv(): void {
    destroyCcv();
    if (!showSliders()) return;

    ccv = ColorChannelVisualizer(slidersEl, {
      colorSpace,
      values,
      showPreview: false,
      layout: 'vertical',
      onChange: (next) => {
        if (syncing) return;
        values = { ...next };
        updateChrome();
        renderVisualizer();
        emitChange();
      },
    });

    slidersEl.classList.toggle('is-readonly', !slidersEditable());
    if (!slidersEditable()) {
      slidersEl.querySelectorAll('input, button').forEach((el) => {
        (el as HTMLInputElement).disabled = true;
      });
    }
  }

  function buildDom(): void {
    root.innerHTML = '';

    const headerEl = document.createElement('header');
    headerEl.className = 'negarity-ce__header';

    const identity = document.createElement('div');
    identity.className = 'negarity-ce__identity';

    swatchEl = document.createElement('div');
    swatchEl.className = 'negarity-ce__swatch';
    swatchEl.setAttribute('aria-hidden', 'true');

    const titles = document.createElement('div');
    titles.className = 'negarity-ce__titles';
    const title = document.createElement('h2');
    title.className = 'negarity-ce__title';
    title.textContent = opts.title || 'Color explorer';
    hexEl = document.createElement('p');
    hexEl.className = 'negarity-ce__hex';
    titles.append(title, hexEl);
    identity.append(swatchEl, titles);

    const toolbar = document.createElement('div');
    toolbar.className = 'negarity-ce__toolbar';

    const sc = spaceCtrl();
    if (sc.visible) {
      spaceSelect = document.createElement('select');
      spaceSelect.className = 'negarity-ce__select';
      spaceSelect.setAttribute('aria-label', 'Color space');
      availableSpaces.forEach((key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = displaySpaceLabel(key);
        spaceSelect!.appendChild(opt);
      });
      spaceSelect.value = colorSpace;
      spaceSelect.disabled = !sc.editable;
      spaceSelect.addEventListener('change', () => {
        if (!sc.editable) return;
        setColorSpaceInternal(spaceSelect!.value, true);
      });
      toolbar.appendChild(spaceSelect);
    } else {
      spaceSelect = null;
    }

    const mc = modeCtrl();
    if (mc.visible) {
      const modeWrap = document.createElement('div');
      modeWrap.className = 'negarity-ce__mode';
      modeWrap.setAttribute('role', 'group');
      modeWrap.setAttribute('aria-label', 'View mode');
      modeBtns = [];
      (['2d', '3d'] as RenderMode[]).forEach((m) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'negarity-ce__mode-btn';
        btn.textContent = m.toUpperCase();
        btn.disabled = !mc.editable;
        btn.addEventListener('click', () => {
          if (!mc.editable) return;
          setModeInternal(m, true);
        });
        modeWrap.appendChild(btn);
        modeBtns.push({ btn, mode: m });
      });
      toolbar.appendChild(modeWrap);
    } else {
      modeBtns = [];
    }

    if (showViewMenu()) {
      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'negarity-ce__view-btn';
      viewBtn.textContent = 'View';
      viewBtn.title = 'Toggle Outside sRGB legend';
      viewBtn.addEventListener('click', () => {
        opts.showOutsideSrgbLegend = !(opts.showOutsideSrgbLegend !== false);
        updateChrome();
      });
      toolbar.appendChild(viewBtn);
    }

    headerEl.append(identity, toolbar);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'negarity-ce__body';

    const vizWrap = document.createElement('div');
    vizWrap.className = 'negarity-ce__viz-wrap';
    sliceEl = document.createElement('p');
    sliceEl.className = 'negarity-ce__slice';
    vizEl = document.createElement('div');
    vizEl.className = 'negarity-ce__viz';
    legendEl = document.createElement('div');
    legendEl.className = 'negarity-ce__legend';
    legendEl.innerHTML =
      '<span class="negarity-ce__legend-swatch" aria-hidden="true"></span><span>Outside sRGB</span>';
    vizWrap.append(sliceEl, vizEl, legendEl);

    const controlsEl = document.createElement('div');
    controlsEl.className = 'negarity-ce__controls';
    if (showPreview()) {
      previewEl = document.createElement('div');
      previewEl.className = 'negarity-ce__preview';
      previewEl.setAttribute('aria-label', 'Color preview');
      controlsEl.appendChild(previewEl);
    } else {
      previewEl = null;
    }
    slidersEl = document.createElement('div');
    slidersEl.className = 'negarity-ce__sliders';
    controlsEl.appendChild(slidersEl);

    bodyEl.append(vizWrap, controlsEl);

    const footerEl = document.createElement('footer');
    footerEl.className = 'negarity-ce__footer';
    hintEl = document.createElement('p');
    hintEl.className = 'negarity-ce__hint';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'negarity-ce__reset';
    resetBtn.textContent = 'Reset view';
    resetBtn.addEventListener('click', () => {
      destroyVisualizer();
      renderVisualizer();
    });
    footerEl.append(hintEl, resetBtn);

    captionEl = document.createElement('p');
    captionEl.className = 'negarity-ce__caption';

    root.append(headerEl, bodyEl, footerEl, captionEl);
    if (!root.parentNode) {
      host.appendChild(root);
    }
  }

  function setColorSpaceInternal(next: string, emit: boolean): void {
    const key = normalizeSpaceKey(next);
    if (key === colorSpace) return;
    const hex = currentHex();
    const rgb = parseHexToRgb(hex) || [128, 128, 128];
    colorSpace = key;
    values = rgbToSpaceValues(colorSpace, rgb[0], rgb[1], rgb[2]);
    mountCcv();
    updateChrome();
    renderVisualizer();
    if (emit) emitChange();
  }

  function setModeInternal(next: RenderMode, emit: boolean): void {
    if (next === mode) return;
    mode = next;
    updateChrome();
    renderVisualizer();
    if (emit) emitChange();
  }

  function rebuild(): void {
    const sc = spaceCtrl();
    const mc = modeCtrl();
    colorSpace = normalizeSpaceKey(sc.value);
    mode = mc.value === '3d' ? '3d' : '2d';
    values = getValuesForSpace(colorSpace, opts.values ?? values);

    destroyVisualizer();
    destroyCcv();
    buildDom();
    applyRootClasses();
    mountCcv();
    updateChrome();
    renderVisualizer();
  }

  buildDom();
  applyRootClasses();
  mountCcv();
  updateChrome();
  renderVisualizer();

  const instance: ColorExplorerInstance = {
    getElement() {
      return root;
    },
    getState(): ColorExplorerState {
      return {
        colorSpace,
        mode,
        values: { ...values },
        hex: currentHex(),
      };
    },
    setColorSpace(space: string) {
      setColorSpaceInternal(space, true);
    },
    setMode(next: RenderMode) {
      setModeInternal(next, true);
    },
    setValues(next: Record<string, number>) {
      values = getValuesForSpace(colorSpace, { ...values, ...next });
      syncing = true;
      ccv?.setValues(values);
      syncing = false;
      updateChrome();
      renderVisualizer();
      emitChange();
    },
    setOptions(partial: Partial<ColorExplorerOptions>) {
      opts = { ...opts, ...partial };
      rebuild();
      emitChange();
    },
    destroy() {
      destroyVisualizer();
      destroyCcv();
      root.remove();
    },
  };

  return instance;
}

export default ColorExplorer;
