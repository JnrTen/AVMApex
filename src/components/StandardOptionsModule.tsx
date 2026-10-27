import React, { useState } from 'react';
import { Sliders, CheckCircle2, Shield, Plus, Lock } from 'lucide-react';
import { StandardOptionItem } from '../utils/storage';

interface StandardOptionsProps {
  options: StandardOptionItem[];
  onOpenNewOrder: () => void;
}

export const StandardOptionsModule: React.FC<StandardOptionsProps> = ({
  options,
  onOpenNewOrder,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filtered = options.filter(
    (opt) => activeCategory === 'ALL' || opt.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 07
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">Customization Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Standard Options Matrix & Order Placement
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Eliminates bespoke engineering delays by offering verified modular configurations at order placement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-sans">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Deviations Require Change Request</span>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Place New Bus Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/90 w-fit text-xs font-sans shadow-xs">
        {['ALL', 'Seating Layout', 'Interior Trim', 'Powertrain', 'Climate Control'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Options Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((opt) => (
          <div
            key={opt.optionCode}
            className="p-5 bg-white/90 border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-sans">
                  {opt.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{opt.name}</h4>
                <span className="text-[11px] font-mono text-slate-500">{opt.optionCode}</span>
              </div>

              {opt.isPopular && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-sans bg-blue-50 text-blue-700 border border-blue-200">
                  Fleet Standard
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">{opt.description}</p>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Lead Time Impact:</span>
                <span className="text-slate-700 font-semibold">
                  {opt.standardLeadTimeDays === 0 ? '0 Days (Pre-Engineered)' : `+${opt.standardLeadTimeDays} Days`}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[10px] block font-sans">Price Variance:</span>
                <span className="font-bold text-emerald-700">
                  {opt.costDeltaUsd === 0 ? 'Included Base' : `+$${opt.costDeltaUsd.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
