# Negarity Color Visualizer

A TypeScript-based, browser-only library for visualizing colors in 2D and 3D.

## Features

- 🎨 **2D and 3D Rendering**: Choose between 2D canvas (Konva) or 3D WebGL (Three.js) rendering
- 📦 **Bundle-Ready**: All dependencies included, ready to use
- 🎯 **OOP API**: Clean, object-oriented API with TypeScript support
- 🎨 **Built-in Presets**: Pre-configured visualizations for RGB, HSL, LAB, and more
- 🔧 **Flexible Configuration**: Customize color spaces, axes, shapes, and display options
- 📱 **Modern Browsers**: Targets ES2020+ browsers

## Installation

```bash
npm install negarity-color-visualizer
```

## Quick Start

```typescript
import { ColorVisualizer, RGB_CUBE_PRESET } from 'negarity-color-visualizer';

// Create a visualizer instance
const container = document.getElementById('visualizer-container');
const visualizer = new ColorVisualizer(container, {
  mode: '3d',
  width: 800,
  height: 600,
  interactive: true,
});

// Render RGB cube
visualizer.render(RGB_CUBE_PRESET);
```

## API

### ColorVisualizer

Main class for creating color visualizations.

#### Constructor

```typescript
new ColorVisualizer(container: HTMLElement | string, config?: Partial<VisualizerConfig>)
```

#### Methods

- `render(preset: PresetConfig)`: Render a preset visualization
- `update(points: ColorPoint[])`: Update visualization with new color points
- `resize(width: number, height: number)`: Resize the visualization
- `setConfig(config: Partial<VisualizerConfig>)`: Update configuration
- `getConfig(): VisualizerConfig`: Get current configuration
- `destroy()`: Clean up resources

## Built-in Presets

- **RGB Cube**: 3D RGB color space visualization
- More presets coming soon...

## Custom Color Spaces

You can define custom color spaces and create your own presets:

```typescript
import { ColorSpace, PresetConfig } from 'negarity-color-visualizer';

const customColorSpace: ColorSpace = {
  name: 'Custom',
  axes: [
    { name: 'x', label: 'X Axis', min: 0, max: 100 },
    { name: 'y', label: 'Y Axis', min: 0, max: 100 },
    { name: 'z', label: 'Z Axis', min: 0, max: 100 },
  ],
};

const customPreset: PresetConfig = {
  name: 'Custom Visualization',
  colorSpace: customColorSpace,
  shape: 'cube',
  size: { width: 100, height: 100, depth: 100 },
  config: {
    mode: '3d',
    showAxes: true,
  },
};
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## License

MIT

## Author

Jalal Jaberi

## Repository

https://github.com/JalalJaberi/negarity-color-visualizer
