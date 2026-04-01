---
sidebar_position: 2
---

# Modes and renderers

## Render modes

`VisualizerConfig.mode` is **`'2d'`** or **`'3d'`**:

- **`3d`** — **`Renderer3D`** using **Three.js**: perspective camera, WebGL canvas, **OrbitControls** when `interactive` is not `false`, ambient + directional lights, optional axes/grid helpers, mesh for cube/sphere/cylinder presets.
- **`2d`** — **`Renderer2D`** using **Konva**: stage + layer sized to the container or explicit width/height, composes **CIEBackground**, **Axes**, **Marker**, **HSLHueWheel**, **HSVHueWheel**, **CMYKGrid**, and other 2D pieces depending on the **preset** and color space.

Switching mode is done via **`setConfig({ mode: '2d' })`** or by passing **`config.mode`** inside a **`PresetConfig`** before **`render`**.

## When to use which

| Use case | Suggestion |
|----------|------------|
| Explorable RGB (or custom) volume | **`3d`** + cube/sphere preset |
| Gamut plots, chromaticity, hue wheels | **`2d`** + presets tailored to those diagrams |
| Teaching / documentation embeds | Either; 2D for static diagrams, 3D for interaction |

## Performance and bundling

- **Three.js** and **Konva** are **dependencies** of the npm package (not peer dependencies). Tree-shaking depends on your bundler; importing only **`ColorChannelVisualizer`** still pulls Konva-related code paths where used.
- Prefer **one mode per container** if you toggle often: each mode change **destroys** the previous renderer and builds a new one.

## See also

- [ColorVisualizer](./color-visualizer) — API details
- [Presets & color spaces](./presets-and-spaces) — built-in `ColorSpace` constants
