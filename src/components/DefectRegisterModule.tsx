import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  CheckCircle,
  Sparkles,
  Filter,
  ShieldAlert,
  MapPin,
  X,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { DefectItem, BusProductionItem } from '../utils/storage';

interface DefectRegisterProps {
  defects: DefectItem[];
  buses: BusProductionItem[];
  onAddDefect: (def: DefectItem) => void;
  onResolveDefect: (id: string) => void;
}

const DEFECT_CODES = [
  { code: 'W-01', name: 'Weld Porosity / Gas Pockets' },
  { code: 'W-02', name: 'Weld Undercut / Lack of Fusion' },
  { code: 'W-03', name: 'Weld Bead Cracking' },
  { code: 'P-01', name: 'Panel Dent / Surface Deflection' },
  { code: 'P-02', name: 'Panel Misalignment / Uneven Gap' },
  { code: 'P-03', name: 'Surface Orange Peel & Waviness' },
  { code: 'D-01', name: 'Dimensional Diagonal Out of Tolerance' },
  { code: 'F-01', name: 'Paint Run / Sag / Fish-Eye' },
  { code: 'E-01', name: 'Electrical Loom Pin / Ground Fault' },
  { code: 'S-01', name: 'Seat Track Under-Torque / Stitch Tear' },
  { code: 'A-01', name: 'Window Seal Void / Leakage' },
];

export const DefectRegisterModule: React.FC<DefectRegisterProps> = ({
  defects,
  buses,
  onAddDefect,
  onResolveDefect,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New defect state
  const [busNo, setBusNo] = useState<string>(buses[0]?.busNo || 'AVM-2026-08');
  const [code, setCode] = useState<DefectItem['code']>('W-01');
  const [stage, setStage] = useState<string>('Gate 1: Weld Inspection');
  const [zone, setZone] = useState<DefectItem['zone']>('Left Side');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<DefectItem['severity']>('Major');
  const [rootCause, setRootCause] = useState<string>('');
  const [correctiveAction, setCorrectiveAction] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('K. Shumba (Quality Inspector)');

  // AI Diagnosis state
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  const handleAiDiagnose = async () => {
    if (!description) return;
    setIsDiagnosing(true);

    try {
      const res = await fetch('/api/gemini/diagnose-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defectCode: code,
          description,
          stage,
          busNo,
        }),
      });
      const data = await res.json();
      const aiData = data.data || data;
      if (aiData.likelyRootCause) setRootCause(aiData.likelyRootCause);
      if (aiData.immediateContainment || aiData.permanentPreventativeAction) {
        setCorrectiveAction(
          `${aiData.immediateContainment || ''} Prevention: ${aiData.permanentPreventativeAction || ''}`
        );
      }
    } catch (err) {
      console.error('AI defect diagnose failed', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const codeMatch = DEFECT_CODES.find((c) => c.code === code);

    const item: DefectItem = {
      id: `DEF-${Date.now()}`,
      busNo,
      code,
      codeName: codeMatch?.name || 'Quality Non-Conformance',
      stage,
      zone,
      description,
      severity,
      rootCause: rootCause || 'Investigating operational deviation.',
      correctiveAction: correctiveAction || 'Standard rework protocol initiated.',
      status: 'OPEN',
      reportedBy,
      reportedDate: new Date().toISOString().slice(0, 10),
    };

    onAddDefect(item);
    setShowLogModal(false);
    setDescription('');
    setRootCause('');
    setCorrectiveAction('');
  };

  const filteredDefects = defects.filter((d) => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 05 · Quality Improvement & CAPA
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">Closed-Loop Root Cause Resolution</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Coded Defect Register & Orientation Pinpointing
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Replaces handwritten paper cards with standardized defect taxonomy, vehicle orientation zone tagging, and AI-assisted CAPA containment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Quality Non-Conformance</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between p-3 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 font-sans font-semibold">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {status} Defects
            </button>
          ))}
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          Showing {filteredDefects.length} of {defects.length} Recorded Issues
        </span>
      </div>

      {/* Defect Cards List */}
      <div className="space-y-3">
        {filteredDefects.map((def) => (
          <div
            key={def.id}
            className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
              def.status === 'OPEN'
                ? 'bg-white/90 border-slate-200 hover:border-slate-300'
                : 'bg-slate-50/70 border-slate-200 opacity-90'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {def.code}
                </span>
                <span className="font-bold text-slate-900 text-xs">{def.codeName}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono font-semibold text-blue-700 text-xs">{def.busNo}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-sans">{def.stage}</span>
                {def.zone && (
                  <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-sans font-bold flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{def.zone}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-sans border ${
                    def.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : def.severity === 'Major'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {def.severity} Severity
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-sans border ${
                    def.status === 'OPEN'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {def.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">{def.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
                  Identified Root Cause:
                </span>
                <p className="text-slate-800 text-[11px] mt-0.5 font-sans">{def.rootCause}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-sans">
                  Permanent Corrective Action (CAPA):
                </span>
                <p className="text-slate-800 text-[11px] mt-0.5 font-sans">{def.correctiveAction}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
              <div>
                Reported by <strong className="text-slate-700">{def.reportedBy}</strong> on{' '}
                <span className="font-mono">{def.reportedDate}</span>
                {def.resolvedDate && (
                  <span className="text-emerald-700 ml-2 font-mono font-bold">
                    · Resolved {def.resolvedDate}
                  </span>
                )}
              </div>

              {def.status === 'OPEN' && (
                <button
                  onClick={() => onResolveDefect(def.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold text-white cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved & Verify CAPA</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log Defect Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-950 font-sans">
                Log Quality Non-Conformance Report
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Bus Chassis</label>
                  <select
                    value={busNo}
                    onChange={(e) => setBusNo(e.target.value)}
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
                  <label className="block text-slate-600 mb-1 font-semibold">Defect Taxonomy Code</label>
                  <select
                    value={code}
                    onChange={(e) => setCode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {DEFECT_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Gate / Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Gate 1: Weld Inspection">Gate 1: Weld</option>
                    <option value="Gate 2: Paint & Surface Inspection">Gate 2: Paint</option>
                    <option value="Gate 3: Electrical Check">Gate 3: Electrical</option>
                    <option value="Gate 4: Seat / Stitching Check">Gate 4: Seats</option>
                    <option value="Gate 5: Assembly Completeness">Gate 5: Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Vehicle Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Front Cap">Front Cap</option>
                    <option value="Left Side">Left Side</option>
                    <option value="Right Side">Right Side</option>
                    <option value="Rear Cap">Rear Cap</option>
                    <option value="Roof">Roof</option>
                    <option value="Interior">Interior</option>
                    <option value="Underbody">Underbody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Critical">Critical (Halt Bay)</option>
                    <option value="Major">Major (Rework Needed)</option>
                    <option value="Minor">Minor (Touch-up)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Defect Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe exact physical discrepancy, waviness, or weld porosity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                  required
                />
              </div>

              {/* AI Diagnosis Assist Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiDiagnose}
                  disabled={isDiagnosing || !description}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {isDiagnosing ? 'Diagnosing with Gemini AI...' : 'AI Root Cause Recommendation'}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Root Cause</label>
                <input
                  type="text"
                  placeholder="e.g. Low SATA HVLP gun pressure caused poor atomization and waviness"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">
                  Permanent Corrective Action (CAPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Calibrated air regulator to 2.0 bar at nozzle; block-sanded with P1500"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-semibold text-white shadow-xs cursor-pointer"
                >
                  Log Non-Conformance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
