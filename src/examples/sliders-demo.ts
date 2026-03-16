/**
 * Sliders example: ColorChannelVisualizer for multiple color spaces.
 * Run from examples/sliders.html (Vite dev server or after build).
 */

import {
  ColorChannelVisualizer,
  valuesToHexChannel,
  getValuesForSpaceChannel,
} from '../index';
import {
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  rgbToLab,
  labToLch,
} from '../utils/colorConversion';

type CCVInstance = ReturnType<typeof ColorChannelVisualizer>;

const SPACES = [
  { id: 'ccv-rgb', space: 'RGB', hexElId: 'hex-rgb' },
  { id: 'ccv-hsl', space: 'HSL', hexElId: 'hex-hsl' },
  { id: 'ccv-hsv', space: 'HSV', hexElId: 'hex-hsv' },
  { id: 'ccv-cmyk', space: 'CMYK', hexElId: 'hex-cmyk' },
  { id: 'ccv-lab', space: 'LAB', hexElId: 'hex-lab' },
  { id: 'ccv-lch', space: 'LCH', hexElId: 'hex-lch' },
] as const;

const instances: Record<string, CCVInstance> = {};

function updateHexDisplay(space: string, values: Record<string, number>, hexElId: string) {
  const el = document.getElementById(hexElId);
  if (el) el.textContent = valuesToHexChannel(space, values);
}

function init() {
  SPACES.forEach(({ id, space, hexElId }) => {
    const container = document.getElementById(id);
    if (!container) return;

    const initialValues = getValuesForSpaceChannel(space, undefined);
    const ccv = ColorChannelVisualizer(container, {
      colorSpace: space,
      values: initialValues,
      showPreview: true,
      layout: 'vertical',
      onChange(values) {
        updateHexDisplay(space, values, hexElId);
      },
    });

    instances[id] = ccv;
    updateHexDisplay(space, ccv.getValues(), hexElId);
  });
}

function setPreset(r: number, g: number, b: number) {
  // Apply to RGB
  const rgb = instances['ccv-rgb'];
  if (rgb) {
    rgb.setValues({ r, g, b });
    updateHexDisplay('RGB', rgb.getValues(), 'hex-rgb');
  }

  // Sync HSL
  const hsl = instances['ccv-hsl'];
  if (hsl) {
    const [h, s, l] = rgbToHsl(r, g, b);
    hsl.setValues({ h, s, l });
    updateHexDisplay('HSL', hsl.getValues(), 'hex-hsl');
  }

  // Sync HSV
  const hsv = instances['ccv-hsv'];
  if (hsv) {
    const [h, s, v] = rgbToHsv(r, g, b);
    hsv.setValues({ h, s, v });
    updateHexDisplay('HSV', hsv.getValues(), 'hex-hsv');
  }

  // Sync CMYK
  const cmyk = instances['ccv-cmyk'];
  if (cmyk) {
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    cmyk.setValues({ c, m, y, k });
    updateHexDisplay('CMYK', cmyk.getValues(), 'hex-cmyk');
  }

  // Sync Lab
  const lab = instances['ccv-lab'];
  if (lab) {
    const [L, a, bVal] = rgbToLab(r, g, b);
    lab.setValues({ L, a, b: bVal });
    updateHexDisplay('LAB', lab.getValues(), 'hex-lab');
  }

  // Sync LCh (via Lab)
  const lch = instances['ccv-lch'];
  if (lch) {
    const [L, a, bVal] = rgbToLab(r, g, b);
    const [L2, C, h] = labToLch(L, a, bVal);
    lch.setValues({ L: L2, C, h });
    updateHexDisplay('LCH', lch.getValues(), 'hex-lch');
  }
}

// Expose for preset buttons in HTML (onclick="setPreset(...)")
declare global {
  interface Window {
    setPreset: typeof setPreset;
  }
}
window.setPreset = setPreset;

init();

// Bind preset buttons (data-preset-rgb="r,g,b")
document.querySelectorAll<HTMLElement>('[data-preset-rgb]').forEach((btn) => {
  const attr = btn.getAttribute('data-preset-rgb');
  if (!attr) return;
  const parts = attr.split(',').map((s) => parseInt(s.trim(), 10));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    btn.addEventListener('click', () => setPreset(parts[0], parts[1], parts[2]));
  }
});
