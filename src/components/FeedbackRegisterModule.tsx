import React, { useState } from 'react';
import { MessageSquare, Plus, CheckCircle2, UserCheck, Wrench, Bus } from 'lucide-react';
import { FeedbackItem } from '../utils/storage';

interface FeedbackRegisterProps {
  feedback: FeedbackItem[];
  onAddFeedback: (item: FeedbackItem) => void;
}

export const FeedbackRegisterModule: React.FC<FeedbackRegisterProps> = ({ feedback, onAddFeedback }) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [source, setSource] = useState<FeedbackItem['source']>('Driver');
  const [busModel, setBusModel] = useState<string>('City Commuter 65-Seat');
  const [category, setCategory] = useState<FeedbackItem['category']>('Ergonomics');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    const item: FeedbackItem = {
      id: `FDB-${Date.now()}`,
      source,
      busModel,
      category,
      feedbackText,
      actionTaken: actionTaken || 'Under engineering review for next drawing revision.',
      status: actionTaken ? 'IMPLEMENTED_IN_REV' : 'PENDING_REVIEW',
      date: new Date().toISOString().slice(0, 10),
    };

    onAddFeedback(item);
    setShowAddModal(false);
    setFeedbackText('');
    setActionTaken('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">Module 06</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Continuous Design Improvement</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Voice-of-Customer & Fleet Feedback Register
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Systematic capture of driver, mechanic, and passenger insights to iteratively refine drawing revisions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Field Feedback</span>
        </button>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-sm hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/80">
                  {item.source === 'Driver' && <Bus className="w-4 h-4" />}
                  {item.source === 'Mechanic' && <Wrench className="w-4 h-4" />}
                  {item.source === 'Fleet Owner' && <UserCheck className="w-4 h-4" />}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">{item.source} Feedback</span>
                  <span className="text-[11px] text-slate-400">{item.busModel}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  item.status === 'IMPLEMENTED_IN_REV'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
              >
                {item.status === 'IMPLEMENTED_IN_REV' ? 'IMPLEMENTED' : 'PENDING REVIEW'}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
              "{item.feedbackText}"
            </p>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Engineering Action Taken:
              </span>
              <p className="text-slate-300 text-[11px] mt-0.5">{item.actionTaken}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Category: {item.category}</span>
              <span>Logged: {item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Feedback Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-base font-bold">Log Operator Field Feedback</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Feedback Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Driver">Bus Driver</option>
                    <option value="Mechanic">Fleet Mechanic</option>
                    <option value="Fleet Owner">Fleet Director / Owner</option>
                    <option value="Passenger">Passenger Survey</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Ergonomics">Ergonomics</option>
                    <option value="Durability">Structural Durability</option>
                    <option value="Maintenance">Maintenance Access</option>
                    <option value="Passenger Comfort">Passenger Comfort</option>
                    <option value="Paint & Finish">Paint & Livery Durability</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bus Model</label>
                <input
                  type="text"
                  value={busModel}
                  onChange={(e) => setBusModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Observation / Complaint Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Passenger door seal whistles at highway speeds above 80 km/h..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proposed Engineering Action</label>
                <input
                  type="text"
                  placeholder="e.g. Upgrade to hollow EPDM bulb gasket on Drawing AVM-BDY-04"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
