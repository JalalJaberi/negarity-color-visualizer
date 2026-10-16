---
title: Architecture
sidebar_position: 2
---

# Architecture

**Negarity Color Visualizer** is a thin presentation layer for color spaces in the browser.

## Components

| Component | Responsibility |
|-----------|----------------|
| `ColorVisualizer` | Lifecycle: mount, render preset, update points, resize, destroy |
| `Renderer3D` | Three.js scene, meshes, orbit controls |
| `Renderer2D` | Konva stage for diagrams / markers |
| Presets | Declarative space + drawing config |
| `ColorChannelVisualizer` | Channel sliders + dependent gradients + preview |

## Design principles

- **Browser-only** — no server runtime.
- **Preset-driven** — teaching and docs pages should prefer presets over ad-hoc scene graphs.
- **Separation from math** — conversion accuracy belongs in color libraries (e.g. Negarity Color); this package visualizes values you provide.
- **Embeddable** — ES + UMD builds for bundlers and WordPress.

## Agent / contributor notes

See **`AGENTS.md`** at the package root for contributor and agent rules.
