---
sidebar_position: 1
---

# Types reference

Types are defined in **`src/types/index.ts`** and re-exported from the package root.

## `RenderMode`

```typescript
type RenderMode = '2d' | '3d';
```

## `ColorAxis`

```typescript
interface ColorAxis {
  name: string;
  label: string;
  min: number;
  max: number;
  unit?: string;
}
```

## `ColorSpace`

```typescript
interface ColorSpace {
  name: string;
  axes: ColorAxis[];
  bounds?: { min: number[]; max: number[] };
}
```

## `ColorPoint`

```typescript
interface ColorPoint {
  values: number[];
  color: string; // hex
  label?: string;
}
```

## `VisualizerConfig` {#visualizerconfig}

```typescript
interface VisualizerConfig {
  mode: RenderMode;
  width?: number;
  height?: number;
  backgroundColor?: string;
  showAxes?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  animation?: { enabled: boolean; speed?: number };
  custom?: Record<string, unknown>;
}
```

Omit **`width` / `height`** (or set `undefined`) to follow the **container size** once it has layout.

## `PresetConfig`

```typescript
interface PresetConfig {
  name: string;
  colorSpace: ColorSpace;
  shape?: 'cube' | 'sphere' | 'cylinder' | 'custom';
  size?: { width: number; height: number; depth?: number };
  points?: ColorPoint[];
  config?: Partial<VisualizerConfig>;
}
```

## `IRenderer`

Internal interface implemented by **`Renderer2D`** and **`Renderer3D`**:

```typescript
interface IRenderer {
  init(container: HTMLElement, config: VisualizerConfig): void;
  render(preset: PresetConfig): void;
  update(points: ColorPoint[]): void;
  destroy(): void;
  resize(width: number, height: number): void;
}
```

## Component config types (2D)

Used by **`ColorVisualizer`** update methods — see **`src/components/types.ts`** for fields such as **`CIEBackgroundConfig`**, **`AxesConfig`**, **`MarkerConfig`**, **`HSLHueWheelConfig`**, **`HSVHueWheelConfig`**, **`CMYKGridConfig`**.
