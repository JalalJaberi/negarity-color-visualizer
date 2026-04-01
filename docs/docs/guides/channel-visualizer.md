---
sidebar_position: 4
---

# Color channel visualizer

**`ColorChannelVisualizer`** (`src/color-channel-visualizer/ColorChannelVisualizer.ts`) builds a **slider UI** for editing channel values in a named color space. It imports **`color-channel-visualizer.css`** from the package side—ensure your bundler handles CSS imports when you use it.

## Function signature

```typescript
function ColorChannelVisualizer(
  container: HTMLElement,
  options?: ColorChannelVisualizerOptions
): ColorChannelVisualizerInstance;
```

## Options (`ColorChannelVisualizerOptions`)

| Option | Default | Description |
|--------|---------|-------------|
| **`colorSpace`** | `'RGB'` | Space key: **`RGB`**, **`CMYK`**, **`HSL`**, **`HSV`**, **`LAB`**, **`LCH`**, **`XYZ`**, **`YCBCR`** (matched case-insensitively). |
| **`values`** | space defaults | Partial override of channel values. |
| **`onChange`** | — | Called with full **`Record<string, number>`** when any channel changes (after internal flush). |
| **`onChannelChange`** | — | Called per channel **`(key, value)`**. |
| **`showPreview`** | `true` | Swatch updated via **`valuesToHex`**. |
| **`layout`** | `'vertical'` | `'vertical'` or `'horizontal'`. |

## Instance API

| Method | Description |
|--------|-------------|
| **`getElement()`** | Root DOM element (class prefix `negarity-ccv`). |
| **`getColorSpace()`** | Resolved space key. |
| **`getValues()`** | Copy of current values. |
| **`setValues(values)`** | Merge updates and refresh sliders / preview. |
| **`destroy()`** | Remove nodes and cancel animation frames. |

## Channel model

Definitions live in **`channelConfig.ts`**:

- **`COLOR_SPACES`** — all supported spaces and **`defaultValues`**.
- **`CHANNEL_TYPES`** — linear, circular, dependent gradients (`dependent2`, `dependent3`, `circularDependent`, …) for slider styling and **dependent** hue/lightness behavior.

Utilities exported for advanced use:

- **`getColorSpace(key)`**, **`getValuesForSpace(key, overrides?)`**
- **`valuesToHex(colorSpaceKey, values)`**, **`rgbToHex`**
- **`createChannelSlider`**, **`computeDependentGradient`**

## Example

```typescript
import { ColorChannelVisualizer } from 'negarity-color-visualizer';

const box = document.getElementById('channels')!;
const ui = ColorChannelVisualizer(box, {
  colorSpace: 'LAB',
  layout: 'horizontal',
  onChange(v) {
    document.body.style.background = `lab(${v.L}% ${v.a} ${v.b})`;
  },
});

// Later
ui.setValues({ L: 70, a: 20, b: -10 });
```

**Note:** `valuesToHex` maps channels to sRGB hex for the preview; extreme Lab values may clip when converted.
