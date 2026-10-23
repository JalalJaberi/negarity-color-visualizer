---
sidebar_position: 2
---

# Getting started

## Installation

```bash
npm install @jalaljaberi/negarity-color-visualizer
```

The built JavaScript bundles include Three.js and Konva. Import the stylesheet
explicitly when using the package through an app bundler:

```typescript
import '@jalaljaberi/negarity-color-visualizer/style.css';
```

## Minimal 3D example

```typescript
import { ColorVisualizer, RGB_CUBE_PRESET } from '@jalaljaberi/negarity-color-visualizer';

const el = document.getElementById('visualizer');
if (!el) throw new Error('Missing #visualizer');

const visualizer = new ColorVisualizer(el, {
  mode: '3d',
  width: 800,
  height: 600,
  interactive: true,
});

visualizer.render(RGB_CUBE_PRESET);
```

## Container sizing

- Pass explicit **`width`** / **`height`** in the config, **or**
- Omit them to use the container’s **`clientWidth` / `clientHeight`** (useful with CSS `width: 100%; height: 100%`).

`ColorVisualizer` uses a **`ResizeObserver`** on the container so the canvas stays in sync when the parent layout changes.

## Channel sliders (optional)

Import the channel visualizer and the package stylesheet shown above:

```typescript
import {
  ColorChannelVisualizer,
} from '@jalaljaberi/negarity-color-visualizer';

const root = document.getElementById('sliders')!;
const instance = ColorChannelVisualizer(root, {
  colorSpace: 'HSL',
  layout: 'vertical',
  showPreview: true,
  onChange(values) {
    console.log(values);
  },
});
```

See [Channel visualizer](./guides/channel-visualizer) for options and supported spaces.

## Development (library repo)

```bash
git clone https://github.com/JalalJaberi/negarity-color-visualizer.git
cd negarity-color-visualizer
npm install
npm run dev    # Vite dev server + examples
npm run build
npm run type-check
```

## Documentation site (this folder)

```bash
cd docs
npm install
npm start
```

Requires **Node.js ≥ 20**.
