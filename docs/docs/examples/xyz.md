---
sidebar_position: 6
title: XYZ
---

# Visualize an XYZ color

**Axes (in order):** `x`, `y`, `z` — in the built-in preset, each axis uses a **0–100** scale (see **`XYZ_COLOR_SPACE`**).

Use **`XYZ_COLOR_SPACE`**. For a **chromaticity** view (xy projection, gamut horseshoe), enable **`custom.showChromaticity`** like RGB.

```typescript
import { ColorVisualizer, XYZ_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'XYZ chromaticity',
  colorSpace: XYZ_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [24, 18, 3],
      color: '#ff0000',
      label: 'XYZ(24, 18, 3)',
    },
  ],
  config: {
    mode: '2d',
    width: container.clientWidth || 800,
    height: 600,
    backgroundColor: '#ffffff',
    showAxes: true,
    showLabels: true,
    interactive: true,
    custom: { showChromaticity: true },
  },
};

const visualizer = new ColorVisualizer(container, {
  mode: '2d',
  width: container.clientWidth || 800,
  height: 600,
  backgroundColor: '#ffffff',
  showAxes: true,
  showLabels: true,
  interactive: true,
});

visualizer.render(preset);
```

**Marker color:** convert **XYZ → RGB** (e.g. **`xyzToRgb`**) for the swatch. Absolute XYZ units differ by white point; keep the same convention as your app.

## See also

- Repo: `src/examples/xyz-2d-demo.ts`
