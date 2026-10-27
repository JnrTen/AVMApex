import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Zap } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600/95 border border-amber-500/80 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-100" />
      <div className="flex items-center gap-1.5">
        <span>Offline / Load-Shedding Mode</span>
        <span className="text-amber-200">·</span>
        <span className="text-amber-100 font-normal">All scans & production data caching locally</span>
      </div>
      <Zap className="w-3.5 h-3.5 text-amber-200 ml-1" />
    </div>
  );
};
