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
  // Use a simple approach: normalize and enhance saturation
  const max = Math.max(r, g, b);
  if (max > 1) {
    // Scale down to fit in gamut
    r = r / max;
    g = g / max;
    b = b / max;
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
