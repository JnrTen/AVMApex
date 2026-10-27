import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Award,
} from 'lucide-react';
import { DrawingItem } from '../utils/storage';
import { DrawingReviewModal } from './DrawingReviewModal';

interface DrawingRegisterProps {
  drawings: DrawingItem[];
  onAddDrawing: (dwg: DrawingItem) => void;
  onUpdateDrawing?: (dwg: DrawingItem) => void;
}

export const DrawingRegisterModule: React.FC<DrawingRegisterProps> = ({
  drawings,
  onAddDrawing,
  onUpdateDrawing,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Selected drawing for review inspection modal
  const [selectedReviewDrawing, setSelectedReviewDrawing] = useState<DrawingItem | null>(null);

  // New drawing form state
  const [newDwgNo, setNewDwgNo] = useState<string>('AVM-STR-2026-');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newVersion, setNewVersion] = useState<string>('Rev 1.0');
  const [newCategory, setNewCategory] = useState<DrawingItem['category']>('Structural');
  const [newApprover, setNewApprover] = useState<string>('Eng. T. Mutasa');
  const [newLocation, setNewLocation] = useState<string>('Cabinet A - Drawer 3');
  const [newDesignRationale, setNewDesignRationale] = useState<string>('');

  const filteredDrawings = drawings.filter((dwg) => {
    const matchesCat = filterCategory === 'ALL' || dwg.category === filterCategory;
    const matchesQuery =
      dwg.drawingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dwg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dwg.approvedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dwg.leadReviewer && dwg.leadReviewer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dwg.reviewVerdict && dwg.reviewVerdict.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDwgNo || !newTitle) return;

    const item: DrawingItem = {
      id: `DWG-${Date.now()}`,
      drawingNo: newDwgNo.trim().toUpperCase(),
      title: newTitle.trim(),
      version: newVersion.trim(),
      category: newCategory,
      status: 'ACTIVE',
      approvedBy: newApprover.trim(),
      approvedDate: new Date().toISOString().slice(0, 10),
      physicalLocation: newLocation.trim(),
      fileSizeKb: 2500,
      leadReviewer: newApprover.trim(),
      leadReviewerRole: 'Certifying Engineering Authority',
      latestReviewDate: new Date().toISOString().slice(0, 10),
      reviewVerdict: 'APPROVED',
      reviewCode: `REV-${newDwgNo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
      standardsCompliance: [
        'AWS D1.1 Structural Welding Code - Steel',
        'ISO 9001:2015 Manufacturing Quality Standard',
        'AVM Plant Standard Tolerance ST-01',
      ],
      criticalTolerances: 'Fabrication deviation limit: ±1.5mm on structural; ±0.5mm on body panels.',
      designRationale:
        newDesignRationale.trim() ||
        'Engineered for long-distance durability across varied Zimbabwean road profiles.',
      reviewNotes:
        'Initial baseline engineering review approved. Master physical drawing filed with master red stamp.',
      changeHistory: [
        {
          rev: newVersion.trim(),
          date: new Date().toISOString().slice(0, 10),
          author: newApprover.trim(),
          description: 'Initial release and engineering review approval for production.',
        },
      ],
      reviewComments: [
        {
          id: `RC-${Date.now()}`,
          author: newApprover.trim(),
          role: 'Lead Review Engineer',
          date: new Date().toISOString().slice(0, 10),
          comment: 'Drawing certified for shop floor fabrication.',
          recommendation: 'APPROVE',
        },
      ],
    };

    onAddDrawing(item);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesignRationale('');
  };

  const activeCount = drawings.filter((d) => d.status === 'ACTIVE').length;
  const obsoleteCount = drawings.filter((d) => d.status === 'OBSOLETE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title - Stylish Light Frosted */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 font-sans">
              Module 02 · Design Governance
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-sans">
              {activeCount} Active Masters · {obsoleteCount} Obsolete
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Controlled Engineering Drawing Register
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
            Single source of truth for AVM bus production specifications. Click any{' '}
            <strong className="text-blue-700 font-mono">Drawing Reference</strong> to display the engineering drawing on screen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Drawing</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Search by drawing reference (e.g. AVM-STR-2026-01), title, or engineer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          {['ALL', 'Structural', 'Panel & Body', 'Electrical', 'Paint & Livery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950 text-xs flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 font-sans">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Click any <strong>Drawing Reference</strong> code (e.g. <span className="font-mono text-blue-700 font-bold">AVM-STR-2026-01</span>) or thumbnail to display the CAD drawing on screen.
          </span>
        </div>
      </div>

      {/* Drawing List Table */}
      <div className="bg-white/85 backdrop-blur-md border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Drawing Reference</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-3">Revision</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Approved By</th>
                <th className="py-3 px-4">Physical Master Location</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredDrawings.map((dwg) => {
                const isObsolete = dwg.status === 'OBSOLETE' || dwg.reviewVerdict === 'SUPERSEDED';
                return (
                  <tr key={dwg.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Drawing Reference Link with Thumbnail (Click opens drawing on screen!) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {dwg.drawingImageUrl && (
                          <button
                            onClick={() => setSelectedReviewDrawing(dwg)}
                            className="w-13 h-9.5 rounded-lg overflow-hidden border border-slate-300 bg-slate-950 shrink-0 group/thumb hover:ring-2 hover:ring-blue-500 cursor-pointer shadow-xs transition-all"
                            title="Click to view drawing on screen"
                          >
                            <img
                              src={dwg.drawingImageUrl}
                              alt={dwg.drawingNo}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                            />
                          </button>
                        )}
                        <div>
                          <button
                            onClick={() => setSelectedReviewDrawing(dwg)}
                            className="font-bold text-blue-700 hover:text-blue-900 hover:underline font-mono text-xs sm:text-sm cursor-pointer text-left focus:outline-hidden transition-colors"
                            title="Click to display drawing on screen"
                          >
                            {dwg.drawingNo}
                          </button>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            {(dwg.fileSizeKb / 1024).toFixed(1)} MB CAD Plot
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 font-sans">
                      <span className="font-semibold text-slate-900 block">{dwg.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {dwg.designRationale || 'High-durability African transit specification.'}
                      </span>
                    </td>

                    {/* Revision Code */}
                    <td className="py-3.5 px-3 font-bold text-slate-900 tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {dwg.version}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 font-sans text-slate-700">
                      <span className="font-medium">{dwg.category}</span>
                    </td>

                    {/* Approver column */}
                    <td className="py-3.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                        <ShieldCheck
                          className={`w-3.5 h-3.5 ${
                            isObsolete ? 'text-rose-500' : 'text-emerald-600'
                          }`}
                        />
                        <span>{dwg.approvedBy}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {dwg.approvedDate}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 font-sans text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{dwg.physicalLocation}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border ${
                          isObsolete
                            ? 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {dwg.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Drawing Viewer Modal */}
      <DrawingReviewModal
        drawing={selectedReviewDrawing}
        isOpen={!!selectedReviewDrawing}
        onClose={() => setSelectedReviewDrawing(null)}
      />

      {/* Register New Drawing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 space-y-4"
            style={{ fontFamily: "'Times New Roman', Times, 'Tinos', serif" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                Register Controlled Engineering Drawing
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Drawing Number / Code (e.g. AVM-STR-2026-05)
                </label>
                <input
                  type="text"
                  value={newDwgNo}
                  onChange={(e) => setNewDwgNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Drawing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Side Truss Frame Fabrication Layout"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Revision Code</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Structural">Structural</option>
                    <option value="Panel & Body">Panel & Body</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Paint & Livery">Paint & Livery</option>
                    <option value="Interior">Interior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Certifying Review Engineer
                </label>
                <input
                  type="text"
                  value={newApprover}
                  onChange={(e) => setNewApprover(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Design Rationale & Notes for Review
                </label>
                <textarea
                  rows={2}
                  value={newDesignRationale}
                  onChange={(e) => setNewDesignRationale(e.target.value)}
                  placeholder="e.g. Gusset reinforced for high-deflection corrugation resistance."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-sans focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Physical Master Red-Stamp Location
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-xs"
                >
                  Save & Lock Master Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
