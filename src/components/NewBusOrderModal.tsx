import React, { useState, useEffect } from 'react';
import { Bus, Plus, X, CheckCircle2, Calendar, User, MapPin, Palette } from 'lucide-react';
import { BusProductionItem, AVM_PRODUCTION_STAGES } from '../utils/storage';
import { STANDARD_PAINTS } from '../utils/colorScience';

interface NewBusOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBuses: BusProductionItem[];
  onCreateOrder: (newBus: BusProductionItem) => void;
}

const BUS_MODELS: BusProductionItem['model'][] = [
  'City Commuter 65-Seat',
  'Intercity Express 52-Seat',
  'School Bus 70-Seat',
  'Heavy Duty Rural 60-Seat',
];

const DEFAULT_BAYS = [
  'Chassis Jig Bay 1',
  'Assembly Bay 2',
  'Frames Bay 3',
  'Coach Building Bay 2',
  'Paint Shop Booth 1',
  'Finishing Bay 4',
  'PDI Test Bay 7',
];

const DEFAULT_TECHNICIANS = [
  'K. Shumba',
  'T. Sibanda',
  'M. Zondo',
  'D. Ncube',
  'C. Moyo',
  'E. Sithole',
  'P. Choto',
];

export const NewBusOrderModal: React.FC<NewBusOrderModalProps> = ({
  isOpen,
  onClose,
  existingBuses,
  onCreateOrder,
}) => {
  const getSuggestedBusNo = () => {
    const nums = existingBuses
      .map((b) => {
        const match = b.busNo.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 12;
    const nextNum = String(maxNum + 1).padStart(2, '0');
    return `AVM-2026-${nextNum}`;
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultDeliveryStr = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [busNo, setBusNo] = useState<string>(getSuggestedBusNo());
  const [customer, setCustomer] = useState<string>('');
  const [model, setModel] = useState<BusProductionItem['model']>('City Commuter 65-Seat');
  const [targetLiveryCode, setTargetLiveryCode] = useState<string>('White');
  const [stage, setStage] = useState<number>(1);
  const [assignedBay, setAssignedBay] = useState<string>('Chassis Jig Bay 1');
  const [leadTechnician, setLeadTechnician] = useState<string>('K. Shumba');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>(defaultDeliveryStr);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setBusNo(getSuggestedBusNo());
      setCustomer('');
      setModel('City Commuter 65-Seat');
      setTargetLiveryCode('White');
      setStage(1);
      setAssignedBay('Chassis Jig Bay 1');
      setLeadTechnician('K. Shumba');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEstimatedDelivery(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      setErrorMsg('');
    }
  }, [isOpen, existingBuses.length]);

  if (!isOpen) return null;

  const handleStageChange = (newStage: number) => {
    setStage(newStage);
    if (DEFAULT_BAYS[newStage - 1]) {
      setAssignedBay(DEFAULT_BAYS[newStage - 1]);
    }
    if (DEFAULT_TECHNICIANS[newStage - 1]) {
      setLeadTechnician(DEFAULT_TECHNICIANS[newStage - 1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) {
      setErrorMsg('Please enter a customer or fleet operator name.');
      return;
    }
    if (!busNo.trim()) {
      setErrorMsg('Please enter a valid Bus Number.');
      return;
    }

    const stageName = AVM_PRODUCTION_STAGES[stage - 1] || 'Chassis Assembly';
    const newBus: BusProductionItem = {
      id: `BUS-${Date.now()}`,
      busNo: busNo.trim().toUpperCase(),
      customer: customer.trim(),
      model,
      stage,
      stageName,
      status: stage === 7 ? 'Completed' : 'In Progress',
      isDesignFrozen: stage >= 4,
      targetLiveryCode,
      startDate,
      estimatedDelivery,
      assignedBay: assignedBay.trim() || 'Chassis Jig Bay 1',
      leadTechnician: leadTechnician.trim() || 'K. Shumba',
    };

    onCreateOrder(newBus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Plant Order Intake · Stage 01
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Create New Bus Production Order
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bus Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bus Chassis / Order No. *
              </label>
              <input
                type="text"
                value={busNo}
                onChange={(e) => setBusNo(e.target.value)}
                placeholder="e.g. AVM-2026-13"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer / Fleet Operator *
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. ZUPCO Harare Metro"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Bus Model & Initial Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Coach / Bus Model Specification
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as BusProductionItem['model'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {BUS_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Starting Production Stage
              </label>
              <select
                value={stage}
                onChange={(e) => handleStageChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {AVM_PRODUCTION_STAGES.map((stgName, idx) => (
                  <option key={stgName} value={idx + 1}>
                    Stage {idx + 1}: {stgName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Standard Paint Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Standard Paint Color:</span>
              <span className="font-mono text-blue-700">{targetLiveryCode}</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {STANDARD_PAINTS.map((p) => {
                const isSelected = targetLiveryCode === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setTargetLiveryCode(p.code)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span className="truncate w-full text-center">{p.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Bay & Lead Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Plant Bay</span>
              </label>
              <input
                type="text"
                value={assignedBay}
                onChange={(e) => setAssignedBay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Bay Technician</span>
              </label>
              <input
                type="text"
                value={leadTechnician}
                onChange={(e) => setLeadTechnician(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start Date & Estimated Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Order Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Delivery Date</span>
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Place Bus Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
