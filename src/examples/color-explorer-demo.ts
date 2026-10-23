/**
 * Color Explorer demo — grid of spaces + three embed modes (desktop / mobile / display).
 * Open examples/color-explorer.html with the Vite dev server.
 */

import { ColorExplorer, rgbToSpaceValues } from '../color-explorer';

/** Design coral #E8755A */
const CORAL_RGB: [number, number, number] = [232, 117, 90];
const CORAL_HSL = { h: 14, s: 66, l: 62 };

function mountGrid(): void {
  const grid = document.getElementById('ce-grid');
  if (!grid) return;

  const spaces = ['RGB', 'HSL', 'HSV', 'CMYK', 'XYZ', 'LAB', 'LCH', 'YCBCR'] as const;
  spaces.forEach((space) => {
    const cell = document.createElement('div');
    cell.className = 'ce-grid__cell';
    grid.appendChild(cell);
    ColorExplorer(cell, {
      colorSpace: space,
      mode: '2d',
      values: rgbToSpaceValues(space, ...CORAL_RGB),
      layout: 'auto',
      viewMenu: { visible: true },
      footer: { visible: false },
    });
  });
}

function mountEmbeds(): void {
  const desktop = document.getElementById('ce-desktop');
  const mobile = document.getElementById('ce-mobile');
  const display = document.getElementById('ce-display');

  if (desktop) {
    ColorExplorer(desktop, {
      colorSpace: 'HSL',
      mode: '3d',
      values: { ...CORAL_HSL },
      layout: 'desktop',
      title: 'Color explorer',
    });
  }

  if (mobile) {
    ColorExplorer(mobile, {
      colorSpace: 'HSL',
      mode: '2d',
      values: { ...CORAL_HSL },
      layout: 'mobile',
      title: 'Color explorer',
      footer: { visible: false },
    });
  }

  if (display) {
    ColorExplorer(display, {
      colorSpace: 'HSL',
      mode: '2d',
      values: { ...CORAL_HSL },
      layout: 'display',
      header: { visible: false },
      sliders: { visible: false },
      footer: { visible: false },
      spaceSelect: { visible: false },
      modeToggle: { visible: false },
      viewMenu: { visible: false },
    });
  }
}

function mountFixedControls(): void {
  const el = document.getElementById('ce-fixed-space');
  if (!el) return;
  ColorExplorer(el, {
    colorSpace: { value: 'LAB', visible: true, editable: false },
    mode: { value: '2d', visible: true, editable: true },
    layout: 'desktop',
    sliders: { visible: true, editable: true },
    footer: { visible: false },
    title: 'Color explorer',
  });
}

mountGrid();
mountEmbeds();
mountFixedControls();
