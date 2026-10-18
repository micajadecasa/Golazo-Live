import React, { useState } from 'react';
import { X, Bell, Trash2, Volume2, Sparkles, CheckCheck, Clock } from 'lucide-react';
import { GoalNotification } from '../types/football';
import { soundService, requestBrowserNotificationPermission } from '../services/soundEffects';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: GoalNotification[];
  onClear: () => void;
  onSelectMatch: (matchId: string) => void;
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClear,
  onSelectMatch,
  browserNotificationsEnabled,
  setBrowserNotificationsEnabled,
}) => {
  const [filter, setFilter] = useState<'all' | 'goals' | 'finals'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'goals') return !n.isFinalResult;
    if (filter === 'finals') return !!n.isFinalResult;
    return true;
  });

  const handleTestSound = () => {
    soundService.playGoalSound();
  };

  const handleRequestPush = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res === 'granted') {
      setBrowserNotificationsEnabled(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Centro de Notificaciones en Vivo
              </h3>
              <p className="text-xs text-slate-400">
                Historial de goles instantáneos y resultados finales automáticos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio test & Permissions Banner */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={handleTestSound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Probar Sonido de Gol</span>
          </button>

          {!browserNotificationsEnabled ? (
            <button
              onClick={handleRequestPush}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Permitir Alertas del Navegador</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCheck className="w-4 h-4" />
              <span>Notificaciones web concedidas</span>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('goals')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'goals' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Goles ⚽
            </button>
            <button
              onClick={() => setFilter('finals')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'finals' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Finales 🏁
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={onClear}
              className="text-slate-500 hover:text-rose-400 p-1 flex items-center gap-1 transition-colors cursor-pointer"
              title="Borrar historial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No hay notificaciones registradas</p>
              <p className="text-xs text-slate-600 mt-1">
                Los goles en vivo y pitidos finales aparecerán aquí con su audio y marcador en tiempo real.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectMatch(item.matchId);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-amber-400/60 ${
                  item.isFinalResult
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-950/70 border-slate-800/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {item.isFinalResult ? '🏁' : '⚽'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {item.isFinalResult ? 'Resultado Final' : `¡Gol de ${item.scorer}!`}
                        </h4>
                        <span className="text-[11px] font-mono text-amber-400">
                          {item.minute}&apos;
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.matchTitle} · {item.teamName}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono tabular-nums text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded border border-slate-700 shrink-0">
                    {item.scoreHome} - {item.scoreAway}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
