/**
 * Color conversion utilities
 */

/**
 * Convert RGB (0-255) to linear RGB (0-1)
 */
export function rgbToLinear(r: number, g: number, b: number): [number, number, number] {
  const linearize = (val: number): number => {
    const normalized = val / 255;
    return normalized > 0.04045
      ? Math.pow((normalized + 0.055) / 1.055, 2.4)
      : normalized / 12.92;
  };

  return [linearize(r), linearize(g), linearize(b)];
}

/**
 * Convert linear RGB to XYZ (sRGB D65)
 * Returns XYZ values scaled to 0-100
 */
export function linearRgbToXyz(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  // sRGB to XYZ conversion matrix (D65 illuminant)
  const matrix = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041],
  ];

  const x = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
  const y = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
  const z = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];

  // Scale to 0-100
  return [x * 100, y * 100, z * 100];
}

/**
 * Convert RGB (0-255) directly to XYZ
 */
export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const [lr, lg, lb] = rgbToLinear(r, g, b);
  return linearRgbToXyz(lr, lg, lb);
}

/**
 * Convert XYZ to xy chromaticity coordinates
 * Returns [x, y] where x and y are in range 0-1
 */
export function xyzToXy(x: number, y: number, z: number): [number, number] {
  const sum = x + y + z;
  if (sum === 0) {
    return [0, 0];
  }
  return [x / sum, y / sum];
}

/**
 * Convert RGB to xy chromaticity coordinates
 */
export function rgbToXy(r: number, g: number, b: number): [number, number] {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToXy(x, y, z);
}

/**
 * Get RGB gamut triangle vertices in xy space
 * Returns the three primary colors (Red, Green, Blue) as xy coordinates
 */
export function getRgbGamutVertices(): Array<[number, number]> {
  // sRGB primaries in xy chromaticity space
  // These are the actual xy coordinates of the RGB primaries
  return [
    [0.64, 0.33], // Red
    [0.30, 0.60], // Green
    [0.15, 0.06], // Blue
  ];
}

/**
 * Get the white point (D65) in xy space
 */
export function getD65WhitePoint(): [number, number] {
  return [0.3127, 0.3290];
}

/**
 * Get spectral locus points (visible spectrum boundary)
 * Returns array of [x, y] coordinates for wavelengths 380-780nm
 */
export function getSpectralLocus(): Array<[number, number]> {
  // CIE 1931 2-degree observer spectral locus (simplified)
  // These are key points along the visible spectrum
  return [
    [0.1741, 0.0050], // 380nm (violet)
    [0.1738, 0.0049],
    [0.1736, 0.0048],
    [0.1733, 0.0048],
    [0.1730, 0.0048],
    [0.1726, 0.0048],
    [0.1721, 0.0049],
    [0.1714, 0.0051],
    [0.1703, 0.0057],
    [0.1689, 0.0069],
    [0.1669, 0.0086],
    [0.1644, 0.0109],
    [0.1611, 0.0138],
    [0.1566, 0.0177],
    [0.1510, 0.0227],
    [0.1440, 0.0297],
    [0.1355, 0.0399],
    [0.1241, 0.0578],
    [0.1096, 0.0868],
    [0.0913, 0.1327],
    [0.0687, 0.2007],
    [0.0454, 0.2950],
    [0.0235, 0.4127],
    [0.0082, 0.5384],
    [0.0039, 0.6548],
    [0.0139, 0.7502],
    [0.0389, 0.8120],
    [0.0743, 0.8338],
    [0.1142, 0.8262],
    [0.1547, 0.8059],
    [0.1929, 0.7816],
    [0.2296, 0.7543],
    [0.2658, 0.7243],
    [0.3016, 0.6923],
    [0.3373, 0.6589],
    [0.3731, 0.6245],
    [0.4087, 0.5896],
    [0.4441, 0.5547],
    [0.4788, 0.5202],
    [0.5125, 0.4866],
    [0.5448, 0.4544],
    [0.5752, 0.4242],
    [0.6029, 0.3965],
    [0.6270, 0.3725],
    [0.6482, 0.3514],
    [0.6658, 0.3340],
    [0.6801, 0.3197],
    [0.6915, 0.3083],
    [0.7006, 0.2993],
    [0.7079, 0.2920],
    [0.7140, 0.2859],
    [0.7190, 0.2809],
    [0.7230, 0.2770],
    [0.7260, 0.2740],
    [0.7283, 0.2717],
    [0.7300, 0.2700],
    [0.7311, 0.2689],
    [0.7320, 0.2680],
    [0.7327, 0.2673],
    [0.7334, 0.2666],
    [0.7340, 0.2660],
    [0.7344, 0.2656],
    [0.7346, 0.2654],
    [0.7347, 0.2653],
    [0.7347, 0.2653], // 780nm (red)
  ];
}

/**
 * Convert xy chromaticity to approximate RGB color
 * Note: This is an approximation and may produce out-of-gamut colors
 */
export function xyToRgb(x: number, y: number, Y: number = 1.0): [number, number, number] {
  // Handle edge cases
  if (y === 0 || x + y > 1) {
    return [128, 128, 128]; // Gray for invalid coordinates
  }

  // Convert xyY to XYZ
  const X = (x / y) * Y;
  const Z = ((1 - x - y) / y) * Y;

  // Convert XYZ to linear RGB (inverse of sRGB matrix)
  const matrix = [
    [3.2404542, -1.5371385, -0.4985314],
    [-0.9692660, 1.8760108, 0.0415560],
    [0.0556434, -0.2040259, 1.0572252],
  ];

  let r = X * matrix[0][0] + Y * matrix[0][1] + Z * matrix[0][2];
  let g = X * matrix[1][0] + Y * matrix[1][1] + Z * matrix[1][2];
  let b = X * matrix[2][0] + Y * matrix[2][1] + Z * matrix[2][2];

  // For out-of-gamut colors, we need to map them to displayable colors
  // Use a simple approach: normalize and enhance saturation for vivid colors
  const max = Math.max(r, g, b);
  if (max > 1) {
    // Scale down to fit in gamut, but preserve saturation
    r = r / max;
    g = g / max;
    b = b / max;
  }

  // Enhance saturation for more vivid colors
  // Find the minimum component to calculate saturation
  const min = Math.min(r, g, b);
  const saturation = max > 0 ? 1 - min / max : 0;
  
  // Boost saturation for more vivid colors (especially for pure colors)
  if (saturation > 0.1) {
    const boostFactor = 1.2; // Boost saturation by 20%
    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * boostFactor;
    g = avg + (g - avg) * boostFactor;
    b = avg + (b - avg) * boostFactor;
    
    // Re-normalize if needed
    const newMax = Math.max(r, g, b);
    if (newMax > 1) {
      r = r / newMax;
      g = g / newMax;
      b = b / newMax;
    }
  }

  // Apply gamma correction
  const gammaCorrect = (val: number): number => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    } else {
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    }
  };

  // Don't clamp too aggressively - allow some oversaturation for visualization
  let rGamma = gammaCorrect(Math.max(-0.5, Math.min(1.5, r)));
  let gGamma = gammaCorrect(Math.max(-0.5, Math.min(1.5, g)));
  let bGamma = gammaCorrect(Math.max(-0.5, Math.min(1.5, b)));

  // Normalize to 0-255 range, but allow some oversaturation
  const normalize = (val: number): number => {
    if (val < 0) return 0;
    if (val > 1) return 255;
    return Math.round(val * 255);
  };

  return [
    normalize(rGamma),
    normalize(gGamma),
    normalize(bGamma),
  ];
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, v * 100];
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = g = b = 0;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const k = 1 - Math.max(r, g, b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return [c * 100, m * 100, y * 100, k * 100];
}

/**
 * Convert CMYK to RGB
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  c = c / 100;
  m = m / 100;
  y = y / 100;
  k = k / 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return [Math.round(r), Math.round(g), Math.round(b)];
}

/**
 * Convert XYZ to Lab (D65 illuminant)
 */
export function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 white point
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  x = x / xn;
  y = y / yn;
  z = z / zn;

  const f = (t: number): number => {
    if (t > 0.008856) {
      return Math.pow(t, 1 / 3);
    } else {
      return (7.787 * t + 16 / 116);
    }
  };

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [l, a, b];
}

/**
 * Convert Lab to XYZ (D65 illuminant)
 */
export function labToXyz(l: number, a: number, b: number): [number, number, number] {
  // D65 white point
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const f = (t: number): number => {
    const t3 = Math.pow(t, 3);
    if (t3 > 0.008856) {
      return t3;
    } else {
      return (t - 16 / 116) / 7.787;
    }
  };

  const x = f(fx) * xn;
  const y = f(fy) * yn;
  const z = f(fz) * zn;

  return [x, y, z];
}

/**
 * Convert Lab to LCh
 */
export function labToLch(l: number, a: number, b: number): [number, number, number] {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [l, c, h];
}

/**
 * Convert LCh to Lab
 */
export function lchToLab(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  return [l, a, b];
}

/**
 * Convert RGB to YCbCr (ITU-R BT.601)
 */
export function rgbToYcbcr(r: number, g: number, b: number): [number, number, number] {
  const y = 16 + (65.481 * r + 128.553 * g + 24.966 * b) / 255;
  const cb = 128 + (-37.797 * r - 74.203 * g + 112.0 * b) / 255;
  const cr = 128 + (112.0 * r - 93.786 * g - 18.214 * b) / 255;

  return [Math.round(y), Math.round(cb), Math.round(cr)];
}

/**
 * Convert YCbCr to RGB (ITU-R BT.601)
 */
export function ycbcrToRgb(y: number, cb: number, cr: number): [number, number, number] {
  y = y - 16;
  cb = cb - 128;
  cr = cr - 128;

  const r = 255 * (y / 255 + 1.402 * cr / 255);
  const g = 255 * (y / 255 - 0.344136 * cb / 255 - 0.714136 * cr / 255);
  const b = 255 * (y / 255 + 1.772 * cb / 255);

  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b))),
  ];
}
