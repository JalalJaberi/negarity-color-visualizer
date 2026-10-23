/**
 * Color Explorer — unified configurable shell for 2D/3D + channel controls.
 */

import type { RenderMode } from '../types';

/**
 * Per-control config: show/hide UI and optionally lock the value.
 *
 * - `visible: false` — control omitted from the shell (fixed display).
 * - `editable: false` — value shown (if visible) but not user-changeable; use `value`.
 * - `value` — initial / fixed value when not editable.
 */
export interface UiControlConfig<T> {
  visible?: boolean;
  editable?: boolean;
  value?: T;
}

export type LayoutMode = 'auto' | 'desktop' | 'mobile' | 'display';

export interface ColorExplorerState {
  colorSpace: string;
  mode: RenderMode;
  values: Record<string, number>;
  hex: string;
}

export interface ColorExplorerOptions {
  /** Title in the header (default: "Color explorer"). */
  title?: string;

  /**
   * Color space control.
   * Pass a string for a fixed initial space (dropdown still shown unless `spaceSelect.visible === false`).
   */
  colorSpace?: string | UiControlConfig<string>;

  /** Spaces listed in the dropdown (default: all supported). */
  availableColorSpaces?: string[];

  /**
   * 2D / 3D mode control.
   * Pass `'2d' | '3d'` for initial mode.
   */
  mode?: RenderMode | UiControlConfig<RenderMode>;

  /** Initial channel values for the active color space. */
  values?: Record<string, number>;

  /** Header (swatch + title + hex). Default visible. */
  header?: { visible?: boolean };

  /** Large preview swatch in the controls column. Default visible when sliders are visible. */
  preview?: { visible?: boolean };

  /** Channel sliders + numeric inputs. */
  sliders?: { visible?: boolean; editable?: boolean };

  /** Space dropdown in the header. */
  spaceSelect?: { visible?: boolean; editable?: boolean };

  /** 2D/3D segmented control. */
  modeToggle?: { visible?: boolean; editable?: boolean };

  /** "View" menu (outside-sRGB legend toggle, etc.). */
  viewMenu?: { visible?: boolean };

  /** Footer hints ("Drag to explore" / "Reset view"). */
  footer?: { visible?: boolean };

  /**
   * Layout:
   * - `auto` — CSS container query (desktop side-by-side / mobile stacked)
   * - `desktop` | `mobile` — force layout
   * - `display` — visualization-only (hides chrome; same as omitting controls)
   */
  layout?: LayoutMode;

  /** Show "Outside sRGB" hatch legend (when view supports it). */
  showOutsideSrgbLegend?: boolean;

  /** Called whenever space, mode, or values change. */
  onChange?: (state: ColorExplorerState) => void;

  /** Visualizer background. */
  backgroundColor?: string;
}

export interface ColorExplorerInstance {
  getElement(): HTMLElement;
  getState(): ColorExplorerState;
  setColorSpace(space: string): void;
  setMode(mode: RenderMode): void;
  setValues(values: Record<string, number>): void;
  setOptions(partial: Partial<ColorExplorerOptions>): void;
  destroy(): void;
}

export const DEFAULT_COLOR_SPACES = [
  'RGB',
  'HSL',
  'HSV',
  'CMYK',
  'XYZ',
  'LAB',
  'LCH',
  'YCBCR',
] as const;

export function normalizeUiControl<T>(
  input: T | UiControlConfig<T> | undefined,
  defaults: Required<Pick<UiControlConfig<T>, 'visible' | 'editable'>> & { value: T }
): Required<UiControlConfig<T>> {
  if (input === undefined) {
    return { ...defaults };
  }
  if (typeof input === 'object' && input !== null && ('visible' in input || 'editable' in input || 'value' in input)) {
    const c = input as UiControlConfig<T>;
    return {
      visible: c.visible ?? defaults.visible,
      editable: c.editable ?? defaults.editable,
      value: c.value !== undefined ? c.value : defaults.value,
    };
  }
  return {
    visible: defaults.visible,
    editable: defaults.editable,
    value: input as T,
  };
}
