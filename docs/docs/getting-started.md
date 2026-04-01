---
sidebar_position: 2
---

# Getting started

## Installation

```bash
npm install negarity-color-visualizer
```

The package lists **three** and **konva** as dependencies; your app bundler (Vite, webpack, etc.) will include them when you import the library.

## Minimal 3D example

```typescript
import { ColorVisualizer, RGB_CUBE_PRESET } from 'negarity-color-visualizer';

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

Import the channel visualizer (this pulls in the package CSS for sliders):

```typescript
import {
  ColorChannelVisualizer,
} from 'negarity-color-visualizer';

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
