---
sidebar_position: 3
---

# Presets and color spaces

## Built-in `ColorSpace` objects

Exported from **`negarity-color-visualizer`** (`src/presets/index.ts`):

| Export | Axes (summary) |
|--------|----------------|
| **`RGB_COLOR_SPACE`** | R, G, B (0–255) |
| **`HSL_COLOR_SPACE`** | H (0–360°), S, L (0–100%) |
| **`HSV_COLOR_SPACE`** | H, S, V |
| **`LAB_COLOR_SPACE`** | L*, a*, b* |
| **`CMYK_COLOR_SPACE`** | C, M, Y, K (0–100%) |
| **`XYZ_COLOR_SPACE`** | X, Y, Z (0–100 scale in preset) |
| **`LCH_COLOR_SPACE`** | L*, C*, h* |
| **`YCBCR_COLOR_SPACE`** | Y, Cb, Cr (video-style ranges) |

Each includes optional **`bounds`** with **`min` / `max`** arrays aligned to **`axes`**.

## Built-in 3D preset

- **`RGB_CUBE_PRESET`** — `name: 'RGB Cube'`, **`shape: 'cube'`**, size 255×255×255 in RGB units, **`config.mode: '3d'`**, axes/labels/grid/interactive enabled.

### Helpers

```typescript
import { getBuiltInPresets, getPresetByName } from 'negarity-color-visualizer';

getBuiltInPresets(); // currently [RGB_CUBE_PRESET]
getPresetByName('RGB Cube'); // same preset or null
```

## Custom `PresetConfig`

```typescript
import type { ColorSpace, PresetConfig } from 'negarity-color-visualizer';

const colorSpace: ColorSpace = {
  name: 'Custom',
  axes: [
    { name: 'x', label: 'X', min: 0, max: 100 },
    { name: 'y', label: 'Y', min: 0, max: 100 },
    { name: 'z', label: 'Z', min: 0, max: 100 },
  ],
};

const preset: PresetConfig = {
  name: 'Custom visualization',
  colorSpace,
  shape: 'cube',
  size: { width: 100, height: 100, depth: 100 },
  config: { mode: '3d', showAxes: true },
};
```

- **`shape`** — `'cube' | 'sphere' | 'cylinder' | 'custom'` (3D path uses these for mesh generation where supported).
- **`points`** — optional array of **`ColorPoint`** (`values[]` + **`color`** hex + optional **`label`**) for scatter-style updates.
- **`config`** — partial `VisualizerConfig` merged when rendering.

2D presets in the library examples combine **`mode: '2d'`** with specific color-space names so **`Renderer2D`** can choose the right diagram (see `src/examples/*.ts` in the repo).
