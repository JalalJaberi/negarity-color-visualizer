# Negarity Color Visualizer — agent guide

**Package:** `negarity-color-visualizer`  
**Language:** TypeScript (ES2020+ browsers)  
**Build:** Vite → UMD + ES bundles in `dist/`  
**User docs:** Docusaurus in `docs/` (Node **20+**)

Browser-only companion for **visualizing** color spaces — not a color-science engine. Math for conversions typically comes from `negarity-color` (PHP) or other backends; this lib renders points, axes, and channel controls.

---

## Architecture

```text
ColorExplorer (unified shell)
  ├── ColorVisualizer
  │     ├── Renderer3D (Three.js + orbit controls)
  │     └── Renderer2D (Konva)
  └── ColorChannelVisualizer
        └── per-space channel defs, dependent gradients, preview

presets/   — RGB cube, color-space axis defs
types/     — VisualizerConfig, PresetConfig, ColorPoint, …
```

| Entry | Role |
|-------|------|
| `src/color-explorer/*` | Configurable shell: space/mode chrome, layouts (`auto` / `desktop` / `mobile` / `display`), fixed vs editable controls |
| `src/ColorVisualizer.ts` | Mount, `render(preset)`, `update(points)`, resize, destroy |
| `src/renderers/*` | 2D / 3D backends |
| `src/presets/*` | Built-in spaces & presets (`RGB_CUBE_PRESET`, …) |
| `src/color-channel-visualizer/*` | Slider UI used heavily by Negarity WP converter blocks |
| `src/index.ts` | Public exports |

### Concepts

- **Preset:** declarative description of a space + how to draw it (axes, shapes, markers).
- **Mode:** `2d` vs `3d` selects renderer.
- **ColorChannelVisualizer:** independent widget; maps channel values ↔ preview hex; supports Lab/LCh key casing (`L`/`C` vs `l`/`c`).
- **ColorExplorer:** preferred embed for product UI — one shell, every space; use `layout` + per-control `visible` / `editable` for responsiveness and locked embeds. Demo: `examples/color-explorer.html`.

---

## Agent rules

1. Keep the library **browser-only** — no Node-only APIs in runtime code.
2. Preserve the UMD global expected by WordPress (`NegarityColorVisualizer` / plugin asset path).
3. When changing channel visualizer behavior, verify WP plugin frontend (`negarity-wp` converter / property extractors).
4. After API changes, update `docs/docs/` guides + type reference; rebuild docs.
5. Run `npm run build` (tsc + vite) before shipping `dist/` to the plugin assets folder.

---

## Commands

```bash
npm install
npm run build
npm run type-check
cd docs && npm install && npm start
```

---

## Related

- Workspace: [../AGENTS.md](../AGENTS.md)
- Color math: [../negarity-color/AGENTS.md](../negarity-color/AGENTS.md)
- WP embedding: plugin `assets/js/negarity-color-visualizer.umd.js` and `js/src/frontend/*`
