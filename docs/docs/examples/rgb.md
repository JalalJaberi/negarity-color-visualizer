---
sidebar_position: 1
title: RGB
---

# Visualize an RGB color

**Axes (in order):** `r`, `g`, `b` — each **0–255**.

Use **`RGB_COLOR_SPACE`** and pass a **`ColorPoint`** whose **`values`** array is `[r, g, b]`. Set **`color`** to a matching hex for the marker swatch.

## 2D — CIE chromaticity (gamut + point)

Good for showing **how an RGB triplet sits in chromaticity** (projected from XYZ). Enable **`custom.showChromaticity`**.

```typescript
import { ColorVisualizer, RGB_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'RGB chromaticity',
  colorSpace: RGB_COLOR_SPACE,
  shape: 'cube',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [255, 128, 64],
      color: '#ff8040',
      label: 'RGB(255, 128, 64)',
    },
  ],
  config: {
    mode: '2d',
    width: container.clientWidth || 800,
    height: 600,
    backgroundColor: '#ffffff',
    showAxes: false,
    showLabels: true,
    interactive: true,
    custom: { showChromaticity: true },
  },
};

const visualizer = new ColorVisualizer(container, preset.config);
visualizer.render(preset);
```

## 3D — RGB cube

For a **full cube** with the built-in preset, use **`RGB_CUBE_PRESET`** (see [Getting started](../getting-started)). To emphasize **one corner / point**, you can still add **`points`** to a copy of that preset or build your own **`PresetConfig`** with `shape: 'cube'` and the same color space.

## See also

- [Presets and color spaces](../guides/presets-and-spaces) — `RGB_COLOR_SPACE` definition  
- Repo: `src/examples/chromaticity-demo.ts`, `src/examples/demo.ts`
