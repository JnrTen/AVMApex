import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Lock,
  Download,
  Image as ImageIcon,
  FileSearch,
} from 'lucide-react';
import { DrawingItem } from '../utils/storage';

interface DrawingViewerModalProps {
  drawing: DrawingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrawingReviewModal: React.FC<DrawingViewerModalProps> = ({
  drawing,
  isOpen,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen || !drawing) return null;

  const isObsolete = drawing.status === 'OBSOLETE' || drawing.reviewVerdict === 'SUPERSEDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full ${
          isFullscreen ? 'max-w-none h-full' : 'max-w-5xl max-h-[92vh]'
        } flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 transition-all`}
        style={{ fontFamily: "'Times New Roman', Times, 'Tinos', serif" }}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-base font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {drawing.drawingNo}
            </span>
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
              {drawing.version}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-sans">
              {drawing.category}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-bold font-sans ${
                isObsolete
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {drawing.status}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 ml-1">
              {drawing.title}
            </h3>
          </div>

          {/* Controls: Zoom & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs shadow-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1 text-slate-700 min-w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand View'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
              title="Close Drawing"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawing Screen Viewport */}
        <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-3 relative min-h-[400px]">
          {drawing.drawingImageUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto no-scrollbar">
              <img
                src={drawing.drawingImageUrl}
                alt={`${drawing.drawingNo} - ${drawing.title}`}
                referrerPolicy="no-referrer"
                className="max-w-none transition-transform duration-150 select-none object-contain rounded-lg shadow-2xl"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <FileSearch className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-sans">No drawing image available for this reference</p>
            </div>
          )}

          {/* Master Red-Stamp Watermark */}
          <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-xs shadow-md space-y-0.5 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400">{drawing.drawingNo}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-200 border border-blue-700 font-mono">
                {drawing.version}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">
              AVM Africa Production Control · Engineering Master
            </span>
          </div>
        </div>

        {/* Footer Technical Bar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 font-sans">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Location: <strong className="text-slate-800">{drawing.physicalLocation}</strong>
            </span>
            <span>·</span>
            <span>
              Scale: <strong className="text-slate-800">1:20 Metric</strong>
            </span>
            <span>·</span>
            <span>
              CAD File: <strong className="text-slate-800">{(drawing.fileSizeKb / 1024).toFixed(1)} MB</strong>
            </span>
            <span>·</span>
            <span>
              Approved By: <strong className="text-slate-800">{drawing.approvedBy}</strong> ({drawing.approvedDate})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {drawing.drawingImageUrl && (
              <a
                href={drawing.drawingImageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Full Image</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
