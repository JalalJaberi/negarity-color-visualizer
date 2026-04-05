---
sidebar_position: 8
title: YCbCr
---

# Visualize a YCbCr color

**Axes (in order):** `y`, `cb`, `cr` — **video-style** ranges (built-in space: **Y** 16–235, **Cb/Cr** 16–240). See **`YCBCR_COLOR_SPACE`** for exact bounds.

Use **`YCBCR_COLOR_SPACE`**. The **2D** diagram follows the same chromaticity-style treatment as other examples in the library (gamut triangle for YCbCr).

```typescript
import { ColorVisualizer, YCBCR_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'YCbCr',
  colorSpace: YCBCR_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [180, 90, 200],
      color: '#d090c8',
      label: 'YCbCr(180, 90, 200)',
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

**Marker color:** convert **YCbCr → RGB** (e.g. **`ycbcrToRgb`**) for the hex. Different standards (JPEG, BT.601, BT.709) can shift matrices; stay consistent with your pipeline.

## See also

- Repo: `src/examples/ycbcr-2d-demo.ts`
