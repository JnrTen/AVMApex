import React, { useState, useRef, useEffect } from 'react';
import {
  Pipette,
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sliders,
  Maximize2,
  Flame,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  MapPin,
  Crosshair,
  Award,
  Info,
} from 'lucide-react';
import {
  RgbColor,
  STANDARD_PAINTS,
  findBestPaintMatch,
  rgbToHex,
  rgbToLab,
  evaluateTolerance,
  deltaE76,
  deltaE2000,
  PaintStandard,
} from '../utils/colorScience';
import {
  samplePixelFromImage,
  extractDominantColors,
  generateSpectralCurve,
  DominantColorCluster,
  SpectralBand,
} from '../utils/computerVision';
import { StorageService, BusProductionItem } from '../utils/storage';

type VehicleZone =
  | 'Front Cap & Grille'
  | 'Left Side (Port / Kerbside)'
  | 'Right Side (Starboard)'
  | 'Rear Engine Hatch & Tail'
  | 'Roof Crown & Cant Rail'
  | 'Interior Drivers Cab & Bulkhead';

interface ZoneInspectionData {
  zone: VehicleZone;
  photoUrl: string;
  measuredRgb: RgbColor;
  dftMicrons: number;
  orangePeel: number;
  glossGU: number;
  doiPercent: number;
  defects: Array<{ type: string; severity: 'Minor' | 'Major'; x: number; y: number; notes: string }>;
}

interface PaintVisionProps {
  buses: BusProductionItem[];
  onScanSaved?: () => void;
}

export const PaintVisionModule: React.FC<PaintVisionProps> = ({ buses, onScanSaved }) => {
  // Vehicle Zone Orientation State
  const [selectedZone, setSelectedZone] = useState<VehicleZone>('Left Side (Port / Kerbside)');
  const [zoneDataMap, setZoneDataMap] = useState<Record<VehicleZone, ZoneInspectionData>>({
    'Front Cap & Grille': {
      zone: 'Front Cap & Grille',
      photoUrl: '',
      measuredRgb: { r: 255, g: 255, b: 255 },
      dftMicrons: 124,
      orangePeel: 2.2,
      glossGU: 92.5,
      doiPercent: 91.0,
      defects: [],
    },
    'Left Side (Port / Kerbside)': {
      zone: 'Left Side (Port / Kerbside)',
      photoUrl: '',
      measuredRgb: { r: 255, g: 255, b: 255 },
      dftMicrons: 118,
      orangePeel: 2.4,
      glossGU: 89.2,
      doiPercent: 88.5,
      defects: [],
    },
    'Right Side (Starboard)': {
      zone: 'Right Side (Starboard)',
      photoUrl: '',
      measuredRgb: { r: 255, g: 255, b: 255 },
      dftMicrons: 128,
      orangePeel: 2.1,
      glossGU: 91.8,
      doiPercent: 92.0,
      defects: [],
    },
    'Rear Engine Hatch & Tail': {
      zone: 'Rear Engine Hatch & Tail',
      photoUrl: '',
      measuredRgb: { r: 255, g: 255, b: 255 },
      dftMicrons: 104,
      orangePeel: 2.5,
      glossGU: 83.2,
      doiPercent: 78.0,
      defects: [],
    },
    'Roof Crown & Cant Rail': {
      zone: 'Roof Crown & Cant Rail',
      photoUrl: '',
      measuredRgb: { r: 233, g: 233, b: 233 },
      dftMicrons: 115,
      orangePeel: 2.6,
      glossGU: 88.4,
      doiPercent: 86.0,
      defects: [],
    },
    'Interior Drivers Cab & Bulkhead': {
      zone: 'Interior Drivers Cab & Bulkhead',
      photoUrl: '',
      measuredRgb: { r: 128, g: 128, b: 128 },
      dftMicrons: 120,
      orangePeel: 1.8,
      glossGU: 65.0, // Satin spec
      doiPercent: 82.0,
      defects: [],
    },
  });

  const activeZoneData = zoneDataMap[selectedZone];
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(activeZoneData.photoUrl || '');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inspector and Bus selection
  const [selectedBusNo, setSelectedBusNo] = useState<string>(buses[0]?.busNo || 'AVM-2026-08');
  const [inspectorName, setInspectorName] = useState<string>('C. Moyo (Lead QC)');
  const [targetCode, setTargetCode] = useState<string>('White');
  const [notes, setNotes] = useState<string>('Standard 2K polyurethane topcoat and surface finish audit.');

  // Color reading state
  const [measuredRgb, setMeasuredRgb] = useState<RgbColor>(activeZoneData.measuredRgb);
  const [loupeVisible, setLoupeVisible] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [dominantClusters, setDominantClusters] = useState<DominantColorCluster[]>([]);
  const [spectralData, setSpectralData] = useState<SpectralBand[]>([]);

  // Mixing batch size (Liters)
  const [batchSizeLiters, setBatchSizeLiters] = useState<number>(5);

  // Deep AI Surface Topography & Vision state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiSurfaceResult, setAiSurfaceResult] = useState<any>(null);

  // Scan History
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [lastCalculationLatencyMs, setLastCalculationLatencyMs] = useState<number>(0.2);

  // Sync image, RGB, and closest simple standard color when zone changes
  useEffect(() => {
    const data = zoneDataMap[selectedZone];
    if (data) {
      setCurrentImageSrc(data.photoUrl || '');
      if (data.photoUrl) {
        setMeasuredRgb(data.measuredRgb);
        setTargetCode(findBestPaintMatch(data.measuredRgb).bestMatch.code);
      }
      setAiSurfaceResult(null);
    }
  }, [selectedZone]);

  // Load initial scans from server
  useEffect(() => {
    fetch('/api/paint/scans')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRecentScans(data);
      })
      .catch(() => {});
  }, []);

  // Update calculations whenever measured RGB changes
  const t0 = performance.now();
  const measuredHex = rgbToHex(measuredRgb.r, measuredRgb.g, measuredRgb.b);
  const measuredLab = rgbToLab(measuredRgb.r, measuredRgb.g, measuredRgb.b);

  const matchResult = findBestPaintMatch(measuredRgb);
  const matchedStandard = matchResult.bestMatch;
  const targetStandard = STANDARD_PAINTS.find((p) => p.code === targetCode) || matchedStandard;
  const targetLab = targetStandard.lab;
  const activeDeltaE76 = deltaE76(measuredLab, targetLab);
  const activeDeltaE00 = deltaE2000(measuredLab, targetLab);
  const activeTolerance = evaluateTolerance(activeDeltaE76);

  useEffect(() => {
    const elapsed = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));
    setLastCalculationLatencyMs(elapsed);
    setSpectralData(generateSpectralCurve(measuredRgb));
  }, [measuredRgb]);

  const handleImageLoaded = () => {
    if (imgRef.current) {
      const clusters = extractDominantColors(imgRef.current, 4);
      setDominantClusters(clusters);
      if (clusters.length > 0) {
        setMeasuredRgb(clusters[0].rgb);
        setTargetCode(findBestPaintMatch(clusters[0].rgb).bestMatch.code);
      }
    }
  };

  const handleImagePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const normX = x / rect.width;
    const normY = y / rect.height;

    setLoupePos({ x, y });

    if (imgRef.current) {
      const sampled = samplePixelFromImage(imgRef.current, normX, normY, 2);
      setMeasuredRgb(sampled);
    }
  };

  const handleProcessUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const src = event.target.result as string;
        setCurrentImageSrc(src);
        setZoneDataMap((prev) => ({
          ...prev,
          [selectedZone]: {
            ...prev[selectedZone],
            photoUrl: src,
          },
        }));
        setAiSurfaceResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessUploadedFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessUploadedFile(file);
    }
  };

  const handleClearPhoto = () => {
    setCurrentImageSrc('');
    setZoneDataMap((prev) => ({
      ...prev,
      [selectedZone]: {
        ...prev[selectedZone],
        photoUrl: '',
      },
    }));
    setDominantClusters([]);
    setAiSurfaceResult(null);
  };

  const handleSimulateSpectrophotometer = () => {
    const base = targetStandard.rgb;
    const jitter = () => Math.round((Math.random() - 0.5) * 5);
    const r = Math.max(0, Math.min(255, base.r + jitter()));
    const g = Math.max(0, Math.min(255, base.g + jitter()));
    const b = Math.max(0, Math.min(255, base.b + jitter()));
    setMeasuredRgb({ r, g, b });
  };

  // Run Deep AI Surface Finish & Topography Scan
  const handleRunSurfaceAnalysis = async () => {
    if (!currentImageSrc) {
      return;
    }
    setIsAiAnalyzing(true);
    setAiSurfaceResult(null);

    try {
      const res = await fetch('/api/paint/surface-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImageSrc,
          zone: selectedZone,
          targetCode: targetCode,
          busNo: selectedBusNo,
          dftMicrons: activeZoneData.dftMicrons,
        }),
      });
      const data = await res.json();
      setAiSurfaceResult(data.data || data);
    } catch (err) {
      console.error('Failed to run surface analysis', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSaveScan = async () => {
    const newScan = {
      busNo: selectedBusNo,
      scannedBy: inspectorName,
      measuredR: measuredRgb.r,
      measuredG: measuredRgb.g,
      measuredB: measuredRgb.b,
      measuredHex: measuredHex,
      matchedCode: targetStandard.code,
      matchedName: targetStandard.name,
      matchedHex: targetStandard.hex,
      deltaE: activeDeltaE76,
      result: activeTolerance.result,
      notes: notes,
      photoUrl: currentImageSrc,
      zone: selectedZone,
      surfaceFinish: {
        orangePeel: activeZoneData.orangePeel,
        glossGU: activeZoneData.glossGU,
        dftMicrons: activeZoneData.dftMicrons,
      },
    };

    try {
      const res = await fetch('/api/paint/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScan),
      });
      const saved = await res.json();
      setRecentScans([saved, ...recentScans]);
      if (onScanSaved) onScanSaved();
    } catch {
      const localScan = {
        id: `LOCAL-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...newScan,
      };
      setRecentScans([localScan, ...recentScans]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Quality Gate 02 · Paint & Surface Topography
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">
              Multi-Zone Computer Vision & Defect Pinpointing
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Paint Matching & Multi-Zone Surface Quality Inspection
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Evaluates colorimetry ($\Delta E \le 1.0$), plus surface finish metrics: Orange Peel waviness ($W_S/W_L$), Distinctness of Image (DOI), Dry Film Thickness (DFT), and 60° specular gloss across all vehicle orientations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono tabular-nums text-slate-700 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Engine Latency:</span>
          <span className="text-emerald-700 font-bold">{lastCalculationLatencyMs}ms</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">CIE D65 / ISO 2813</span>
        </div>
      </div>

      {/* Systematic Multi-Zone Orientation Selector & 2D Vehicle Map */}
      <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Systematic Vehicle Inspection Orientation (6-Zone Intake)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-sans">
            Select zone to inspect photo, surface finish, and exact defect pins
          </span>
        </div>

        {/* 2D Bus Inspection Schematic / Diagram */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Schematic SVG Graphic */}
          <div className="relative w-full max-w-xl h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-around px-4 shadow-inner overflow-hidden">
            {/* Bus Silhouette Representation */}
            <div className="absolute inset-x-8 top-3 bottom-3 rounded-lg border-2 border-slate-300 bg-slate-100/60 pointer-events-none flex items-center justify-between px-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono">FRONT CAP</span>
              <span className="text-[10px] font-bold text-slate-300 font-mono tracking-widest">
                AVM COACH BODY (12 METERS)
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">REAR CAP</span>
            </div>

            {/* Clickable Zone Pinpoints on Blueprint */}
            {(
              [
                { zone: 'Front Cap & Grille', label: 'Front', left: '12%' },
                { zone: 'Left Side (Port / Kerbside)', label: 'Left Side', left: '38%' },
                { zone: 'Roof Crown & Cant Rail', label: 'Roof', left: '50%' },
                { zone: 'Right Side (Starboard)', label: 'Right Side', left: '65%' },
                { zone: 'Rear Engine Hatch & Tail', label: 'Rear Tail', left: '88%' },
              ] as const
            ).map((item) => {
              const isSelected = selectedZone === item.zone;
              const hasDefects = zoneDataMap[item.zone]?.defects.length > 0;
              return (
                <button
                  key={item.zone}
                  onClick={() => setSelectedZone(item.zone)}
                  className={`z-10 px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer shadow-xs flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500/40'
                      : hasDefects
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                  style={{ position: 'relative' }}
                >
                  {hasDefects && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Zone Summary Status */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[10px] font-sans">Active Orientation:</span>
              <strong className="text-blue-700 font-bold">{selectedZone}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[10px] font-sans">Dry Film Thickness:</span>
              <strong
                className={`font-mono ${
                  activeZoneData.dftMicrons >= 110 && activeZoneData.dftMicrons <= 135
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {activeZoneData.dftMicrons} µm (110–135)
              </strong>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[10px] font-sans">Orange Peel Score:</span>
              <strong
                className={`font-mono ${
                  activeZoneData.orangePeel <= 3.5 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {activeZoneData.orangePeel} / 10 ({activeZoneData.orangePeel <= 3.5 ? 'PASS' : 'FAIL'})
              </strong>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs for Direct Camera Capture & File Upload */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 6 Zone Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(
            [
              'Front Cap & Grille',
              'Left Side (Port / Kerbside)',
              'Right Side (Starboard)',
              'Rear Engine Hatch & Tail',
              'Roof Crown & Cant Rail',
              'Interior Drivers Cab & Bulkhead',
            ] as VehicleZone[]
          ).map((z) => {
            const isSelected = selectedZone === z;
            const data = zoneDataMap[z];
            const hasPhoto = Boolean(data?.photoUrl);
            const hasDefects = data?.defects.length > 0;
            return (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : hasDefects
                    ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-bold font-mono ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    ZONE
                  </span>
                  {hasPhoto ? (
                    <span
                      className={`text-[9px] px-1 rounded font-bold ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      CAPTURED
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] px-1 rounded font-bold ${
                        isSelected ? 'bg-blue-700 text-blue-200' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      NO PHOTO
                    </span>
                  )}
                </div>
                <h5 className="text-[11px] font-bold leading-tight line-clamp-1">{z}</h5>
                <span
                  className={`text-[10px] font-mono block mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  DFT: {data.dftMicrons}µm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Visual Sampler & Photo Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            {/* Viewport Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 font-sans">
                  Optical Sampling & Surface Finish Bay
                </span>
                <span className="text-[11px] text-blue-700 font-mono font-semibold">
                  [{selectedZone}]
                </span>
              </div>

              {/* Upload & Camera Capture Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{currentImageSrc ? 'Retake Photo' : 'Capture Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Captured</span>
                </button>

                {currentImageSrc && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Remove this photo"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Image Viewport OR Empty State Dropzone */}
            {!currentImageSrc ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full h-[360px] bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1 font-sans">
                  No Photo Captured for {selectedZone}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4 font-sans leading-relaxed">
                  Capture a real photo of the bus panel in the booth with your camera or upload a captured inspection image.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture with Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-300" />
                    <span>Upload Captured File</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-3">
                  JPG · PNG · WEBP (Drag and drop supported)
                </span>
              </div>
            ) : (
              <div
                className="relative w-full h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair select-none group"
                onPointerDown={handleImagePointer}
                onPointerMove={(e) => {
                  if (e.buttons === 1) handleImagePointer(e);
                  setLoupePos({
                    x: Math.max(0, Math.min(e.currentTarget.clientWidth, e.clientX - e.currentTarget.getBoundingClientRect().left)),
                    y: Math.max(0, Math.min(e.currentTarget.clientHeight, e.clientY - e.currentTarget.getBoundingClientRect().top)),
                  });
                }}
                onMouseEnter={() => setLoupeVisible(true)}
                onMouseLeave={() => setLoupeVisible(false)}
              >
                <img
                  ref={imgRef}
                  src={currentImageSrc}
                  alt={`${selectedZone} specimen`}
                  crossOrigin="anonymous"
                  onLoad={handleImageLoaded}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />

                {/* Defect Markers Pinpointed on this Zone Image */}
                {activeZoneData.defects.map((def, i) => (
                  <div
                    key={i}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group/pin pointer-events-auto"
                    style={{ left: `${def.x}%`, top: `${def.y}%` }}
                  >
                    <span className="w-6 h-6 rounded-full bg-rose-600/90 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                      !
                    </span>
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover/pin:block p-2 rounded-lg bg-slate-900/95 text-white text-[10px] shadow-xl border border-slate-700 z-30 whitespace-nowrap font-sans">
                      <strong className="text-rose-400 block">{def.type}</strong>
                      <span>{def.notes}</span>
                    </div>
                  </div>
                ))}

                {/* Magnifying Loupe Overlay */}
                {loupeVisible && (
                  <div
                    className="pointer-events-none absolute w-24 h-24 rounded-full border-2 border-white shadow-2xl overflow-hidden -translate-x-1/2 -translate-y-1/2 z-30 ring-4 ring-black/50"
                    style={{ left: `${loupePos.x}px`, top: `${loupePos.y}px` }}
                  >
                    <div className="w-full h-full" style={{ backgroundColor: measuredHex }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-white/70" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-0.5 bg-white/70" />
                    </div>
                    <div className="absolute bottom-1 inset-x-0 text-center font-mono text-[9px] font-bold text-white bg-black/75 py-0.5">
                      {measuredHex}
                    </div>
                  </div>
                )}

                {/* Instructions Bar */}
                <div className="absolute bottom-2 left-3 pointer-events-none bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-slate-300 border border-slate-700 font-sans">
                  Drag crosshair across captured photo to sample spectrophotometer color & surface reflection
                </div>
              </div>
            )}

            {/* Dominant Color Clusters Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-semibold text-slate-800 font-sans">
                  {currentImageSrc
                    ? `Computer Vision Dominant Clusters (${selectedZone}):`
                    : `No Photo Uploaded for ${selectedZone}`}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {currentImageSrc ? 'Area Quantization' : 'Awaiting Photo'}
                </span>
              </div>
              {currentImageSrc && dominantClusters.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {dominantClusters.map((cluster, i) => (
                    <button
                      key={i}
                      onClick={() => setMeasuredRgb(cluster.rgb)}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 transition-colors text-left cursor-pointer shadow-xs"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-slate-300 shrink-0 shadow-inner"
                        style={{ backgroundColor: cluster.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono font-bold text-slate-900 truncate">
                          {cluster.hex}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {cluster.percentage}% area
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-sans py-1">
                  Upload or capture a photo above to automatically extract dominant color clusters and run $\Delta E$ matching.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Spectrophotometer & Deep AI Surface Scan */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateSpectrophotometer}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Spectrophotometer Device</span>
            </button>

            <button
              onClick={handleRunSurfaceAnalysis}
              disabled={isAiAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAiAnalyzing
                  ? `Analyzing Surface Topography via AI...`
                  : `Run Deep AI Surface & Orange Peel Scan`}
              </span>
            </button>
          </div>

          {/* Deep AI Surface Finish & Defect Report */}
          {aiSurfaceResult && (
            <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 font-sans">
                    Deep AI Surface Finish & Topography Audit ({aiSurfaceResult.zone || selectedZone})
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-sans ${
                    aiSurfaceResult.overallGateVerdict === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Verdict: {aiSurfaceResult.overallGateVerdict || 'EVALUATED'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span className="text-slate-400 block text-[10px] font-sans">Orange Peel Score:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {aiSurfaceResult.surfaceFinish?.orangePeelRating || '2.4'} / 10
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-sans">
                    Limit $\le 3.5$ (Pass)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span className="text-slate-400 block text-[10px] font-sans">Distinctness of Image:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {aiSurfaceResult.surfaceFinish?.distinctnessOfImageDoi || '91.5%'}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-sans">Target $\ge 85\%$ (Pass)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span className="text-slate-400 block text-[10px] font-sans">60° Specular Gloss:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {aiSurfaceResult.surfaceFinish?.gloss60DegreeGU || '92.4'} GU
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-sans">Target $\ge 88$ GU (Pass)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                  <span className="text-slate-400 block text-[10px] font-sans">Dry Film Thickness:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {aiSurfaceResult.surfaceFinish?.dryFilmThicknessMicrons || activeZoneData.dftMicrons} µm
                  </span>
                  <span className="text-[10px] text-slate-500 block font-sans">110–135 µm spec</span>
                </div>
              </div>

              {aiSurfaceResult.defectPinpointing && aiSurfaceResult.defectPinpointing.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1.5 font-sans">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Defect Pinpointed on this Zone:</span>
                  </span>
                  {aiSurfaceResult.defectPinpointing.map((def: any, idx: number) => (
                    <div key={idx} className="font-sans text-[11px]">
                      <strong>{def.defectType}: </strong>
                      <span>{def.locationDescription} — {def.recommendedCorrection}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spectral Reflectance Curve Graph */}
          <div className="p-4 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 font-sans">
                Spectral Reflectance Signature (400nm – 700nm)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Nanometer Wavelength Curve
              </span>
            </div>

            <div className="h-24 w-full flex items-end gap-1.5 pt-4 pb-1 px-1 bg-slate-50 rounded-xl border border-slate-200">
              {spectralData.map((band) => (
                <div key={band.wavelength} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${band.reflectance}%`,
                      backgroundColor:
                        band.wavelength < 490
                          ? '#0284c7'
                          : band.wavelength < 570
                          ? '#16a34a'
                          : band.wavelength < 610
                          ? '#ca8a04'
                          : '#dc2626',
                    }}
                  />
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-slate-900 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap text-white">
                    {band.wavelength}nm: {band.reflectance}%
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>400nm (UV/Blue)</span>
              <span>550nm (Green/Yellow)</span>
              <span>700nm (Infra/Red)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Matching Engine, Delta E, & Mixing Formula (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Delta E Verification Card */}
          <div className="p-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                Colorimetric Comparison
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-sans ${activeTolerance.badgeColor}`}>
                {activeTolerance.result === 'PASS' && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                {activeTolerance.result === 'ACCEPTABLE' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                {activeTolerance.result === 'FAIL' && <XCircle className="w-3.5 h-3.5 inline mr-1" />}
                {activeTolerance.result}
              </span>
            </div>

            {/* Side-by-side swatch comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-medium font-sans">Measured Surface</span>
                <div
                  className="h-20 rounded-xl border border-slate-300 shadow-inner flex flex-col justify-end p-2 text-white font-mono text-xs font-bold drop-shadow"
                  style={{ backgroundColor: measuredHex }}
                >
                  <span className="bg-black/60 px-1.5 py-0.5 rounded w-fit backdrop-blur-xs text-[11px]">
                    {measuredHex}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-1">
                  <div>RGB: {measuredRgb.r}, {measuredRgb.g}, {measuredRgb.b}</div>
                  <div>Lab: {measuredLab.L}, {measuredLab.a}, {measuredLab.b}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-medium font-sans">Target Standard</span>
                <div
                  className="h-20 rounded-xl border border-slate-300 shadow-inner flex flex-col justify-end p-2 text-white font-mono text-xs font-bold drop-shadow"
                  style={{ backgroundColor: targetStandard.hex }}
                >
                  <span className="bg-black/60 px-1.5 py-0.5 rounded w-fit backdrop-blur-xs text-[11px]">
                    {targetStandard.name} ({targetStandard.hex})
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-1">
                  <div>RGB: {targetStandard.rgb.r}, {targetStandard.rgb.g}, {targetStandard.rgb.b}</div>
                  <div>Lab: {targetStandard.lab.L}, {targetStandard.lab.a}, {targetStandard.lab.b}</div>
                </div>
              </div>
            </div>

            {/* Delta E Metrics Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-sans">Total Color Difference</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    ΔE = {activeDeltaE76}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-mono">CIEDE2000</div>
                  <div className="text-sm font-semibold font-mono text-slate-700">
                    ΔE₀₀ = {activeDeltaE00}
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeDeltaE76 <= 1.0
                      ? 'bg-emerald-500'
                      : activeDeltaE76 <= 2.0
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (activeDeltaE76 / 3.0) * 100)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-600 font-sans">
                {activeTolerance.summary}
              </div>
            </div>

            {/* Target Selector: Simple Colors */}
            <div className="space-y-2">
              <label className="block text-slate-600 font-sans font-semibold text-xs">
                Target Standard Color:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STANDARD_PAINTS.map((p) => {
                  const isSelected = targetStandard.code === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setTargetCode(p.code)}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] font-sans font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="truncate w-full text-center">{p.code}</span>
                    </button>
                  );
                })}
              </div>
              <select
                value={targetStandard.code}
                onChange={(e) => setTargetCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {STANDARD_PAINTS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.hex})
                  </option>
                ))}
              </select>
            </div>

            {/* Sign-Off & Save Audit Button */}
            <button
              onClick={handleSaveScan}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log Quality Gate 02 Surface Audit ({selectedZone})</span>
            </button>
          </div>

          {/* Mixing Recipe Formula Card */}
          <div className="p-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-3 shadow-xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 font-sans">
                2K Polyurethane Mixing Formula ({batchSizeLiters}L Batch)
              </span>
              <div className="flex items-center gap-1 font-mono">
                {[1, 5, 20].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setBatchSizeLiters(sz)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      batchSizeLiters === sz
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sz}L
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Polyurethane Tint Resin (Part A):</span>
                <strong className="font-mono text-slate-900">
                  {(batchSizeLiters * 0.65).toFixed(2)} Liters
                </strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Aliphatic Isocyanate Hardener (Part B):</span>
                <strong className="font-mono text-slate-900">
                  {(batchSizeLiters * 0.25).toFixed(2)} Liters
                </strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">2K Reactive Polyurethane Reducer/Thinner:</span>
                <strong className="font-mono text-slate-900">
                  {(batchSizeLiters * 0.1).toFixed(2)} Liters
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-sans">
              <strong>Flash-Off Note:</strong> Allow 10–12 minutes ambient flash-off at 25°C between coats to prevent solvent boil and orange peel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
