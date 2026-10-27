import React from 'react';
import {
  Bus,
  AlertOctagon,
  CheckCircle,
  Package,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Flame,
  Sliders,
  QrCode,
  Plus,
} from 'lucide-react';
import { BusProductionItem, DefectItem, MaterialStockItem } from '../utils/storage';
import { AvmLogo } from './AvmLogo';

// Background from official site
import siteHeroBg from '../assets/images/avm_site_background_1790613671269.jpg';

interface DashboardHomeProps {
  buses: BusProductionItem[];
  defects: DefectItem[];
  stock: MaterialStockItem[];
  onNavigateTab: (tab: string) => void;
  onQuickRestock: (stockId: string) => void;
  onOpenNewOrder: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  buses,
  defects,
  stock,
  onNavigateTab,
  onQuickRestock,
  onOpenNewOrder,
}) => {
  const activeBuses = buses.filter((b) => b.status === 'In Progress' || b.status === 'Blocked');
  const completedBuses = buses.filter((b) => b.status === 'Completed');
  const openDefects = defects.filter((d) => d.status === 'OPEN');
  const lowStockItems = stock.filter((s) => s.currentStock <= s.minLevel);
  const frozenBuses = buses.filter((b) => b.isDesignFrozen);

  return (
    <div className="space-y-8">
      {/* 
        OFFICIAL AVM AFRICA HERO BANNER - STYLISH LIGHT LUXURY EDITION
        Features the authentic bus photo softened with a luminous frosted light scrim,
        crisp Times New Roman typography, and rich vibrant AVM crimson accents.
      */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08)] bg-white">
        {/* Background Image with Stylish Luminous Light Frost Scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.89) 45%, rgba(255, 255, 255, 0.62) 78%, rgba(255, 255, 255, 0.32) 100%), url(${siteHeroBg})`,
          }}
        />

        {/* Ambient lighting warm/cool light glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-4xl space-y-6">
          {/* Logo & Tag Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <AvmLogo className="h-9 shadow-xs" />
            <div className="px-3.5 py-1 rounded-full border border-slate-300/80 bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-700 tracking-wider shadow-xs">
              ZIMBABWE · EST. 1961 · 95% LOCALLY OWNED
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Driving You <span className="text-[#DC2626]">Into The</span>
            </h1>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#DC2626] leading-tight">
              Future
            </h1>
          </div>

          {/* Site Mission Paragraph */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-sans font-medium">
            AVM Africa (Pvt) Ltd manufactures and assembles buses and trucks from a 5.16 hectare plant in Msasa, Harare — built for Africa's roads, backed by six decades of engineering heritage.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenNewOrder}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Place New Bus Order</span>
            </button>

            <button
              onClick={() => onNavigateTab('production')}
              className="px-6 py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Our Fleet
            </button>

            <button
              onClick={() => onNavigateTab('welding')}
              className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 border border-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-100" />
              <span>Inspect Welding (AI)</span>
            </button>

            <button
              onClick={() => onNavigateTab('paint')}
              className="px-6 py-2.5 rounded-full bg-white/95 hover:bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:border-slate-400"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Launch Paint Vision</span>
            </button>
          </div>

          {/* 
            4 MILESTONE METRICS (from official site)
          */}
          <div className="pt-8 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
                1961
              </div>
              <div className="text-xs text-slate-600 font-medium font-sans mt-0.5">Year Founded</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
                25–50
              </div>
              <div className="text-xs text-slate-600 font-medium font-sans mt-0.5">Buses / Month Capacity</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
                1,000+
              </div>
              <div className="text-xs text-slate-600 font-medium font-sans mt-0.5">Buses Supplied to ZUPCO</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
                20,000
              </div>
              <div className="text-xs text-slate-600 font-medium font-sans mt-0.5">Jobs Across Value Chain</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Real-Time Factory Operations KPI Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Real-Time Plant Assembly Telemetry
          </span>
          <span className="text-[11px] text-slate-500 font-mono font-medium">Msasa Assembly Bay 1–6</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Fleet Order
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{buses.length}</span>
              <Bus className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[11px] text-slate-500 font-sans">Active Contracts</span>
          </div>

          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              In Active Production
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">{activeBuses.length}</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[11px] text-slate-500 font-sans">Across 6 Plant Bays</span>
          </div>

          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Completed Units
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">{completedBuses.length}</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[11px] text-slate-500 font-sans">Dyno Tested & Verified</span>
          </div>

          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Open Defects
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{openDefects.length}</span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-[11px] text-rose-600 font-sans font-medium">Root Cause Tracked</span>
          </div>

          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">{lowStockItems.length}</span>
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[11px] text-amber-600 font-sans font-medium">Action Required</span>
          </div>

          <div className="p-4 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Design Frozen
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">{frozenBuses.length}</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-[11px] text-slate-500 font-sans">Post-Stage 3 Locked</span>
          </div>
        </div>
      </div>

      {/* 
        MENTOR MANUFACTURING PIPELINE & 5 QUALITY GATES SHOWCASE
        Visualizes the exact sequential stages from Bus Order to Final Release
      */}
      <div className="p-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-sans">
                Zero-Defect Quality Architecture
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-sans">Standard Operating Procedure</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Manufacturing Sequence & 5 Mandatory Quality Gates
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('checkpoints')}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            <span>Open Quality Gate Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 9-Step Sequential Flow with Gates */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Step 1 & 2: Order & BOM */}
          <button
            onClick={onOpenNewOrder}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-left cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-slate-500 group-hover:text-blue-700">STAGE 01 & 02</span>
              <Plus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-950">Bus Order & BOM Design</h4>
            <p className="text-[11px] text-slate-500 font-sans">
              Place new bus order, seating spec, CAD drawing freeze, and BOM allocation.
            </p>
          </button>

          {/* Gate 1: Weld Inspection */}
          <button
            onClick={() => onNavigateTab('checkpoints')}
            className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-left cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-blue-700">QUALITY GATE 1</span>
              <ShieldCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-blue-950">Weld Inspection</h4>
            <p className="text-[11px] text-blue-800/80 font-sans">
              AWS D1.1 weld bead, diagonal squareness (±1.5mm), fillet throat ≥ 6mm.
            </p>
          </button>

          {/* Gate 2: Paint & Surface */}
          <button
            onClick={() => onNavigateTab('paint')}
            className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-700">QUALITY GATE 2</span>
              <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-indigo-950">Paint & Surface Inspection</h4>
            <p className="text-[11px] text-indigo-800/80 font-sans">
              Multi-zone finish: DFT 110–135µm, ΔE ≤ 1.0, 60° gloss & orange peel.
            </p>
          </button>

          {/* Gate 3: Electrical */}
          <button
            onClick={() => onNavigateTab('checkpoints')}
            className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all text-left cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-amber-700">QUALITY GATE 3</span>
              <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-amber-950">Electrical Check</h4>
            <p className="text-[11px] text-amber-800/80 font-sans">
              24V loom dielectric isolation, alternator relay, LED route matrix.
            </p>
          </button>

          {/* Gate 4 & 5 & Release */}
          <button
            onClick={() => onNavigateTab('checkpoints')}
            className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-emerald-700">GATES 4 & 5 + RELEASE</span>
              <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-bold text-emerald-950">Trim, Final & Release</h4>
            <p className="text-[11px] text-emerald-800/80 font-sans">
              Seat torque (≥45Nm), aisle width (≥380mm), 150kPa monsoon shower test.
            </p>
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-amber-900">
              <strong>Material Shortage Warning:</strong> {lowStockItems.length} critical raw materials are below minimum buffer stock (e.g. {lowStockItems[0].name}).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onQuickRestock(lowStockItems[0].id)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Order {lowStockItems[0].code}
            </button>
            <button
              onClick={() => onNavigateTab('stock')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium transition-colors cursor-pointer shadow-xs"
            >
              View Inventory
            </button>
          </div>
        </div>
      )}

      {/* Production Tracking Board */}
      <div className="p-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Production Flow Board</h3>
            <p className="text-xs text-slate-500">
              Live status across Stage 1 (Chassis Assembly) through Stage 7 (PDI Pre-Delivery Inspection).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Bus Order</span>
            </button>
            <button
              onClick={() => onNavigateTab('production')}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              <span>Full Production Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Bus Number</th>
                <th className="py-2.5 px-3">Customer / Model</th>
                <th className="py-2.5 px-3">Stage Progress (1 to 7)</th>
                <th className="py-2.5 px-3">Current Bay</th>
                <th className="py-2.5 px-3 text-center">Design Gate</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{bus.busNo}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-semibold text-slate-800">{bus.customer}</div>
                    <div className="text-[11px] text-slate-500">{bus.model}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7].map((stageNum) => (
                          <div
                            key={stageNum}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              stageNum < bus.stage
                                ? 'bg-emerald-600 text-white'
                                : stageNum === bus.stage
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {stageNum}
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans truncate">
                        Stage {bus.stage}: {bus.stageName}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-700">
                    <div className="font-medium">{bus.assignedBay}</div>
                    <div className="text-[10px] text-slate-400">Lead: {bus.leadTechnician}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {bus.isDesignFrozen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Lock className="w-3 h-3" />
                        FROZEN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        OPEN
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        bus.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : bus.status === 'Blocked'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                      }`}
                    >
                      {bus.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2-Card Row: Defect Summary & Spectrophotometer Feature Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Quality Defects List */}
        <div className="p-5 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Defect Resolution Queue
            </h4>
            <button
              onClick={() => onNavigateTab('defects')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Defect Register →
            </button>
          </div>

          <div className="space-y-2">
            {defects.slice(0, 3).map((def) => (
              <div
                key={def.id}
                className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-600">{def.code}</span>
                    <span className="text-slate-800 font-semibold">{def.codeName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">{def.busNo}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{def.description}</p>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    def.status === 'OPEN'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {def.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Paint Module Quick Gateway */}
        <div className="p-5 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 border border-blue-200/90 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Spectrophotometer & Vision Matching
              </span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Objective Digital Paint Matching Engine
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Eliminate subjective manual color matching by eye. Upload bus panel photos, sample pixel coordinates with high-resolution loupe, and generate certified Delta E formulas in under 1ms.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('paint')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Launch Paint Vision Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
