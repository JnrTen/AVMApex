import React, { useState } from 'react';
import {
  Bus,
  Lock,
  Unlock,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles,
  Info,
  Plus,
} from 'lucide-react';
import { BusProductionItem, AVM_PRODUCTION_STAGES } from '../utils/storage';

interface ProductionTrackingProps {
  buses: BusProductionItem[];
  onUpdateBus: (bus: BusProductionItem) => void;
  onOpenNewOrder: () => void;
}

export const ProductionTrackingModule: React.FC<ProductionTrackingProps> = ({
  buses,
  onUpdateBus,
  onOpenNewOrder,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [selectedBus, setSelectedBus] = useState<BusProductionItem | null>(buses[0] || null);
  const [blockerInput, setBlockerInput] = useState<string>('');

  const handleAdvanceStage = (bus: BusProductionItem) => {
    if (bus.stage >= 7) {
      onUpdateBus({
        ...bus,
        status: 'Completed',
      });
      return;
    }

    const nextStage = bus.stage + 1;
    // Advancing from Frames (Stage 3) to Coach Building (Stage 4) enforces Design Freeze
    const freeze = nextStage >= 4 ? true : bus.isDesignFrozen;

    const updated: BusProductionItem = {
      ...bus,
      stage: nextStage,
      stageName: AVM_PRODUCTION_STAGES[nextStage - 1] || 'PDI (Pre-Delivery Inspection)',
      isDesignFrozen: freeze,
      status: nextStage === 7 ? 'Completed' : 'In Progress',
      blocker: undefined,
    };

    onUpdateBus(updated);
    if (selectedBus?.id === bus.id) setSelectedBus(updated);
  };

  const handleToggleBlocker = (bus: BusProductionItem) => {
    if (bus.status === 'Blocked') {
      const updated: BusProductionItem = {
        ...bus,
        status: 'In Progress',
        blocker: undefined,
      };
      onUpdateBus(updated);
      if (selectedBus?.id === bus.id) setSelectedBus(updated);
    } else {
      const updated: BusProductionItem = {
        ...bus,
        status: 'Blocked',
        blocker: blockerInput || 'Feeder part shortage or fixture recalibration required.',
      };
      onUpdateBus(updated);
      if (selectedBus?.id === bus.id) setSelectedBus(updated);
      setBlockerInput('');
    }
  };

  const filteredBuses = buses.filter((b) => {
    if (selectedStageFilter === 'ALL') return true;
    return (
      b.stageName.toLowerCase().includes(selectedStageFilter.toLowerCase()) ||
      selectedStageFilter.toLowerCase().includes(b.stageName.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 04 · Plant Orchestration
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">
              Assembly Line Architecture & Feeder Sync
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Production Overview & Assembly Bay Management
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Orchestrates the 7 sequential assembly stages fed by central Production Stores, Components Production, Trimming, Fibre Shop, and Window Section.
          </p>
        </div>

        {/* Legend & New Order CTA */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Active WIP</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Completed / PDI</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Blocked Bay</span>
            </div>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Bus Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Stage Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs text-xs font-sans">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter Stage:</span>
          </span>
          <button
            onClick={() => setSelectedStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedStageFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Stages ({buses.length})
          </button>
          {AVM_PRODUCTION_STAGES.map((stg, idx) => {
            const count = buses.filter((b) => b.stageName === stg).length;
            const isSelected = selectedStageFilter === stg;
            return (
              <button
                key={idx}
                onClick={() => setSelectedStageFilter(isSelected ? 'ALL' : stg)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {stg.replace(' (Pre-Delivery Inspection)', '')} ({count})
              </button>
            );
          })}
        </div>

        {selectedStageFilter !== 'ALL' && (
          <button
            onClick={() => setSelectedStageFilter('ALL')}
            className="text-blue-600 hover:underline font-semibold cursor-pointer shrink-0"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Grid of Bus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.map((bus) => (
          <div
            key={bus.id}
            className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xs ${
              bus.status === 'Blocked'
                ? 'bg-rose-50/80 border-rose-300'
                : bus.status === 'Completed'
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-white/90 border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wide block">
                  {bus.busNo}
                </span>
                <span className="text-xs font-semibold text-slate-700 block mt-0.5 font-sans">
                  {bus.customer}
                </span>
                <span className="text-[11px] text-slate-500 font-sans">{bus.model}</span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-sans border ${
                  bus.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : bus.status === 'Blocked'
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {bus.status}
              </span>
            </div>

            {/* Current Stage Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 font-sans">
                  Stage {bus.stage} of 7:
                </span>
                <strong className="text-blue-700 font-bold">{bus.stageName}</strong>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    bus.status === 'Blocked'
                      ? 'bg-rose-500'
                      : bus.status === 'Completed'
                      ? 'bg-emerald-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${(bus.stage / 7) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span>Bay: {bus.assignedBay}</span>
                <span>Lead: {bus.leadTechnician}</span>
              </div>
            </div>

            {/* Design Freeze Status */}
            <div className="flex items-center justify-between text-xs font-sans px-1">
              <div className="flex items-center gap-1.5">
                {bus.isDesignFrozen ? (
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span
                  className={
                    bus.isDesignFrozen ? 'text-indigo-900 font-semibold' : 'text-slate-500'
                  }
                >
                  {bus.isDesignFrozen ? 'Design Frozen (Drawing Locked)' : 'Design Open (Pre-Frames)'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                Target: {bus.targetLiveryCode}
              </span>
            </div>

            {/* Blocker alert if blocked */}
            {bus.status === 'Blocked' && (
              <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 font-sans">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Assembly Halted:</strong>
                  <p className="text-[11px] mt-0.5">{bus.blocker}</p>
                </div>
              </div>
            )}

            {/* Actions: Advance Stage & Toggle Blocker */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleBlocker(bus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer ${
                  bus.status === 'Blocked'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {bus.status === 'Blocked' ? 'Clear Blocker' : 'Flag Blocker'}
              </button>

              <button
                onClick={() => handleAdvanceStage(bus)}
                disabled={bus.status === 'Blocked'}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-sans font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>
                  {bus.stage >= 7
                    ? 'Sign-Off PDI'
                    : `Advance to Stage ${bus.stage + 1}`}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
