---
sidebar_position: 2
title: HSL
---

# Visualize an HSL color

**Axes (in order):** `h`, `s`, `l` — hue **0–360°**, saturation and lightness **0–100%**.

Use **`HSL_COLOR_SPACE`**. For a **2D hue × saturation** diagram at a fixed lightness, set **`config.custom.projection`** to **`'hue-saturation'`** and **`fixedLightness`** to the lightness slice you want.

```typescript
import { ColorVisualizer, HSL_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;
const lightness = 50;

const preset: PresetConfig = {
  name: 'HSL Hue vs Saturation',
  colorSpace: HSL_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [200, 80, lightness], // h, s%, l%
      color: '#3399e6',
      label: `HSL(200, 80%, ${lightness}%)`,
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
    custom: {
      projection: 'hue-saturation',
      fixedLightness: lightness,
    },
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

**Tip:** When the user changes **lightness**, update **`config.custom.fixedLightness`** and re-**`render`** the preset so the 2D slice matches.

## See also

- Repo: `src/examples/hsl-2d-demo.ts`
