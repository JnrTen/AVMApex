/**
 * Color Science Utility
 * Precision CIELAB, Delta-E (CIE76 and CIEDE2000), RGB/Hex conversion,
 * and standard industrial automotive paint catalogs.
 */

export interface LabColor {
  L: number;
  a: number;
  b: number;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaintFormulaItem {
  component: string;
  percentage: number;
  gramsPerLiter: number;
}

export interface PaintStandard {
  code: string;
  name: string;
  system: 'Simple Standard' | 'AVM Standard Fleet' | 'Custom';
  rgb: RgbColor;
  hex: string;
  lab: LabColor;
  finishType: 'High Gloss' | 'Satin' | 'Matte' | 'Metallic';
  formula: PaintFormulaItem[];
  applicationNotes?: string;
}

/**
 * Convert standard sRGB (0-255) to CIELAB (D65 standard illuminant, 2-degree observer)
 */
export function rgbToLab(r: number, g: number, b: number): LabColor {
  // 1. Normalize RGB to 0..1
  let nr = r / 255;
  let ng = g / 255;
  let nb = b / 255;

  // 2. Linearize gamma
  nr = nr > 0.04045 ? Math.pow((nr + 0.055) / 1.055, 2.4) : nr / 12.92;
  ng = ng > 0.04045 ? Math.pow((ng + 0.055) / 1.055, 2.4) : ng / 12.92;
  nb = nb > 0.04045 ? Math.pow((nb + 0.055) / 1.055, 2.4) : nb / 12.92;

  // 3. Convert to XYZ using sRGB D65 matrix
  let x = nr * 0.4124564 + ng * 0.3575761 + nb * 0.1804375;
  let y = nr * 0.2126729 + ng * 0.7151522 + nb * 0.072175;
  let z = nr * 0.0193339 + ng * 0.119192 + nb * 0.9503041;

  // 4. Normalize by D65 reference white (Xn=0.95047, Yn=1.00000, Zn=1.08883)
  x = x / 0.95047;
  y = y / 1.0;
  z = z / 1.08883;

  const pivot = (val: number) => {
    return val > 0.008856 ? Math.cbrt(val) : 7.787 * val + 16 / 116;
  };

  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);

  const L = Math.max(0, Math.min(100, 116 * fy - 16));
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return {
    L: Number(L.toFixed(2)),
    a: Number(a.toFixed(2)),
    b: Number(bVal.toFixed(2)),
  };
}

/**
 * Simple standard automotive & coach paint catalog
 */
export const STANDARD_PAINTS: PaintStandard[] = [
  {
    code: 'White',
    name: 'White',
    system: 'Simple Standard',
    rgb: { r: 255, g: 255, b: 255 },
    hex: '#FFFFFF',
    lab: rgbToLab(255, 255, 255),
    finishType: 'High Gloss',
    formula: [
      { component: '2K Acrylic White Base (WB-100)', percentage: 95.0, gramsPerLiter: 950.0 },
      { component: 'Ochre Yellow Micro-Tint (YT-04)', percentage: 3.0, gramsPerLiter: 30.0 },
      { component: 'Lamp Black Carbon Tint (BT-01)', percentage: 2.0, gramsPerLiter: 20.0 },
    ],
    applicationNotes: 'Standard roof & upper window perimeter coating. 2 wet coats with 10 min flash-off.',
  },
  {
    code: 'Black',
    name: 'Black',
    system: 'Simple Standard',
    rgb: { r: 10, g: 10, b: 10 },
    hex: '#0A0A0A',
    lab: rgbToLab(10, 10, 10),
    finishType: 'High Gloss',
    formula: [
      { component: 'Deep Black Base Resin (BB-900)', percentage: 90.0, gramsPerLiter: 900.0 },
      { component: 'Titanium White Toner (WT-02)', percentage: 7.5, gramsPerLiter: 75.0 },
      { component: 'Phthalo Blue Toner (PT-08)', percentage: 2.5, gramsPerLiter: 25.0 },
    ],
    applicationNotes: 'Chassis underside, wheel arches, and window pillar blackout styling.',
  },
  {
    code: 'Red',
    name: 'Red',
    system: 'Simple Standard',
    rgb: { r: 220, g: 38, b: 38 },
    hex: '#DC2626',
    lab: rgbToLab(220, 38, 38),
    finishType: 'High Gloss',
    formula: [
      { component: 'Signal Red Base Concentrate (RB-300)', percentage: 84.0, gramsPerLiter: 840.0 },
      { component: 'Warm Cadmium Yellow Tint (YT-12)', percentage: 11.0, gramsPerLiter: 110.0 },
      { component: 'Fine Carbon Black Tint (BT-01)', percentage: 5.0, gramsPerLiter: 50.0 },
    ],
    applicationNotes: 'Emergency door surrounds, rear bumper warning strip, and high-visibility livery.',
  },
  {
    code: 'Blue',
    name: 'Blue',
    system: 'Simple Standard',
    rgb: { r: 29, g: 78, b: 216 },
    hex: '#1D4ED8',
    lab: rgbToLab(29, 78, 216),
    finishType: 'High Gloss',
    formula: [
      { component: 'Cobalt Deep Blue Binder (BL-500)', percentage: 88.0, gramsPerLiter: 880.0 },
      { component: 'Titanium Pure White Toner (WT-02)', percentage: 8.0, gramsPerLiter: 80.0 },
      { component: 'Jet Carbon Black Toner (BT-01)', percentage: 4.0, gramsPerLiter: 40.0 },
    ],
    applicationNotes: 'Standard coach waist-rail and side body lower quarter.',
  },
  {
    code: 'Green',
    name: 'Green',
    system: 'Simple Standard',
    rgb: { r: 22, g: 163, b: 74 },
    hex: '#16A34A',
    lab: rgbToLab(22, 163, 74),
    finishType: 'High Gloss',
    formula: [
      { component: 'Phthalo Green Base (GB-600)', percentage: 86.0, gramsPerLiter: 860.0 },
      { component: 'Lemon Yellow Toner (YT-01)', percentage: 10.0, gramsPerLiter: 100.0 },
      { component: 'Opaque Black Toner (BT-01)', percentage: 4.0, gramsPerLiter: 40.0 },
    ],
    applicationNotes: 'Regional transit and agricultural coach fleets.',
  },
  {
    code: 'Yellow',
    name: 'Yellow',
    system: 'Simple Standard',
    rgb: { r: 250, g: 204, b: 21 },
    hex: '#FACC15',
    lab: rgbToLab(250, 204, 21),
    finishType: 'High Gloss',
    formula: [
      { component: 'Chrome Yellow Pigment Base (YB-100)', percentage: 91.0, gramsPerLiter: 910.0 },
      { component: 'Brilliant Orange Tint (OT-03)', percentage: 6.0, gramsPerLiter: 60.0 },
      { component: 'White Opacity Binder (WB-100)', percentage: 3.0, gramsPerLiter: 30.0 },
    ],
    applicationNotes: 'School bus fleets and municipal transit warning livery.',
  },
  {
    code: 'Orange',
    name: 'Orange',
    system: 'Simple Standard',
    rgb: { r: 249, g: 115, b: 22 },
    hex: '#F97316',
    lab: rgbToLab(249, 115, 22),
    finishType: 'High Gloss',
    formula: [
      { component: 'Brilliant Orange Base (OB-200)', percentage: 85.0, gramsPerLiter: 850.0 },
      { component: 'Warm Yellow Toner (YT-02)', percentage: 12.0, gramsPerLiter: 120.0 },
      { component: 'White Binder (WB-100)', percentage: 3.0, gramsPerLiter: 30.0 },
    ],
    applicationNotes: 'High-visibility utility and safety fleet striping.',
  },
  {
    code: 'Grey',
    name: 'Grey',
    system: 'Simple Standard',
    rgb: { r: 128, g: 128, b: 128 },
    hex: '#808080',
    lab: rgbToLab(128, 128, 128),
    finishType: 'High Gloss',
    formula: [
      { component: 'Pure White Acrylic Base (WB-100)', percentage: 75.0, gramsPerLiter: 750.0 },
      { component: 'Lamp Black Dispersion (BT-01)', percentage: 22.0, gramsPerLiter: 220.0 },
      { component: 'Raw Umber Toner (UT-02)', percentage: 3.0, gramsPerLiter: 30.0 },
    ],
    applicationNotes: 'Internal passenger saloon panels, bumpers, and underbody trim.',
  },
  {
    code: 'Silver',
    name: 'Silver / Light Grey',
    system: 'Simple Standard',
    rgb: { r: 233, g: 233, b: 233 },
    hex: '#E9E9E9',
    lab: rgbToLab(233, 233, 233),
    finishType: 'Metallic',
    formula: [
      { component: 'Fine Aluminium Metallic Base (MF-50)', percentage: 90.0, gramsPerLiter: 900.0 },
      { component: 'Pure White Acrylic Base (WB-100)', percentage: 8.0, gramsPerLiter: 80.0 },
      { component: 'Carbon Black Micro-Tint (BT-01)', percentage: 2.0, gramsPerLiter: 20.0 },
    ],
    applicationNotes: 'Roof crown, cant rail, and exterior silver body panels.',
  },
  {
    code: 'Brown',
    name: 'Brown',
    system: 'Simple Standard',
    rgb: { r: 120, g: 53, b: 15 },
    hex: '#78350F',
    lab: rgbToLab(120, 53, 15),
    finishType: 'High Gloss',
    formula: [
      { component: 'Red Iron Oxide Base (RB-800)', percentage: 70.0, gramsPerLiter: 700.0 },
      { component: 'Carbon Black Toner (BT-01)', percentage: 22.0, gramsPerLiter: 220.0 },
      { component: 'Yellow Ochre Toner (YT-04)', percentage: 8.0, gramsPerLiter: 80.0 },
    ],
    applicationNotes: 'Commercial coach luggage bay interior and step-well kickplates.',
  },
];

/**
 * Calculate Delta E (CIE76 Euclidean distance in Lab space)
 */
export function deltaE76(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Number(Math.sqrt(dL * dL + da * da + db * db).toFixed(2));
}

/**
 * Calculate Delta E CIE2000 (CIEDE2000) for highest precision automotive color difference
 */
export function deltaE2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const avgL = (L1 + L2) / 2;
  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (c1 + c2) / 2;

  const g = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
  const a1Prime = a1 * (1 + g);
  const a2Prime = a2 * (1 + g);

  const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
  const avgCPrime = (c1Prime + c2Prime) / 2;

  const h1Prime = (Math.atan2(b1, a1Prime) * 180) / Math.PI + (Math.atan2(b1, a1Prime) < 0 ? 360 : 0);
  const h2Prime = (Math.atan2(b2, a2Prime) * 180) / Math.PI + (Math.atan2(b2, a2Prime) < 0 ? 360 : 0);

  let diffHPrime = h2Prime - h1Prime;
  if (Math.abs(diffHPrime) > 180) {
    diffHPrime -= 360 * Math.sign(diffHPrime);
  }

  const deltaLPrime = L2 - L1;
  const deltaCPrime = c2Prime - c1Prime;
  const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin((diffHPrime * Math.PI) / 360);

  const avgHPrime = Math.abs(h1Prime - h2Prime) > 180 ? (h1Prime + h2Prime + 360) / 2 : (h1Prime + h2Prime) / 2;

  const t =
    1 -
    0.17 * Math.cos(((avgHPrime - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * avgHPrime * Math.PI) / 180) +
    0.32 * Math.cos(((3 * avgHPrime + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * avgHPrime - 63) * Math.PI) / 180);

  const sL = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const sC = 1 + 0.045 * avgCPrime;
  const sH = 1 + 0.015 * avgCPrime * t;

  const deltaTheta = 30 * Math.exp(-Math.pow((avgHPrime - 275) / 25, 2));
  const rC = 2 * Math.sqrt(Math.pow(avgCPrime, 7) / (Math.pow(avgCPrime, 7) + Math.pow(25, 7)));
  const rT = -Math.sin((2 * deltaTheta * Math.PI) / 180) * rC;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const termL = deltaLPrime / (kL * sL);
  const termC = deltaCPrime / (kC * sC);
  const termH = deltaHPrime / (kH * sH);

  const de00 = Math.sqrt(termL * termL + termC * termC + termH * termH + rT * termC * termH);
  return Number(de00.toFixed(2));
}

/**
 * Evaluate pass/fail result based on Delta E automotive refinish tolerance
 */
export function evaluateTolerance(deltaE: number): {
  result: 'PASS' | 'ACCEPTABLE' | 'FAIL';
  badgeColor: string;
  summary: string;
} {
  if (deltaE <= 1.0) {
    return {
      result: 'PASS',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      summary: 'Strict Pass (ΔE ≤ 1.0) — Deviation is imperceptible to the human eye.',
    };
  } else if (deltaE <= 2.0) {
    return {
      result: 'ACCEPTABLE',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
      summary: 'Commercial Refinish Standard (ΔE ≤ 2.0) — Acceptable for coach fleet exterior panels.',
    };
  } else {
    return {
      result: 'FAIL',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
      summary: 'Out of Tolerance (ΔE > 2.0) — Unacceptable color mismatch. Re-tint or re-spray required.',
    };
  }
}

/**
 * Find closest matching standard paint in the database for an arbitrary RGB input
 */
export function findBestPaintMatch(
  rgb: RgbColor,
  standards: PaintStandard[] = STANDARD_PAINTS
): {
  bestMatch: PaintStandard;
  deltaE: number;
  deltaE2000Val: number;
  result: 'PASS' | 'ACCEPTABLE' | 'FAIL';
  rankedMatches: { standard: PaintStandard; deltaE: number }[];
} {
  const measuredLab = rgbToLab(rgb.r, rgb.g, rgb.b);

  const ranked = standards
    .map((std) => {
      const de = deltaE76(measuredLab, std.lab);
      return { standard: std, deltaE: de };
    })
    .sort((a, b) => a.deltaE - b.deltaE);

  const bestMatch = ranked[0].standard;
  const bestDeltaE = ranked[0].deltaE;
  const de00 = deltaE2000(measuredLab, bestMatch.lab);
  const { result } = evaluateTolerance(bestDeltaE);

  return {
    bestMatch,
    deltaE: bestDeltaE,
    deltaE2000Val: de00,
    result,
    rankedMatches: ranked.slice(0, 5),
  };
}

/**
 * Format RGB into CSS hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Parse Hex string to RGB
 */
export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16) || 0,
    g: parseInt(clean.substring(2, 4), 16) || 0,
    b: parseInt(clean.substring(4, 6), 16) || 0,
  };
}
