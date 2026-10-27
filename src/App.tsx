/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Pipette,
  ShieldCheck,
  GitBranch,
  FileSpreadsheet,
  AlertOctagon,
  Package,
  Sliders,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Bot,
  MapPin,
} from 'lucide-react';
import {
  StorageService,
  BusProductionItem,
  DrawingItem,
  QualityCheckpointItem,
  DefectItem,
  FeedbackItem,
  MaterialStockItem,
} from './utils/storage';
import { AuthProvider, useAuth } from './firebase/authContext';
import { FirestoreService } from './firebase/firestoreService';
import { UserAuthBar } from './components/UserAuthBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DashboardHome } from './components/DashboardHome';
import { PaintVisionModule } from './components/PaintVisionModule';
import { QualityCheckpointsModule } from './components/QualityCheckpointsModule';
import { ProductionTrackingModule } from './components/ProductionTrackingModule';
import { DrawingRegisterModule } from './components/DrawingRegisterModule';
import { DefectRegisterModule } from './components/DefectRegisterModule';
import { MaterialStockModule } from './components/MaterialStockModule';
import { StandardOptionsModule } from './components/StandardOptionsModule';
import { FeedbackRegisterModule } from './components/FeedbackRegisterModule';
import { GeminiChatbotModule } from './components/GeminiChatbotModule';
import { WeldingVisionModule } from './components/WeldingVisionModule';
import { NewBusOrderModal } from './components/NewBusOrderModal';
import { AvmLogo } from './components/AvmLogo';
import { Flame, Plus } from 'lucide-react';

type ActiveTab =
  | 'dashboard'
  | 'paint'
  | 'welding'
  | 'chat'
  | 'checkpoints'
  | 'production'
  | 'drawings'
  | 'defects'
  | 'stock'
  | 'options'
  | 'feedback';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  // Core application persistent state
  const [buses, setBuses] = useState<BusProductionItem[]>(() => StorageService.getBuses());
  const [drawings, setDrawings] = useState<DrawingItem[]>(() => StorageService.getDrawings());
  const [checkpoints, setCheckpoints] = useState<QualityCheckpointItem[]>(() =>
    StorageService.getCheckpoints()
  );
  const [defects, setDefects] = useState<DefectItem[]>(() => StorageService.getDefects());
  const [stock, setStock] = useState<MaterialStockItem[]>(() => StorageService.getStock());
  const [feedback, setFeedback] = useState<FeedbackItem[]>(() => StorageService.getFeedback());
  const options = StorageService.getOptions();

  // Subscribe to real-time Cloud Firestore updates when online
  useEffect(() => {
    const unsubBuses = FirestoreService.subscribeBuses((firestoreBuses) => {
      setBuses(firestoreBuses);
      StorageService.saveBuses(firestoreBuses);
    });

    const unsubDefects = FirestoreService.subscribeDefects((firestoreDefects) => {
      setDefects(firestoreDefects);
      StorageService.saveDefects(firestoreDefects);
    });

    const unsubCheckpoints = FirestoreService.subscribeCheckpoints((firestoreCheckpoints) => {
      setCheckpoints(firestoreCheckpoints);
      StorageService.saveCheckpoints(firestoreCheckpoints);
    });

    return () => {
      unsubBuses();
      unsubDefects();
      unsubCheckpoints();
    };
  }, []);

  // Sync to storage & Firestore on updates
  const handleAddBus = (newBus: BusProductionItem) => {
    const list = [newBus, ...buses];
    setBuses(list);
    StorageService.saveBuses(list);
    FirestoreService.syncBus(newBus);
  };

  const handleUpdateBus = (updated: BusProductionItem) => {
    const list = buses.map((b) => (b.id === updated.id ? updated : b));
    setBuses(list);
    StorageService.saveBuses(list);
    FirestoreService.syncBus(updated);
  };

  const handleAddDrawing = (dwg: DrawingItem) => {
    const list = [dwg, ...drawings];
    setDrawings(list);
    StorageService.saveDrawings(list);
  };

  const handleUpdateDrawing = (updatedDwg: DrawingItem) => {
    const list = drawings.map((d) => (d.id === updatedDwg.id ? updatedDwg : d));
    setDrawings(list);
    StorageService.saveDrawings(list);
  };

  const handleAddCheckpoint = (cp: QualityCheckpointItem) => {
    const list = [cp, ...checkpoints];
    setCheckpoints(list);
    StorageService.saveCheckpoints(list);
    FirestoreService.syncCheckpoint(cp);
  };

  const handleAddDefect = (def: DefectItem) => {
    const list = [def, ...defects];
    setDefects(list);
    StorageService.saveDefects(list);
    FirestoreService.syncDefect(def);
  };

  const handleResolveDefect = (id: string) => {
    const resolvedItem = defects.find((d) => d.id === id);
    const list = defects.map((d) =>
      d.id === id
        ? {
            ...d,
            status: 'RESOLVED' as const,
            resolvedDate: new Date().toISOString().slice(0, 10),
          }
        : d
    );
    setDefects(list);
    StorageService.saveDefects(list);
    if (resolvedItem) {
      FirestoreService.syncDefect({
        ...resolvedItem,
        status: 'RESOLVED',
        resolvedDate: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleUpdateStockItem = (item: MaterialStockItem) => {
    const list = stock.map((s) => (s.id === item.id ? item : s));
    setStock(list);
    StorageService.saveStock(list);
    FirestoreService.syncStockItem(item);
  };

  const handleAddFeedback = (item: FeedbackItem) => {
    const list = [item, ...feedback];
    setFeedback(list);
    StorageService.saveFeedback(list);
  };

  const handleQuickRestock = (stockId: string) => {
    const item = stock.find((s) => s.id === stockId);
    if (item) {
      handleUpdateStockItem({ ...item, currentStock: item.currentStock + 10 });
    }
  };

  const lowStockCount = stock.filter((s) => s.currentStock <= s.minLevel).length;
  const openDefectCount = defects.filter((d) => d.status === 'OPEN').length;

  return (
    <div
      className="min-h-screen bg-stylish-light industrial-grid-light text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white"
      style={{ fontFamily: "'Times New Roman', Times, 'Tinos', serif" }}
    >
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element Brand Zone with Official AVM Logo
        Zone 2: Clean navigation links
        Zone 3: Primary actions (Google Sign-In, PWA Install, Reset)
      */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-slate-200/80 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <AvmLogo className="h-7" />
            <span>AVM Production Control</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/90 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('paint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'paint'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>Paint Vision</span>
          </button>
          <button
            onClick={() => setActiveTab('welding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'welding'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Weld Vision</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Gemini & Maps AI</span>
          </button>
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Checkpoints
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'production'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Production Flow
          </button>
          <button
            onClick={() => setActiveTab('drawings')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'drawings'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Drawings
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'defects'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Defects</span>
            {openDefectCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {openDefectCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Materials</span>
            {lowStockCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'options'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Options
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Feedback
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* New Bus Order Button */}
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Reset Factory Seed Data Button */}
          <button
            onClick={StorageService.resetAll}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset data to factory baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Google Sign-In & Firebase Auth Bar */}
          <UserAuthBar />
        </div>
      </header>

      {/* Sub-header Mobile Tab Bar for narrow screens */}
      <div className="xl:hidden bg-white/90 border-b border-slate-200/90 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold no-scrollbar shadow-xs">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'paint', label: 'Paint Vision' },
          { id: 'welding', label: 'Weld Vision' },
          { id: 'chat', label: 'Gemini AI & Maps' },
          { id: 'checkpoints', label: 'Checkpoints' },
          { id: 'production', label: 'Production' },
          { id: 'drawings', label: 'Drawings' },
          { id: 'defects', label: `Defects (${openDefectCount})` },
          { id: 'stock', label: `Materials (${lowStockCount})` },
          { id: 'options', label: 'Options' },
          { id: 'feedback', label: 'Feedback' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardHome
            buses={buses}
            defects={defects}
            stock={stock}
            onNavigateTab={(t) => setActiveTab(t as ActiveTab)}
            onQuickRestock={handleQuickRestock}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />
        )}

        {activeTab === 'paint' && (
          <PaintVisionModule
            buses={buses}
            onScanSaved={() => {
              // Trigger sync
            }}
          />
        )}

        {activeTab === 'welding' && (
          <WeldingVisionModule
            buses={buses}
            onAddDefect={handleAddDefect}
            onAddCheckpoint={handleAddCheckpoint}
          />
        )}

        {activeTab === 'chat' && <GeminiChatbotModule />}

        {activeTab === 'checkpoints' && (
          <QualityCheckpointsModule
            checkpoints={checkpoints}
            buses={buses}
            onAddCheckpoint={handleAddCheckpoint}
          />
        )}

        {activeTab === 'production' && (
          <ProductionTrackingModule
            buses={buses}
            onUpdateBus={handleUpdateBus}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />
        )}

        {activeTab === 'drawings' && (
          <DrawingRegisterModule
            drawings={drawings}
            onAddDrawing={handleAddDrawing}
            onUpdateDrawing={handleUpdateDrawing}
          />
        )}

        {activeTab === 'defects' && (
          <DefectRegisterModule
            defects={defects}
            buses={buses}
            onAddDefect={handleAddDefect}
            onResolveDefect={handleResolveDefect}
          />
        )}

        {activeTab === 'stock' && (
          <MaterialStockModule
            stock={stock}
            onUpdateItem={handleUpdateStockItem}
            buses={buses}
          />
        )}

        {activeTab === 'options' && (
          <StandardOptionsModule
            options={options}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackRegisterModule feedback={feedback} onAddFeedback={handleAddFeedback} />
        )}
      </main>

      {/* New Bus Order Modal */}
      <NewBusOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        existingBuses={buses}
        onCreateOrder={(newBus) => {
          handleAddBus(newBus);
          setActiveTab('production');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white/75 backdrop-blur-md px-4 sm:px-8 py-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="font-medium text-slate-700">AVM Africa Bus Manufacturing & Assembly Operations · Production Control Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>Firebase Auth & Firestore Synced</span>
          <span>·</span>
          <span>Google Maps Grounding Enabled</span>
          <span>·</span>
          <span>Gemini 3.5 Multimodal Engine</span>
        </div>
      </footer>

      {/* Offline Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
