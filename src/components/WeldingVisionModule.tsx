import React, { useState, useRef } from 'react';
import {
  Flame,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Sliders,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  ZoomIn,
  Eye,
  Info,
  ChevronDown,
} from 'lucide-react';
import { BusProductionItem, DefectItem, QualityCheckpointItem } from '../utils/storage';
import { useAuth } from '../firebase/authContext';
import { FirestoreService } from '../firebase/firestoreService';

// Sample weld benchmark images
import samplePerfectWeld from '../assets/images/weld_perfect_1790614355577.jpg';
import samplePorosityWeld from '../assets/images/weld_porosity_1790614367798.jpg';

interface WeldingVisionModuleProps {
  buses: BusProductionItem[];
  onAddDefect?: (defect: DefectItem) => void;
  onAddCheckpoint?: (cp: QualityCheckpointItem) => void;
}

interface DefectRegion {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface WeldAnalysisData {
  verdict: 'PERFECT' | 'ACCEPTABLE' | 'REJECT';
  qualityScore: number;
  beadCharacteristics: {
    profile: string;
    uniformity: string;
    toeTransition: string;
    spatterLevel: 'None' | 'Minimal' | 'Moderate' | 'Excessive';
  };
  flawsDetected: string[];
  primaryDefectCode: string | null;
  rootCauseAnalysis: string;
  wpsAdjustments: {
    voltage: string;
    wireFeed: string;
    gasShielding: string;
    technique: string;
  };
  remediationAction: string;
  defectRegions: DefectRegion[];
  inspectorSummary: string;
}

const JOINT_TYPES = [
  'Chassis Outrigger Fillet Weld (MIG 82/18)',
  'Main Longitudinal Beam Butt Joint (AWS D1.1)',
  'Rollcage Roof Bow Tubular Gusset',
  'Galvaneal Cladding Plug Weld',
  'Front Axle Hanger Mounting Bracket',
  'Fuel Tank Saddle Cradle Seam',
];

export const WeldingVisionModule: React.FC<WeldingVisionModuleProps> = ({
  buses,
  onAddDefect,
  onAddCheckpoint,
}) => {
  const { user } = useAuth();

  const [selectedBusNo, setSelectedBusNo] = useState<string>(
    buses[0]?.busNo || 'AVM-2026-08'
  );
  const [selectedJointType, setSelectedJointType] = useState<string>(JOINT_TYPES[0]);
  const [welderId, setWelderId] = useState<string>('Bay 1 - K. Phiri (Cert AWS-04)');

  const [imagePreview, setImagePreview] = useState<string>(samplePerfectWeld);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<WeldAnalysisData | null>(null);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [loggedStatus, setLoggedStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null);
        setLoggedStatus(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setImagePreview(sampleUrl);
    setAnalysisResult(null);
    setLoggedStatus(null);
  };

  const handleRunInspection = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setLoggedStatus(null);

    try {
      const res = await fetch('/api/gemini/inspect-weld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: 'image/jpeg',
          jointType: selectedJointType,
          busNo: selectedBusNo,
          welderId,
        }),
      });

      const data = await res.json();
      if (data.data) {
        setAnalysisResult(data.data);
      }
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogToStage1Checkpoint = () => {
    if (!analysisResult) return;
    const isPass = analysisResult.verdict === 'PERFECT' || analysisResult.verdict === 'ACCEPTABLE';

    const newCheckpoint: QualityCheckpointItem = {
      id: `WELD-QC-${Date.now()}`,
      busNo: selectedBusNo,
      stageGate: 'Stage 1: Chassis Welding',
      inspector: user?.displayName || 'Lead QC Welder (CWI)',
      date: new Date().toISOString().slice(0, 10),
      result: isPass ? 'PASS' : 'FAIL',
      redTagIssued: !isPass,
      redTagNo: !isPass ? `TAG-W-${Date.now().toString().slice(-4)}` : undefined,
      redTagReason: !isPass ? analysisResult.flawsDetected.join(', ') : undefined,
      signoffNotes: `${analysisResult.verdict} (Score: ${analysisResult.qualityScore}/100) on ${selectedJointType}. ${analysisResult.inspectorSummary}`,
      checks: {
        weldIntegrity: isPass,
        diagonalSquareness: true,
        panelAlignment: true,
        surfaceDegreased: true,
        fastenerTorque: true,
      },
    };

    if (onAddCheckpoint) {
      onAddCheckpoint(newCheckpoint);
    }
    FirestoreService.syncCheckpoint(newCheckpoint);
    setLoggedStatus('Checkpoint successfully logged to Stage 1 (Chassis Assembly)!');
  };

  const handleIssueDefect = () => {
    if (!analysisResult) return;

    // Map to valid Defect code
    let defectCode: 'W-01' | 'W-02' | 'W-03' = 'W-01';
    if (analysisResult.primaryDefectCode === 'W-02') defectCode = 'W-02';
    else if (analysisResult.primaryDefectCode === 'W-03') defectCode = 'W-03';
    else if (analysisResult.flawsDetected.some((f) => f.toLowerCase().includes('penetration'))) defectCode = 'W-02';
    else if (analysisResult.flawsDetected.some((f) => f.toLowerCase().includes('undercut'))) defectCode = 'W-03';

    const newDefect: DefectItem = {
      id: `DEF-${Date.now()}`,
      busNo: selectedBusNo,
      code: defectCode,
      codeName: analysisResult.flawsDetected[0] || 'Weld Non-Conformance',
      stage: 'Stage 1 - Chassis Welding',
      description: `${selectedJointType}: ${analysisResult.flawsDetected.join(', ')}. Root cause: ${analysisResult.rootCauseAnalysis}`,
      severity: analysisResult.verdict === 'REJECT' ? 'Critical' : 'Major',
      rootCause: analysisResult.rootCauseAnalysis,
      correctiveAction: analysisResult.remediationAction,
      status: 'OPEN',
      reportedBy: user?.displayName || 'CWI Inspector',
      reportedDate: new Date().toISOString().slice(0, 10),
    };

    if (onAddDefect) {
      onAddDefect(newDefect);
    }
    FirestoreService.syncDefect(newDefect);
    setLoggedStatus(`Defect ${newDefect.code} logged to Defect Register! Red-Tag issued.`);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header - Stylish Light Acrylic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Computer Vision Welding Inspection
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                AWS D1.1 / ISO 5817
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Upload weld pictures to automatically evaluate perfection, bead geometry, porosity, undercut, and machine WPS settings
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold hidden md:inline">
            Test Benchmarks:
          </span>
          <button
            onClick={() => handleSelectSample(samplePerfectWeld)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              imagePreview === samplePerfectWeld
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pristine AWS Weld
          </button>
          <button
            onClick={() => handleSelectSample(samplePorosityWeld)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              imagePreview === samplePorosityWeld
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Defective Weld (Porosity)
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Inspection Canvas vs Analysis Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Canvas & Upload Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Inspection Parameter Selectors */}
          <div className="p-4 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Target Bus Unit
              </label>
              <select
                value={selectedBusNo}
                onChange={(e) => setSelectedBusNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-blue-500"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.busNo}>
                    {b.busNo} ({b.customer})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Joint Specification
              </label>
              <select
                value={selectedJointType}
                onChange={(e) => setSelectedJointType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              >
                {JOINT_TYPES.map((jt, i) => (
                  <option key={i} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Assigned Welder / Bay
              </label>
              <input
                type="text"
                value={welderId}
                onChange={(e) => setWelderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Interactive Weld Image Viewport */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-950 aspect-4/3 flex items-center justify-center shadow-md group">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Weld under inspection"
                  className="w-full h-full object-cover select-none"
                />

                {/* Defect Bounding Overlays */}
                {showOverlays &&
                  analysisResult?.defectRegions &&
                  analysisResult.defectRegions.map((region, idx) => (
                    <div
                      key={idx}
                      className="absolute border-2 rounded pointer-events-none transition-all"
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                        borderColor:
                          region.severity === 'HIGH'
                            ? '#EF4444'
                            : region.severity === 'MEDIUM'
                            ? '#F59E0B'
                            : '#3B82F6',
                        backgroundColor:
                          region.severity === 'HIGH'
                            ? 'rgba(239, 68, 68, 0.25)'
                            : region.severity === 'MEDIUM'
                            ? 'rgba(245, 158, 11, 0.25)'
                            : 'rgba(59, 130, 246, 0.25)',
                      }}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white border border-slate-700 whitespace-nowrap shadow-sm">
                        {region.label}
                      </span>
                    </div>
                  ))}

                {/* Bottom Overlay Controls Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs shadow-md">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowOverlays(!showOverlays)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        showOverlays
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Defect Overlay: {showOverlays ? 'ON' : 'OFF'}</span>
                    </button>
                    <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">
                      High-Resolution Macro View
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-600 font-semibold">
                    Joint: {selectedJointType.split(' ')[0]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-400">No weld picture loaded</p>
              </div>
            )}
          </div>

          {/* Upload & Inspect Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload Weld Picture</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-xs"
              title="Capture directly on mobile camera"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Camera Capture</span>
            </button>

            <button
              onClick={handleRunInspection}
              disabled={isAnalyzing || !imagePreview}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Weld Bead (AWS D1.1)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Weld Quality Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Weld Verdict, Characteristics & WPS Calibration (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {analysisResult ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div
                className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                  analysisResult.verdict === 'PERFECT'
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : analysisResult.verdict === 'ACCEPTABLE'
                    ? 'bg-amber-50/90 border-amber-300'
                    : 'bg-rose-50/95 border-rose-300 animate-pulse-slow'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {analysisResult.verdict === 'PERFECT' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : analysisResult.verdict === 'ACCEPTABLE' ? (
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-500 font-semibold">
                        Visual Inspection Verdict
                      </span>
                      <h3
                        className={`text-xl font-bold tracking-tight ${
                          analysisResult.verdict === 'PERFECT'
                            ? 'text-emerald-700'
                            : analysisResult.verdict === 'ACCEPTABLE'
                            ? 'text-amber-800'
                            : 'text-rose-700'
                        }`}
                      >
                        {analysisResult.verdict === 'PERFECT'
                          ? 'PERFECT WELD (PASS)'
                          : analysisResult.verdict === 'ACCEPTABLE'
                          ? 'ACCEPTABLE (PASS WITH NOTES)'
                          : 'REJECT (DEFECT DETECTED)'}
                      </h3>
                    </div>
                  </div>

                  {/* Quality Score Badge */}
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                      {analysisResult.qualityScore}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/100</span>
                    <span className="text-[10px] text-slate-500 block font-sans font-semibold">AWS Grade</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  {analysisResult.inspectorSummary}
                </p>
              </div>

              {/* Bead Profile & Geometry Analysis */}
              <div className="p-4 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bead Geometry & Characteristics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Bead Profile</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {analysisResult.beadCharacteristics.profile}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Ripple Pitch</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {analysisResult.beadCharacteristics.uniformity}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Toe Wash-In Transition</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {analysisResult.beadCharacteristics.toeTransition}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">Spatter Intensity</span>
                    <span
                      className={`font-semibold block mt-0.5 ${
                        analysisResult.beadCharacteristics.spatterLevel === 'None'
                          ? 'text-emerald-600'
                          : analysisResult.beadCharacteristics.spatterLevel === 'Minimal'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {analysisResult.beadCharacteristics.spatterLevel}
                    </span>
                  </div>
                </div>

                {/* Flaws list if any */}
                {analysisResult.flawsDetected.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
                      Flaws & Non-Conformances:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.flawsDetected.map((flaw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          {flaw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* WPS Machine Calibration & Remediation Actions */}
              <div className="p-4 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    WPS Calibration & Welder Adjustments
                  </h4>
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 block">
                      Likely Root Cause
                    </span>
                    <p className="text-slate-700 font-medium">{analysisResult.rootCauseAnalysis}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Voltage / Arc:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {analysisResult.wpsAdjustments.voltage}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Wire Feed Speed:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {analysisResult.wpsAdjustments.wireFeed}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Shielding Gas:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {analysisResult.wpsAdjustments.gasShielding}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block font-semibold">Technique Angle:</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {analysisResult.wpsAdjustments.technique}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 block">
                      Workshop Remediation Protocol
                    </span>
                    <p className="text-slate-700 font-medium">{analysisResult.remediationAction}</p>
                  </div>
                </div>
              </div>

              {/* One-Click Action Logging to Checkpoints / Defects */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleLogToStage1Checkpoint}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Log to Stage 1 Checkpoint</span>
                  </button>

                  <button
                    onClick={handleIssueDefect}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Issue Defect Red-Tag</span>
                  </button>
                </div>

                {loggedStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loggedStatus}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full p-8 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 flex flex-col items-center justify-center text-center space-y-3 shadow-xs min-h-[300px]">
              <div className="p-4 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
                <Flame className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Awaiting Weld Inspection</h4>
                <p className="text-xs text-slate-500 max-w-sm font-sans">
                  Upload a photo of your bus chassis weld or select one of the test benchmarks above, then click{' '}
                  <strong className="text-amber-700 font-semibold">Run AI Weld Quality Inspection</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
