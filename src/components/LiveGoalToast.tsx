import React from 'react';
import { X, ArrowRight, BellRing } from 'lucide-react';
import { GoalNotification } from '../types/football';

interface LiveGoalToastProps {
  notification: GoalNotification | null;
  onClose: () => void;
  onSelectMatch: (matchId: string) => void;
}

export const LiveGoalToast: React.FC<LiveGoalToastProps> = ({
  notification,
  onClose,
  onSelectMatch,
}) => {
  if (!notification) return null;

  const isFinal = notification.isFinalResult;

  return (
    <aside 
      aria-label="Notificación en vivo"
      className="fixed top-20 right-4 z-50 max-w-md w-full animate-bounce-short transition-all"
    >
      <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all ${
        isFinal 
          ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-950/40' 
          : 'bg-slate-900/95 border-amber-500/60 shadow-amber-950/40'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 ${
              isFinal ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
            }`}>
              {isFinal ? '🏁' : '⚽'}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BellRing className="w-3.5 h-3.5" />
                <span>{isFinal ? 'Resultado Final Oficial' : `¡GOOOL EN VIVO! · ${notification.minute}'`}</span>
              </div>
              <h4 className="text-base font-bold text-white leading-tight mt-0.5">
                {isFinal ? notification.matchTitle : notification.scorer}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFinal ? (
                  <span>Marcador definitivo confirmado · Tabla recalculada</span>
                ) : (
                  <span>
                    para <strong className="text-slate-200">{notification.teamName}</strong>
                    {notification.assist && ` (asistencia de ${notification.assist})`}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scoreboard bar inside toast */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{notification.matchTitle}</span>
            <span className="font-mono tabular-nums text-sm font-bold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-white">
              {notification.scoreHome} - {notification.scoreAway}
            </span>
          </div>

          <button
            onClick={() => {
              onSelectMatch(notification.matchId);
              onClose();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>Ver detalles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
