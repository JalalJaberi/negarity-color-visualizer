---
sidebar_position: 1
---

# Introduction

**Negarity Color Visualizer** is a **browser-only** TypeScript library for visualizing colors in **2D** and **3D**. It is a companion to data and APIs from color science—ideal for docs, design tools, and teaching.

## What you get

- **`ColorVisualizer`** — mount to a DOM element, choose `2d` or `3d`, render **presets** (e.g. RGB cube), **update** points, and **resize** when the layout changes.
- **Renderers** — **Three.js** for 3D (orbit controls, meshes, axes) and **Konva** for 2D diagrams (CIE-style backgrounds, hue wheels, gamut slices, markers).
- **`ColorChannelVisualizer`** — declarative **channel sliders** with dependent gradients (e.g. HSL lightness depends on hue/saturation), optional color preview, vertical or horizontal layout.
- **Types & presets** — `ColorSpace`, `PresetConfig`, `ColorPoint`, and exported spaces such as `RGB_COLOR_SPACE`, `HSL_COLOR_SPACE`, `LAB_COLOR_SPACE`, plus **`RGB_CUBE_PRESET`** for the 3D RGB cube.

## Requirements

- Modern browsers (ES2020+).
- **Node 20+** if you build the documentation site locally.

## Next steps

- [Getting started](./getting-started) — install and first example
- [ColorVisualizer](./guides/color-visualizer) — main class API
- [Modes & renderers](./guides/modes-and-renderers) — 2D vs 3D
- [Presets & color spaces](./guides/presets-and-spaces) — built-in definitions
- [Examples](./examples/rgb) — visualize a color in each space (RGB, HSL, HSV, Lab, LCh, XYZ, CMYK, YCbCr)
- [Channel visualizer](./guides/channel-visualizer) — slider UI
- [Type reference](./reference/types) — `VisualizerConfig`, `PresetConfig`, etc.
