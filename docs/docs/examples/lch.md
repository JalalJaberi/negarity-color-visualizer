---
sidebar_position: 5
title: LCh (CIELCh)
---

# Visualize an LCh color

**Axes (in order):** `l`, `c`, `h` — **L\*** 0–100, **C\*** chroma 0–150, **h\*** hue **0–360°**.

Use **`LCH_COLOR_SPACE`**. The **2D** renderer shows a **chromaticity-style** diagram derived from the color (same family as Lab/XYZ in the library examples).

```typescript
import { ColorVisualizer, LCH_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'LCh',
  colorSpace: LCH_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [55, 45, 85], // L*, C*, h* (degrees)
      color: '#c4a35a',
      label: 'LCh(55, 45, 85°)',
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

**Marker color:** convert **LCh → Lab → RGB** (e.g. **`lchToLab`**, **`labToRgb`** in the repo) for an accurate **`color`** hex.

## See also

- Repo: `src/examples/lch-2d-demo.ts`
