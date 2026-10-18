import React from 'react';
import { RefreshCw, Star, Globe, Radio } from 'lucide-react';

interface LiveOnlineStatusBarProps {
  isRefreshing: boolean;
  isOnlineConnected: boolean;
  lastUpdated: Date;
  onRefreshOnline: () => void;
  matchesCount: number;
  liveCount: number;
  onlyFavoritesAlerts: boolean;
  setOnlyFavoritesAlerts: (val: boolean) => void;
  favoriteTeamsCount: number;
}

export const LiveOnlineStatusBar: React.FC<LiveOnlineStatusBarProps> = ({
  isRefreshing,
  isOnlineConnected,
  lastUpdated,
  onRefreshOnline,
  matchesCount,
  liveCount,
  onlyFavoritesAlerts,
  setOnlyFavoritesAlerts,
  favoriteTeamsCount,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Left: Online Connection Indicator & Matches summary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Resultados Online en Vivo</span>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            · Sincronizado: {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {liveCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/60 border border-red-800/40 rounded-xl text-red-400 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{liveCount} EN DIRECTO</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            {matchesCount} partidos (anteriores y futuros)
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Favorites Only */}
        <button
          onClick={() => setOnlyFavoritesAlerts(!onlyFavoritesAlerts)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            onlyFavoritesAlerts
              ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Filtrar por equipos favoritos"
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavoritesAlerts ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Solo Favoritos ({favoriteTeamsCount})</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefreshOnline}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Actualizar marcadores y partidos ahora"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>
    </div>
  );
};
