import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tag,
  Camera,
  Check,
  QrCode,
  Mic,
  MicOff,
  UserCheck,
  ChevronRight,
  Flame,
  Pipette,
  Zap,
  Armchair,
  CheckSquare,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { QualityCheckpointItem, BusProductionItem, QualityGateType } from '../utils/storage';

interface QualityCheckpointsProps {
  checkpoints: QualityCheckpointItem[];
  buses: BusProductionItem[];
  onAddCheckpoint: (cp: QualityCheckpointItem) => void;
}

// 5 Dedicated Quality Gates + Final Road/Shower Gate criteria
const GATE_CRITERIA: Record<
  QualityGateType,
  {
    gateName: string;
    flowStep: string;
    responsibleRole: string;
    icon: any;
    items: string[];
    quickDefectPresets: string[];
  }
> = {
  'Gate 1: Weld Inspection': {
    gateName: 'Gate 1: Weld Inspection',
    flowStep: 'Body Frame / Welding',
    responsibleRole: 'Lead QC Structural Inspector',
    icon: Flame,
    items: [
      'AWS D1.1 Structural Weld Bead Uniformity & Penetration',
      'Chassis Diagonal Squareness (±1.5mm max over 12m length)',
      'Continuous Fillet Weld Throat Thickness ≥ 6.0mm',
      'Zero Surface Porosity, Undercut, or Lack of Fusion',
      'Axle Hanger Coplanarity & Outrigger Perpendicularity (90° ±0.5°)',
      'Magnetic Particle NDT on High-Stress Suspension Brackets',
    ],
    quickDefectPresets: [
      'Porosity in Bay 1 Outrigger Weld (Code W-01)',
      'Diagonal Squareness Out of Tolerance +2.8mm (Code W-02)',
      'Fillet Throat Thickness Under-Size (4.5mm vs 6.0mm min)',
      'Undercut Detected on Main Channel Flange (Code W-03)',
    ],
  },
  'Gate 2: Paint & Surface Inspection': {
    gateName: 'Gate 2: Paint & Surface Inspection',
    flowStep: 'Body / Fibre & Paint Preparation',
    responsibleRole: 'Surface Quality & Coating Chemist',
    icon: Pipette,
    items: [
      'Total Dry Film Thickness within 110–135 µm (Primer + Base + Clear)',
      'Spectrophotometer Color Match Delta E ≤ 1.0 vs RAL Standard',
      '60° Specular Glossmeter Reading ≥ 88 GU (Mirror Finish)',
      'Orange Peel & Waviness Tension Rating ≤ 3.5 (ISO 2813)',
      'Cross-Hatch Adhesion Tape Test (ASTM D3359 Class 4B/5B)',
      'Zero Surface Defects: Runs, Sags, Fisheyes, or Solvent Pop',
    ],
    quickDefectPresets: [
      'Excessive Orange Peel on Rear Tail Cap (Score 5.8)',
      'Color Delta E Exceeds 1.8 on Front Composite Nose Cap',
      'Dry Film Thickness Under-Spec (88µm vs 110µm min)',
      'Clearcoat Run on Left Skirt Below Passenger Window',
    ],
  },
  'Gate 3: Electrical Check': {
    gateName: 'Gate 3: Electrical Check',
    flowStep: 'Electrical Installation',
    responsibleRole: 'Automotive Electrical Systems Inspector',
    icon: Zap,
    items: [
      '24V DC Main Loom Continuity & Dielectric Megger Test (>100 MΩ)',
      'Dual Alternator Charging Output & Battery Master Isolator Switch',
      'LED Destination Route Display Matrix Programming & Brightness',
      'Exterior Lighting, High/Low Beams, Hazard Flasher Amperage',
      'Pneumatic Passenger Door Emergency Safety Interlock & Buzzer',
      'Heavy-Duty Pantograph Wiper Motor Current Draw & Sweep Radius',
    ],
    quickDefectPresets: [
      'Pin 7 Loose on Multiplex CANbus Destination Connector',
      'Passenger Door Emergency Interlock Fails to Inhibit Throttle',
      'High-Beam Relay Current Draw Exceeds 18A Specification',
      'Earth Ground Lug Loose on Rear Chassis Crossmember',
    ],
  },
  'Gate 4: Seat / Stitching / Alignment Check': {
    gateName: 'Gate 4: Seat / Stitching / Alignment Check',
    flowStep: 'Seats & Upholstery',
    responsibleRole: 'Interior & Ergonomics QC Inspector',
    icon: Armchair,
    items: [
      'M10 Seat Leg to Floor Track Fastener Torque (≥ 45 Nm verified)',
      'Gangway Aisle Minimum Clearance Width (≥ 380mm per UN ECE R107)',
      'Heavy-Duty Sanitized Vinyl Stitching Tensile Strength Check',
      '3-Point Inertia Seatbelt Retractor & Anchor Pull-Test Compliance',
      'Stanchion Poles, Ceiling Grab Handles & Anti-Slip Knurling',
      'Seat Backrest Deflection & Anti-Vandal Polypropylene Shells',
    ],
    quickDefectPresets: [
      'Row 4 Kerbside Seat Leg Bolt Under-Torque (30 Nm vs 45 Nm)',
      'Gangway Width Pinched to 365mm at Rear Wheel Arch',
      'Loose Grab Handle Bracket on Cant Rail Stanchion',
      'Tear in Driver Seat Lumbar Seam Stitching',
    ],
  },
  'Gate 5: Assembly Completeness': {
    gateName: 'Gate 5: Assembly Completeness',
    flowStep: 'Windows / Fittings / Interior',
    responsibleRole: 'Plant Quality Assurance Manager',
    icon: CheckSquare,
    items: [
      'Sikaflex Polyurethane Window Seal Continuity & 24h Full Cure',
      'Luggage Rack Deflection Load Test (80 kg/m Static Test)',
      'Floor Vinyl Seam Hot-Air Welding & Non-Slip Tread Edging',
      'Emergency Roof Escape Hatches Dual Ejection Latches Verified',
      'Dual 9kg Dry Powder Fire Extinguishers & First Aid Kit Mounted',
      'Instrument Cluster Gauges, Pneumatic Pressure Warning Buzzer',
    ],
    quickDefectPresets: [
      'Polyurethane Windscreen Seal Void at Top Right Corner',
      'Emergency Roof Hatch Safety Latch Sticky to Disengage',
      'Floor Vinyl Heat-Weld Seam Lifting at Step-Well',
      'Fire Extinguisher Mounting Bracket Missing Safety Pin',
    ],
  },
  'Final Inspection: Shower & Road Test': {
    gateName: 'Final Inspection: Shower & Road Test',
    flowStep: 'Final Pre-Release Road & Monsoon Test',
    responsibleRole: 'Chief Plant Engineer (Release Authority)',
    icon: Truck,
    items: [
      '150 kPa Monsoon Shower Booth Leak Test for 15 Continuous Minutes',
      '10 km Dynamic Road Trial: Full Load Brake Deceleration Test',
      'Steering Centering, Turning Circle & Suspension Anti-Roll Bar',
      'Exhaust Emission Smoke Opacity & Turbocharger Boost Pressure',
      'Final Weighbridge Tare Weight Certification vs Design BOM',
      'Official Certificate of Roadworthiness & VIN Chassis Stamping',
    ],
    quickDefectPresets: [
      'Water Ingress Detected at Rear Emergency Door Rubber Seal',
      'Service Brake Retardation Imbalance (15% Left/Right Variance)',
      'Tare Weight Exceeds Design BOM by 180kg',
      'Speedometer Reads 8 km/h Low at 60 km/h Calibration',
    ],
  },
};

export const QualityCheckpointsModule: React.FC<QualityCheckpointsProps> = ({
  checkpoints,
  buses,
  onAddCheckpoint,
}) => {
  const [selectedBusNo, setSelectedBusNo] = useState<string>(buses[0]?.busNo || 'AVM-2026-08');
  const [activeGate, setActiveGate] = useState<QualityGateType>('Gate 1: Weld Inspection');
  const [inspector, setInspector] = useState<string>('C. Moyo');
  const [inspectorRole, setInspectorRole] = useState<string>('Lead QC Structural Inspector');
  const [notes, setNotes] = useState<string>('');
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);

  // Checks state for active gate
  const [checkState, setCheckState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    GATE_CRITERIA['Gate 1: Weld Inspection'].items.forEach((item) => {
      initial[item] = true;
    });
    return initial;
  });

  // Whenever activeGate changes, initialize checklist items
  useEffect(() => {
    const criteria = GATE_CRITERIA[activeGate];
    const updated: Record<string, boolean> = {};
    criteria.items.forEach((item) => {
      updated[item] = true;
    });
    setCheckState(updated);
    setInspectorRole(criteria.responsibleRole);
  }, [activeGate]);

  const isAllPassed = Object.values(checkState).every(Boolean);

  // Modern Assembly Line: One-Tap "PASS ALL CHECKS" (Exception-Based Logging)
  const handlePassAll = () => {
    const updated: Record<string, boolean> = {};
    GATE_CRITERIA[activeGate].items.forEach((item) => {
      updated[item] = true;
    });
    setCheckState(updated);
  };

  // Modern Assembly Line: Fail specific item quickly
  const handleToggleCheck = (item: string) => {
    setCheckState((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Quick Preset Defect appender
  const handleAddPresetDefect = (preset: string) => {
    setNotes((prev) => (prev ? `${prev}; ${preset}` : preset));
    // Also toggle the related check to false
    const criteria = GATE_CRITERIA[activeGate];
    if (criteria.items[0]) {
      setCheckState((prev) => ({
        ...prev,
        [criteria.items[0]]: false,
      }));
    }
  };

  // Speech-to-Text Hands-Free Dictation for Work Gloves
  const handleToggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type or use preset buttons.');
      return;
    }

    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceRecording(true);
    };

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setNotes((prev) => (prev ? `${prev} ${speechText}` : speechText));
      setIsVoiceRecording(false);
    };

    recognition.onerror = () => {
      setIsVoiceRecording(false);
    };

    recognition.onend = () => {
      setIsVoiceRecording(false);
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCheckpoint: QualityCheckpointItem = {
      id: `QC-${Date.now().toString(36).toUpperCase()}`,
      busNo: selectedBusNo,
      stageGate: activeGate,
      inspector,
      inspectorRole,
      date: new Date().toISOString().slice(0, 10),
      checks: checkState,
      result: isAllPassed ? 'PASS' : 'FAIL',
      redTagIssued: !isAllPassed,
      redTagNo: !isAllPassed ? `RED-TAG-${Math.floor(100 + Math.random() * 900)}` : undefined,
      redTagReason: !isAllPassed
        ? `Defect logged during ${activeGate}. Bay quarantined until rework sign-off.`
        : undefined,
      signoffNotes:
        notes ||
        (isAllPassed
          ? `Verified 100% compliant with ${activeGate} standards.`
          : 'Inspection failed tolerance. Remedial rework required before downstream release.'),
      zoneTag:
        activeGate.includes('Weld')
          ? 'Chassis'
          : activeGate.includes('Paint')
          ? 'Left Side'
          : activeGate.includes('Electrical')
          ? 'Interior'
          : activeGate.includes('Seat')
          ? 'Interior'
          : 'Interior',
    };

    onAddCheckpoint(newCheckpoint);
    setNotes('');
  };

  const activeRedTags = checkpoints.filter((c) => c.redTagIssued);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 03 · Quality Gate Governance
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">
              Sequential Zero-Defect Manufacturing Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Manufacturing Flow & 5 Mandatory Quality Gates
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Enforces strict sequential gate progression. A bus cannot advance from Body Frame to Painting or Trim without passing each rigorous engineering gate.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 shadow-xs font-sans">
            <Tag className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Active Red Tags:</span>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {activeRedTags.length}
            </span>
          </div>

          <button
            onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer shadow-xs transition-colors"
            title="Scan Chassis VIN or Job Card Barcode"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Chassis Barcode</span>
          </button>
        </div>
      </div>

      {/* Barcode / QR Chassis Quick Scanner Drawer */}
      {showBarcodeScanner && (
        <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-blue-200 shadow-xs">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 font-sans">
                Shopfloor Optical Barcode / RFID Chassis Scanner
              </h4>
              <p className="text-[11px] text-blue-800 font-sans">
                Tap any active chassis below to simulate instantaneous handheld barcode gun scan:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {buses.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBusNo(b.busNo);
                  setShowBarcodeScanner(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedBusNo === b.busNo
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-blue-100'
                }`}
              >
                {b.busNo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Manufacturing Flow & 5 Quality Gates Breadcrumb Pipeline */}
      <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              End-To-End Manufacturing Stage & Gate Flow
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              AVM Standard SOP-2026
            </span>
          </div>
          <span className="text-xs text-slate-400 font-sans">
            Click any gate to inspect verification checklist
          </span>
        </div>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {Object.entries(GATE_CRITERIA).map(([gateKey, config], idx) => {
            const isSelected = activeGate === gateKey;
            const Icon = config.icon;
            const isRedTagged = activeRedTags.some(
              (r) => r.busNo === selectedBusNo && r.stageGate === gateKey
            );

            return (
              <button
                key={gateKey}
                onClick={() => setActiveGate(gateKey as QualityGateType)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : isRedTagged
                    ? 'bg-rose-50/60 border-rose-300 hover:bg-rose-50'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-600 font-mono">
                    GATE 0{idx + 1}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected
                        ? 'text-blue-600'
                        : isRedTagged
                        ? 'text-rose-600'
                        : 'text-slate-400'
                    }`}
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {config.gateName.replace(/^Gate \d: /, '').replace('Final Inspection: ', '')}
                </h4>
                <span className="text-[10px] text-slate-600 line-clamp-1 mt-0.5 font-sans">
                  {config.flowStep}
                </span>

                {isRedTagged && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold shadow-xs">
                    RED TAG
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Grid: Left = Fast-Entry Shopfloor Form, Right = Inspection History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inspection Form (5 cols) */}
        <div className="lg:col-span-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-sans">
                Active Gate Assessment
              </span>
              <h3 className="text-sm font-bold text-slate-900">{activeGate}</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-sans border ${
                isAllPassed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              }`}
            >
              {isAllPassed ? 'PASS (GATE CLEARED)' : 'HOLD (RED TAG)'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Bus & Operator Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-sans font-semibold mb-1">
                  Chassis Under Inspection
                </label>
                <select
                  value={selectedBusNo}
                  onChange={(e) => setSelectedBusNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.busNo}>
                      {b.busNo} ({b.model.slice(0, 14)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-sans font-semibold mb-1">
                  Lead Inspector
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Fast-Entry Assembly Line Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assembly Line Exception Logging</span>
                </span>
                <button
                  type="button"
                  onClick={handlePassAll}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs cursor-pointer transition-colors"
                >
                  1-Tap Pass All (6/6)
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Glove-friendly touch: Tap any failing criterion below to flag an exception.
              </p>
            </div>

            {/* Verification Checklist Items */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-sans">
                {activeGate} Checklist
              </span>

              {GATE_CRITERIA[activeGate].items.map((criterion, index) => {
                const passed = checkState[criterion] ?? true;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleToggleCheck(criterion)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      passed
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-rose-50/80 border-rose-300 shadow-xs'
                    }`}
                  >
                    <div className="pr-3">
                      <span
                        className={`font-semibold block ${
                          passed ? 'text-slate-800' : 'text-rose-900'
                        }`}
                      >
                        {criterion}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {passed ? 'Specification met' : 'FAILED - Tolerance exceeded'}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        passed
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-rose-600 text-white border-rose-600'
                      }`}
                    >
                      {passed ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick-Preset Defect Buttons (No typing required) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                Fast Defect Pickers (1-Tap Append):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GATE_CRITERIA[activeGate].quickDefectPresets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddPresetDefect(preset)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-sans font-semibold border border-slate-200 cursor-pointer transition-colors"
                  >
                    + {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Sign-off Notes with Voice Dictation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-sans font-semibold">
                  Sign-Off Notes & Inspection Remarks
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoiceDictation}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold transition-colors cursor-pointer ${
                    isVoiceRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Hands-free voice dictation for workshop gloves"
                >
                  {isVoiceRecording ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      <span>Voice Memo</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter sign-off comments, or use Voice Memo / 1-Tap Defect Pickers above..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isAllPassed
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isAllPassed
                  ? `Sign-Off & Clear ${activeGate}`
                  : `Issue RED TAG & Quarantine Bay for ${activeGate}`}
              </span>
            </button>
          </form>
        </div>

        {/* Audit Trail & Red Tag Register (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Red Tag Quarantine Warning (if any) */}
          {activeRedTags.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>BAY QUARANTINE: Active Stop-Production Red Tags ({activeRedTags.length})</span>
              </div>
              <div className="space-y-1.5">
                {activeRedTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-700">{tag.redTagNo}</span>
                        <span className="font-bold text-slate-800">{tag.busNo}</span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {tag.stageGate}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 mt-0.5 font-sans">
                        {tag.redTagReason || tag.signoffNotes}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold font-sans">
                      HOLD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Inspection Audit Log */}
          <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Verified Gate Audit Log & Certificates
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Immutable record of in-process sign-offs and inspector stamps.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {checkpoints.length} Records Logged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {checkpoints.map((cp) => {
                const passed = cp.result === 'PASS';
                return (
                  <div
                    key={cp.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:bg-white transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-blue-700">{cp.busNo}</span>
                        <span className="font-semibold text-slate-800">{cp.stageGate}</span>
                        <span className="text-[10px] text-slate-400 font-sans">· {cp.date}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-sans ${
                          passed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {passed ? 'PASSED' : 'RED TAG ISSUED'}
                      </span>
                    </div>

                    <p className="text-slate-600 font-sans text-[11px]">{cp.signoffNotes}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>
                          Certified By: <strong className="text-slate-700">{cp.inspector}</strong>
                          {cp.inspectorRole && ` (${cp.inspectorRole})`}
                        </span>
                      </div>
                      {cp.zoneTag && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                          Zone: {cp.zoneTag}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
