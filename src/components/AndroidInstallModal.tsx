import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle, Zap, QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // If running in standalone mode (already installed), do not auto-open
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    if (forceOpen) {
      setIsVisible(true);
      return;
    }

    // Auto-show prompt on initial web visit after 700ms so user sees the installation prompt
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [isInstalled, forceOpen]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsVisible(false);
      }
    } else {
      // Show guided instructions for Android Chrome / browsers
      setShowManualGuide(true);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (isInstalled || (!isVisible && !forceOpen)) {
    return null;
  }

  return (
    <aside
      aria-label="Instalación en Android"
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 relative overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar with badge and close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-md font-black">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Disponible para Android</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Instalar App en Android
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar aviso de instalación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Features highlight */}
        <div className="mt-3 text-xs text-slate-300 space-y-2">
          <p className="text-slate-300">
            Lleva los marcadores en vivo de <strong className="text-amber-400">LaLiga</strong> y la <strong className="text-amber-400">Champions</strong> en tu pantalla de inicio como una aplicación nativa:
          </p>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Notificaciones instantáneas de cada gol con sonido</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pantalla completa fluida sin marcos del navegador</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Acceso rápido directo con el icono oficial de la app</span>
            </li>
          </ul>
        </div>

        {/* Manual guide step-by-step for Android Chrome / Browsers */}
        {showManualGuide && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 animate-in fade-in">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pasos para instalar en tu móvil Android:</span>
            </p>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>En Chrome para Android, pulsa el menú de tres puntos <strong className="text-white font-mono">⋮</strong> (arriba a la derecha).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Toca <strong className="text-amber-300">&quot;Instalar aplicación&quot;</strong> o <strong className="text-amber-300">&quot;Añadir a la pantalla de inicio&quot;</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Pulsa <strong className="text-white">Instalar</strong> y ¡listo! Ya la tendrás en tu cajón de aplicaciones.</span>
              </div>
            </div>

            {/* Quick Share / Open in Phone */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">¿Estás en tu PC? Copia el enlace para abrirlo en el móvil:</span>
              <button
                onClick={handleCopyLink}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isInstallable ? 'Instalar ahora en Android' : 'Instalar en Android'}</span>
          </button>

          <button
            onClick={() => setShowManualGuide(!showManualGuide)}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Ver pasos detallados"
          >
            {showManualGuide ? 'Ocultar guía' : '¿Cómo se instala?'}
          </button>

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 text-slate-400 hover:text-slate-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </aside>
  );
};
