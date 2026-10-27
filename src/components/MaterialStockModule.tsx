import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  RefreshCw,
  MapPin,
  Layers,
  Thermometer,
  Calendar,
  CheckCircle2,
  Box,
  Truck,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MaterialStockItem, BusProductionItem } from '../utils/storage';

interface MaterialStockProps {
  stock: MaterialStockItem[];
  onUpdateItem: (item: MaterialStockItem) => void;
  buses?: BusProductionItem[];
}

export const MaterialStockModule: React.FC<MaterialStockProps> = ({
  stock,
  onUpdateItem,
  buses = [],
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [selectedJobAllocationBus, setSelectedJobAllocationBus] = useState<string>(
    buses[0]?.busNo || 'AVM-2026-08'
  );
  const [issueNotice, setIssueNotice] = useState<string | null>(null);

  const handleConsume = (item: MaterialStockItem, amount: number = 1) => {
    const nextVal = Math.max(0, item.currentStock - amount);
    const kanban =
      nextVal <= item.minLevel
        ? ('REORDER_TRIGGERED' as const)
        : nextVal <= item.minLevel * 1.5
        ? ('BIN_2_BUFFER' as const)
        : ('BIN_1_FULL' as const);

    onUpdateItem({
      ...item,
      currentStock: nextVal,
      kanbanCardStatus: kanban,
    });
  };

  const handleRestock = (item: MaterialStockItem, amount: number = 10) => {
    const nextVal = item.currentStock + amount;
    onUpdateItem({
      ...item,
      currentStock: nextVal,
      kanbanCardStatus: 'BIN_1_FULL',
    });
  };

  // Modern Assembly Line: 1-Tap Issue Material to Bus Production Job
  const handleIssueToJob = (item: MaterialStockItem, amount: number = 1) => {
    if (item.currentStock <= 0) return;
    const nextVal = Math.max(0, item.currentStock - amount);
    onUpdateItem({
      ...item,
      currentStock: nextVal,
      lastIssuedToJob: `${selectedJobAllocationBus} (${amount} ${item.unit})`,
    });
    setIssueNotice(
      `Allocated ${amount} ${item.unit} of ${item.code} directly to chassis ${selectedJobAllocationBus}`
    );
    setTimeout(() => setIssueNotice(null), 4000);
  };

  const filteredStock = stock.filter((item) => {
    const matchesZone =
      selectedZoneFilter === 'ALL' || item.storageZone === selectedZoneFilter;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationCode && item.locationCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const lowStockCount = stock.filter((s) => s.currentStock <= s.minLevel).length;
  const totalValuationUsd = stock.reduce((sum, s) => sum + s.currentStock * s.unitCostUsd, 0);

  // Warehouse Zones Configuration
  const WAREHOUSE_ZONES = [
    {
      id: 'Yard Cantilever Racks',
      name: 'Yard Heavy Steel Cantilevers',
      desc: '200x75x6mm PFC channels, RHS tubing, angle irons with mill cert heat numbers.',
      climate: 'Ambient Outdoor Racks (Anti-corrosion primer coated)',
      color: 'border-blue-300 bg-blue-50/60',
    },
    {
      id: 'Sheet Metal Leaf Racks',
      name: 'Vertical Sheet Metal Leaf Racks',
      desc: '1.2mm galvaneal exterior panels, aluminium roof skin with protective timber spacers.',
      climate: 'Indoor Dry Plate Bay (Zero Scratch Handling)',
      color: 'border-indigo-300 bg-indigo-50/60',
    },
    {
      id: 'ATEX Paint Mix Room',
      name: 'Climate-Controlled ATEX Paint Room',
      desc: '2K Polyurethane paints, isocyanate activators, epoxy primers. FIFO rotation.',
      climate: 'Controlled: 19.8°C · Humidity 52% (Explosion-Proof)',
      color: 'border-emerald-300 bg-emerald-50/60',
    },
    {
      id: 'Bonding & Adhesive Vault',
      name: 'Structural Adhesive & Bonding Vault',
      desc: 'Sikaflex-252 polyurethane structural adhesives, primers. Strict shelf life.',
      climate: 'Controlled: 20.5°C · Max 25°C (<9 Months Shelf Life)',
      color: 'border-amber-300 bg-amber-50/60',
    },
    {
      id: 'Fastener Aisle',
      name: 'Fastener & Hardware Two-Bin Aisles',
      desc: 'Structural Huck monobolts, pop rivets, M10 Grade 8.8 bolts. Visual Kanban cards.',
      climate: 'Indoor Aisle 01 to 04 (Two-Bin Gravity Racks)',
      color: 'border-slate-300 bg-slate-50',
    },
    {
      id: 'Glass A-Frame',
      name: 'Glazing & Windscreen Padded A-Frames',
      desc: 'Laminated curved windscreens, UN ECE R43 toughened tinted side window glass.',
      climate: 'Indoor Padded Rubber A-Frames (Trolleys 01-04)',
      color: 'border-cyan-300 bg-cyan-50/60',
    },
    {
      id: 'Trim Mezzanine',
      name: 'Upholstery & Seat Trim Mezzanine',
      desc: 'High-density foam cushions, heavy-duty sanitized vinyl, ceiling grab poles.',
      climate: 'Dry Elevated Mezzanine Storage',
      color: 'border-purple-300 bg-purple-50/60',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 08 · Production Logistics
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-sans">
              Automotive Coordinate Storage & Two-Bin Kanban Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Plant Warehouse Storage & Material Kanban System
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Coordinates physical storage: Heavy Steel Cantilevers, ATEX Climate Paint Vault, Padded Glass A-Frames, and Two-Bin Fastener Aisles with direct Job BOM allocation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
            <span className="text-slate-400 block text-[10px] font-sans">Total Inventory Value:</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              ${totalValuationUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
            <span className="text-slate-400 block text-[10px] font-sans">Kanban Reorder Signals:</span>
            <span
              className={`font-mono font-bold text-sm ${
                lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {lowStockCount} Buffer Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Allocation Notice Banner */}
      {issueNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-sans flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{issueNotice}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700">BOM Updated</span>
        </div>
      )}

      {/* Interactive 2D Warehouse & Yard Layout Visualizer */}
      <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Plant Warehouse Physical Layout & Environmental Telemetry
            </span>
          </div>
          <span className="text-xs text-slate-400 font-sans">
            Tap any storage area to filter items located in that zone
          </span>
        </div>

        {/* 2D Storage Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {WAREHOUSE_ZONES.map((zone) => {
            const isSelected = selectedZoneFilter === zone.id;
            const itemsInZone = stock.filter((s) => s.storageZone === zone.id);
            const hasReorder = itemsInZone.some((s) => s.currentStock <= s.minLevel);

            return (
              <button
                key={zone.id}
                onClick={() =>
                  setSelectedZoneFilter(selectedZoneFilter === zone.id ? 'ALL' : zone.id)
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/20'
                    : `${zone.color} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">
                    ZONE
                  </span>
                  <div className="flex items-center gap-1">
                    {hasReorder && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white text-slate-700 border border-slate-200">
                      {itemsInZone.length} Items
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-tight">{zone.name}</h4>
                <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5 font-sans">
                  {zone.desc}
                </p>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-sans mt-2 pt-1.5 border-t border-slate-200">
                  <Thermometer className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{zone.climate}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assembly Line 1-Tap Job Allocation Bar */}
      <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-800 font-sans">
            Direct Assembly Line BOM Allocation Target:
          </span>
          <select
            value={selectedJobAllocationBus}
            onChange={(e) => setSelectedJobAllocationBus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {buses.map((b) => (
              <option key={b.id} value={b.busNo}>
                {b.busNo} - {b.model.slice(0, 18)} (Bay {b.assignedBay || '01'})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-sans">
          Click <strong>"Issue to Job"</strong> in the table below to immediately allocate components to this active chassis.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Search material code, coordinates (e.g. YARD-CANT-04), lot #, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
          />
        </div>

        {/* Zone Filter Indicator */}
        {selectedZoneFilter !== 'ALL' && (
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-slate-500">Filtered by:</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-semibold font-mono text-[11px]">
              {selectedZoneFilter}
            </span>
            <button
              onClick={() => setSelectedZoneFilter('ALL')}
              className="text-blue-600 hover:underline cursor-pointer text-[11px]"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Material Inventory Table */}
      <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Code & Lot #</th>
                <th className="py-3 px-4">Material Description & Storage Conditions</th>
                <th className="py-3 px-3">Physical Coordinate Location</th>
                <th className="py-3 px-3 text-right">Available Qty</th>
                <th className="py-3 px-3 text-right">Two-Bin Buffer</th>
                <th className="py-3 px-3 text-center">Kanban Status</th>
                <th className="py-3 px-4 text-right">Shopfloor Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredStock.map((item) => {
                const isLow = item.currentStock <= item.minLevel;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isLow ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Item Code & Lot # */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.code}</div>
                      {item.batchLotNo && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Lot: {item.batchLotNo}
                        </div>
                      )}
                    </td>

                    {/* Material Description & Storage */}
                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>
                          Supplier: <strong>{item.supplier}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          ${item.unitCostUsd} / {item.unit}
                        </span>
                        {item.tempControlled && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                            {item.storageTempC || 'Climate Controlled'}
                          </span>
                        )}
                        {item.expiryDate && (
                          <span className="text-amber-700 font-mono">
                            Exp: {item.expiryDate} (FIFO)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Coordinate Location */}
                    <td className="py-3 px-3 font-sans">
                      <span className="font-mono font-bold text-blue-700 block">
                        {item.locationCode || item.storageBin}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.storageZone || 'Standard Warehouse'}
                      </span>
                    </td>

                    {/* Available Qty */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums text-xs">
                      {item.currentStock}{' '}
                      <span className="text-slate-400 font-normal font-sans text-[10px]">
                        {item.unit}
                      </span>
                    </td>

                    {/* Min/Max Buffer */}
                    <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                      {item.minLevel} / {item.maxLevel}
                    </td>

                    {/* Kanban Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                          isLow
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.currentStock <= item.minLevel * 1.5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isLow
                          ? 'REORDER PO'
                          : item.currentStock <= item.minLevel * 1.5
                          ? 'BIN 2 BUFFER'
                          : 'OPTIMAL'}
                      </span>
                    </td>

                    {/* Shopfloor Actions: 1-Tap Issue to Job + Quick Adjust */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Tap Issue to Job */}
                        <button
                          onClick={() => handleIssueToJob(item, 1)}
                          disabled={item.currentStock <= 0}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-sans font-semibold text-[10px] shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                          title={`Issue 1 ${item.unit} to chassis ${selectedJobAllocationBus}`}
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Issue to Job</span>
                        </button>

                        {/* Adjust qty buttons */}
                        <button
                          onClick={() => handleConsume(item, 1)}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer shadow-xs"
                          title="Consume 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestock(item, 10)}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer shadow-xs"
                          title="Restock +10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.lastIssuedToJob && (
                        <div className="text-[9px] text-slate-400 font-sans mt-1">
                          Last Issued: {item.lastIssuedToJob}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
