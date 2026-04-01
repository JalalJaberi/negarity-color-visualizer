---
sidebar_position: 1
---

# ColorVisualizer

The **`ColorVisualizer`** class (`src/ColorVisualizer.ts`) is the main entry point: it picks a **2D** or **3D** renderer, owns the **container** element, and exposes lifecycle and update methods.

## Constructor

```typescript
new ColorVisualizer(container: HTMLElement | string, config?: Partial<VisualizerConfig>)
```

- **`container`** — DOM element or a **CSS selector** passed to `document.querySelector`. If the selector matches nothing, an `Error` is thrown.
- **`config`** — merged with defaults (see [Types](../reference/types#visualizerconfig)).

Default behavior includes **`mode: '3d'`**, axes/labels/grid on, **`interactive: true`**, and a light gray **`backgroundColor`**.

## Methods

| Method | Description |
|--------|-------------|
| **`render(preset: PresetConfig)`** | Renders a preset. If `preset.config.mode` differs from the current mode, the renderer is recreated. |
| **`update(points: ColorPoint[])`** | Updates the scene with new color points (renderer-dependent). |
| **`resize(width, height)`** | Sets internal size and forwards to the renderer. |
| **`setConfig(partial)`** | Merges config; if **`mode`** changes, reinitializes the renderer and re-renders **`currentPreset`** if set. |
| **`getConfig()`** | Returns a shallow copy of the active config. |
| **`destroy()`** | Disconnects **`ResizeObserver`**, destroys the renderer, clears references. |

### 2D-only updaters

These forward to **`Renderer2D`** when the method exists; they no-op in 3D:

- **`updateCIEBackground(config)`** — CIE / chromaticity background
- **`updateAxes(config)`** — axis lines and labels
- **`updateMarker(config)`** — position marker
- **`updateHSLHueWheel(config)`** / **`updateHSVHueWheel(config)`** — hue wheels
- **`updateCMYKGrid(config)`** — CMYK grid overlay

### Resize behavior

- **`handleResize()`** — uses container **`clientWidth` / `clientHeight`** (with fallbacks), calls **`resize`**, then **`render(currentPreset)`** if a preset is active. Used internally from **`ResizeObserver`**.

## Properties

- **`currentPreset: PresetConfig | null`** — last preset passed to **`render`**.

## Imports

```typescript
import { ColorVisualizer } from 'negarity-color-visualizer';
```

Lower-level renderers are also exported if you need them directly:

```typescript
import { Renderer2D, Renderer3D } from 'negarity-color-visualizer';
```
