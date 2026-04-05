---
sidebar_position: 4
title: Lab (CIELAB)
---

# Visualize a Lab (CIELAB) color

**Axes (in order):** `l`, `a`, `b` — **L\*** 0–100, **a\*** and **b\*** roughly −128…127 (see **`LAB_COLOR_SPACE`** bounds in the package).

Use **`LAB_COLOR_SPACE`**. The **2D** view is typically the **a\* vs b\*** plane at the current **L\*** (your point’s first component).

```typescript
import { ColorVisualizer, LAB_COLOR_SPACE } from 'negarity-color-visualizer';
import type { PresetConfig } from 'negarity-color-visualizer';

const container = document.getElementById('viz')!;

const preset: PresetConfig = {
  name: 'Lab a* vs b*',
  colorSpace: LAB_COLOR_SPACE,
  shape: 'custom',
  size: { width: container.clientWidth || 800, height: 600 },
  points: [
    {
      values: [70, 30, 50], // L*, a*, b*
      color: '#E67A2C',
      label: 'Lab(70, 30, 50)',
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

**Marker color:** convert Lab → RGB (e.g. **`labToRgb`** from `negarity-color-visualizer` / repo `utils/colorConversion`) to fill **`color`** with a correct hex.

## See also

- Repo: `src/examples/lab-2d-demo.ts`
