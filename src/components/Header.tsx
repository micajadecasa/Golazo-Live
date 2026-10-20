import React from 'react';
import { Bell, Volume2, VolumeX, ShieldAlert, Sparkles, Smartphone } from 'lucide-react';
import { requestBrowserNotificationPermission } from '../services/soundEffects';

interface HeaderProps {
  activeTab: 'matches' | 'standings';
  setActiveTab: (tab: 'matches' | 'standings') => void;
  openNotificationCenter: () => void;
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  browserNotificationsEnabled: boolean;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openNotificationCenter,
  unreadCount,
  soundEnabled,
  toggleSound,
  browserNotificationsEnabled,
  setBrowserNotificationsEnabled,
  onOpenInstallModal,
}) => {
  const handleEnableNotifications = async () => {
    const perm = await requestBrowserNotificationPermission();
    if (perm === 'granted') {
      setBrowserNotificationsEnabled(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('matches')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                  G
                </span>
                <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                  Golazo<span className="text-amber-400">Live</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('matches')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'matches' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Partidos en Vivo
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'standings' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Tabla de Posiciones
            </button>
          </nav>

          {/* Zone 3: Actions (Install, Sound, Notifications Bell, CTA) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Install on Android Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                title="Instalar en Android"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Instalar en Android</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
              className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={openNotificationCenter}
              title="Centro de notificaciones de goles"
              className="relative w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center font-mono tabular-nums animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Browser Push Permission CTA */}
            {!browserNotificationsEnabled ? (
              <button
                onClick={handleEnableNotifications}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activar Alertas de Gol</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 px-2 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Alertas activas</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'matches' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Partidos
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded-md cursor-pointer ${
              activeTab === 'standings' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Clasificación
          </button>
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1 rounded-md text-amber-400 bg-amber-400/10 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
