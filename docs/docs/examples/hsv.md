---
sidebar_position: 3
title: HSV
---

# Visualize an HSV color

**Axes (in order):** `h`, `s`, `v` — hue **0–360°**, saturation and value **0–100%**.

Use **`HSV_COLOR_SPACE`**. In **2D**, the renderer draws the **hue wheel** / HSV diagram; your point is placed from the triplet.

```typescript
import { ColorVisualizer, HSV_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'HSV Hue Wheel',
  colorSpace: HSV_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [120, 100, 100], // h, s%, v% — full green
      color: '#00ff00',
      label: 'HSV(120, 100%, 100%)',
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

**Marker color:** derive hex from HSV with your own conversion (e.g. `hsvToRgb` in the repo) so the label swatch matches the point.

## See also

- Repo: `src/examples/hsv-2d-demo.ts`
