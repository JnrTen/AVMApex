/**
 * Computer Vision Paint Analysis Utility
 * Fast client-side image processing, pixel loupe, kernel smoothing,
 * dominant color clustering, and spectrophotometer simulation.
 */

import { RgbColor, rgbToHex, rgbToLab } from './colorScience';

export interface SamplePoint {
  id: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  rgb: RgbColor;
  hex: string;
  label: string;
}

export interface DominantColorCluster {
  rgb: RgbColor;
  hex: string;
  percentage: number;
  label: string;
}

export interface SpectralBand {
  wavelength: number; // in nm, e.g. 400, 420, 440 ... 700
  reflectance: number; // 0..100%
}

/**
 * Sample RGB color from an HTMLImageElement or Canvas at normalized coordinates
 * with optional spatial box kernel averaging to filter specular noise
 */
export function samplePixelFromImage(
  img: HTMLImageElement,
  normX: number,
  normY: number,
  kernelRadius: number = 3
): RgbColor {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { r: 128, g: 128, b: 128 };

  ctx.drawImage(img, 0, 0);

  const px = Math.floor(normX * canvas.width);
  const py = Math.floor(normY * canvas.height);

  const startX = Math.max(0, px - kernelRadius);
  const startY = Math.max(0, py - kernelRadius);
  const endX = Math.min(canvas.width - 1, px + kernelRadius);
  const endY = Math.min(canvas.height - 1, py + kernelRadius);

  const w = endX - startX + 1;
  const h = endY - startY + 1;

  const imgData = ctx.getImageData(startX, startY, w, h);
  const data = imgData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count++;
  }

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}

/**
 * Extract top dominant colors from an image using fast downsampled k-means / bucket clustering
 */
export function extractDominantColors(
  img: HTMLImageElement,
  maxClusters: number = 5
): DominantColorCluster[] {
  const canvas = document.createElement('canvas');
  const sampleDim = 120; // 120x120 for sub-10ms response
  canvas.width = sampleDim;
  canvas.height = sampleDim;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, sampleDim, sampleDim);
  const imgData = ctx.getImageData(0, 0, sampleDim, sampleDim).data;

  // Quantize into 32-value buckets (8 levels per channel: 512 total bins)
  const bins: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
  let validPixels = 0;

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];

    // Filter extreme blown-out specular glare (r,g,b > 250) or deep crevices (< 10)
    const brightness = (r + g + b) / 3;
    if (brightness > 248 || brightness < 12) continue;

    // Bucket key
    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    const key = `${qr}_${qg}_${qb}`;

    if (!bins[key]) {
      bins[key] = { r: 0, g: 0, b: 0, count: 0 };
    }
    bins[key].r += r;
    bins[key].g += g;
    bins[key].b += b;
    bins[key].count++;
    validPixels++;
  }

  if (validPixels === 0) {
    return [
      {
        rgb: { r: 255, g: 255, b: 255 },
        hex: '#FFFFFF',
        percentage: 100,
        label: 'Dominant Coating',
      },
    ];
  }

  const sortedBins = Object.values(bins).sort((a, b) => b.count - a.count);
  const topBins = sortedBins.slice(0, maxClusters);

  return topBins.map((bin, index) => {
    const r = Math.round(bin.r / bin.count);
    const g = Math.round(bin.g / bin.count);
    const b = Math.round(bin.b / bin.count);
    const percentage = Number(((bin.count / validPixels) * 100).toFixed(1));
    return {
      rgb: { r, g, b },
      hex: rgbToHex(r, g, b),
      percentage,
      label: index === 0 ? 'Primary Panel Coating' : `Accent / Shadow Variant ${index}`,
    };
  });
}

/**
 * Generate simulated spectrophotometer spectral reflectance curve (400nm - 700nm at 20nm intervals)
 * based on measured RGB and Lab values
 */
export function generateSpectralCurve(rgb: RgbColor): SpectralBand[] {
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const wavelengths = [400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700];

  const normR = rgb.r / 255;
  const normG = rgb.g / 255;
  const normB = rgb.b / 255;

  return wavelengths.map((wl) => {
    let reflectance = 0;
    // Blue spectrum: 400 - 490 nm
    if (wl < 500) {
      const weight = 1 - Math.abs(wl - 450) / 100;
      reflectance = normB * Math.max(0, weight) * 75 + (lab.L / 100) * 20;
    }
    // Green spectrum: 500 - 580 nm
    else if (wl < 600) {
      const weight = 1 - Math.abs(wl - 540) / 80;
      reflectance = normG * Math.max(0, weight) * 80 + (lab.L / 100) * 20;
    }
    // Red/Orange spectrum: 600 - 700 nm
    else {
      const weight = 1 - Math.abs(wl - 660) / 100;
      reflectance = normR * Math.max(0, weight) * 85 + (lab.L / 100) * 15;
    }

    // Add mild physical noise (sensor jitter +- 1.5%)
    const jitter = (Math.sin(wl * 13) * 1.5);
    const finalVal = Math.min(100, Math.max(2, Math.round(reflectance + jitter)));

    return { wavelength: wl, reflectance: finalVal };
  });
}
