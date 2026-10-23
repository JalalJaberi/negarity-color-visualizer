---
sidebar_position: 5
---

# Color Explorer

**`ColorExplorer`** (`src/color-explorer/`) is the unified shell from the design mockups: one component for every color space, with optional chrome and three embed layouts.

It composes:

- **`ColorVisualizer`** — 2D diagrams / 3D RGB cube
- **`ColorChannelVisualizer`** — channel sliders + preview
- Shell chrome — swatch, title, hex, space select, 2D/3D toggle, View, footer

CSS is imported by the module (same pattern as the channel visualizer). With the Vite library build, styles land in **`dist/style.css`** — import that from your app or WordPress enqueue when using the UMD bundle.

## Quick start

```typescript
import { ColorExplorer } from '@jalaljaberi/negarity-color-visualizer';

const el = document.getElementById('explorer')!;

const explorer = ColorExplorer(el, {
  colorSpace: 'HSL',
  mode: '2d',
  values: { h: 14, s: 66, l: 62 },
  layout: 'auto', // container-query: side-by-side ↔ stacked
  onChange: (state) => {
    console.log(state.hex, state.colorSpace, state.values);
  },
});
```

## Responsiveness (three embeds)

| `layout` | Behavior |
|----------|----------|
| **`auto`** (default) | Container queries: wide → viz \| sliders; narrow → stacked |
| **`desktop`** | Force side-by-side |
| **`mobile`** | Force stacked (header toolbar wraps) |
| **`display`** | Visualization only + caption (`Space · #HEX`); hides chrome |

Demo page (Vite): **`/examples/color-explorer.html`**

## Fixing or hiding controls

Every control can be omitted or locked:

```typescript
ColorExplorer(el, {
  // Lock space to Lab (dropdown visible but disabled)
  colorSpace: { value: 'LAB', visible: true, editable: false },

  // Start in 3D; user can still toggle
  mode: { value: '3d', visible: true, editable: true },

  // Hide sliders entirely (display-only style without layout: 'display')
  sliders: { visible: false },

  // Or show sliders read-only
  // sliders: { visible: true, editable: false },

  header: { visible: true },
  footer: { visible: false },
  spaceSelect: { visible: true },
  modeToggle: { visible: true },
  viewMenu: { visible: true },
});
```

Passing a bare string / mode still works: `colorSpace: 'RGB'`, `mode: '2d'`.

## Instance API

| Method | Description |
|--------|-------------|
| **`getElement()`** | Root `.negarity-ce` node |
| **`getState()`** | `{ colorSpace, mode, values, hex }` |
| **`setColorSpace(space)`** | Switch space (keeps perceived color via hex → RGB → space) |
| **`setMode('2d' \| '3d')`** | Switch renderer |
| **`setValues( partial )`** | Update channels |
| **`setOptions(partial)`** | Rebuild chrome / layout |
| **`destroy()`** | Tear down visualizer + DOM |

## Notes

- **3D** currently renders the **RGB cube** with the current color as a marker (other solids TBD).
- **2D** uses the same space-specific paths as the existing `*-2d` demos (wheels, chromaticity, CMYK, Lab, …).
- Supported spaces: RGB, HSL, HSV, CMYK, XYZ, Lab, LCh, YCbCr.

## Related

- [ColorVisualizer](./color-visualizer)
- [Color channel visualizer](./channel-visualizer)
- [Modes and renderers](./modes-and-renderers)
