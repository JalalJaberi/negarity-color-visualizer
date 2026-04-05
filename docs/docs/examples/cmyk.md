---
sidebar_position: 7
title: CMYK
---

# Visualize a CMYK color

**Axes (in order):** `c`, `m`, `y`, `k` — each **0–100%**.

Use **`CMYK_COLOR_SPACE`**. The **2D** view in the stock example is a **C vs M** slice (with Y and K carried in the point); your **`values`** must always have **four** numbers.

```typescript
import { ColorVisualizer, CMYK_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'CMYK C vs M',
  colorSpace: CMYK_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [0, 100, 100, 0], // C, M, Y, K (%)
      color: '#00ffff',
      label: 'CMYK(0%, 100%, 100%, 0%)',
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

**Marker color:** convert **CMYK → RGB** (e.g. **`cmykToRgb`**) for the hex.

## See also

- Repo: `src/examples/cmyk-2d-demo.ts`
