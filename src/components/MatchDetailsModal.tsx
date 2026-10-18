import React, { useState } from 'react';
import { X, Play, ShieldAlert, Users, Activity, ListFilter, MapPin, CheckCircle2 } from 'lucide-react';
import { Match, LineupPlayer } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface MatchDetailsModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'stats' | 'lineups'>('incidents');

  if (!isOpen || !match) return null;

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Stadium Header Backdrop */}
        <div className="relative h-44 sm:h-52 bg-slate-950 overflow-hidden shrink-0 border-b border-slate-800">
          <img
            src="/src/assets/images/hero_football_stadium_1792358279233.jpg"
            alt="Estadio de fútbol"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top competition info */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-amber-400">
              {match.competition === 'laliga' ? 'LaLiga EA Sports' : 'UEFA Champions League'}
            </span>
            <span className="text-slate-400 font-normal">· {match.matchday}</span>
          </div>

          {/* Match Scoreboard Overlay */}
          <div className="absolute inset-x-0 bottom-3 px-4 sm:px-8 flex items-center justify-between">
            {/* Home */}
            <div className="flex items-center gap-3 w-5/12">
              <TeamCrest team={match.homeTeam} size="lg" />
              <div className="truncate">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {match.homeTeam.name}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {match.lineups.home.coach}
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center text-center shrink-0 w-2/12">
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-black text-white tracking-wider flex items-center gap-2">
                <span>{match.homeScore}</span>
                <span className="text-slate-500 font-light">-</span>
                <span>{match.awayScore}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold font-mono">
                {isLive && (
                  <span className="flex items-center gap-1 text-red-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {match.minute}&apos;
                  </span>
                )}
                {isFinished && (
                  <span className="text-emerald-400 font-semibold">
                    Finalizado (90&apos;)
                  </span>
                )}
              </div>
            </div>

            {/* Away */}
            <div className="flex items-center justify-end gap-3 w-5/12 text-right">
              <div className="truncate">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {match.awayTeam.name}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {match.lineups.away.coach}
                </p>
              </div>
              <TeamCrest team={match.awayTeam} size="lg" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Quick Action Buttons */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'incidents' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Incidencias ({match.incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'stats' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('lineups')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'lineups' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alineaciones
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{match.date}</span>
            <span aria-hidden="true">·</span>
            <span>{match.time}</span>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: INCIDENCIAS (Timeline) */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-amber-400" />
                <span>Cronología del Partido</span>
              </h4>

              {match.incidents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Sin incidentes registrados aún.
                </div>
              ) : (
                <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-4">
                  {match.incidents.map((inc) => {
                    const isHome = inc.teamId === match.homeTeam.id;
                    return (
                      <div key={inc.id} className="relative group">
                        {/* Timeline dot icon */}
                        <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
                          {inc.type === 'GOAL' ? '⚽' : inc.type === 'YELLOW_CARD' ? '🟨' : inc.type === 'RED_CARD' ? '🟥' : '🔄'}
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono tabular-nums text-xs font-bold text-amber-400">
                                {inc.minute}&apos;
                              </span>
                              <span className="text-sm font-bold text-white">
                                {inc.player}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({isHome ? match.homeTeam.shortName : match.awayTeam.shortName})
                              </span>
                            </div>

                            {inc.scoreText && (
                              <span className="font-mono tabular-nums text-xs font-black text-amber-400 px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                                {inc.scoreText}
                              </span>
                            )}
                          </div>

                          {inc.assist && (
                            <p className="text-xs text-slate-400 mt-1">
                              Asistencia: <span className="text-slate-300 font-medium">{inc.assist}</span>
                            </p>
                          )}
                          {inc.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {inc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Estadísticas en Tiempo Real</span>
              </h4>

              <div className="space-y-3">
                {/* Possession Bar */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-white font-mono tabular-nums">{match.stats.possession[0]}%</span>
                    <span className="text-slate-400 uppercase tracking-wider text-[11px]">Posesión de Balón</span>
                    <span className="text-white font-mono tabular-nums">{match.stats.possession[1]}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                    <div
                      className="bg-amber-400 transition-all duration-500"
                      style={{ width: `${match.stats.possession[0]}%` }}
                    />
                    <div
                      className="bg-blue-500 transition-all duration-500"
                      style={{ width: `${match.stats.possession[1]}%` }}
                    />
                  </div>
                </div>

                {/* Stat rows */}
                {[
                  { label: 'Tiros Totales', home: match.stats.shots[0], away: match.stats.shots[1] },
                  { label: 'Tiros a Puerta', home: match.stats.shotsOnTarget[0], away: match.stats.shotsOnTarget[1] },
                  { label: 'Goles Esperados (xG)', home: match.stats.xG[0].toFixed(2), away: match.stats.xG[1].toFixed(2) },
                  { label: 'Córners', home: match.stats.corners[0], away: match.stats.corners[1] },
                  { label: 'Faltas Cometidas', home: match.stats.fouls[0], away: match.stats.fouls[1] },
                  { label: 'Tarjetas Amarillas', home: match.stats.yellowCards[0], away: match.stats.yellowCards[1] },
                  { label: 'Pases Completados', home: match.stats.passes[0], away: match.stats.passes[1] },
                  { label: 'Precisión de Pase', home: `${match.stats.passAccuracy[0]}%`, away: `${match.stats.passAccuracy[1]}%` },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-lg text-xs border border-slate-800/60">
                    <span className="font-mono tabular-nums font-bold text-white w-16">
                      {stat.home}
                    </span>
                    <span className="text-slate-400 text-center font-medium">
                      {stat.label}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-white w-16 text-right">
                      {stat.away}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALINEACIONES & PITCH */}
          {activeTab === 'lineups' && (
            <div className="space-y-6">
              {/* Tactical summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-white text-xs">{match.homeTeam.name}</h5>
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">Formación: {match.lineups.home.formation}</p>
                  <p className="text-[11px] text-slate-400">Entrenador: {match.lineups.home.coach}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
                  <h5 className="font-bold text-white text-xs">{match.awayTeam.name}</h5>
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">Formación: {match.lineups.away.formation}</p>
                  <p className="text-[11px] text-slate-400">Entrenador: {match.lineups.away.coach}</p>
                </div>
              </div>

              {/* Pitch Visualizer */}
              <div className="relative rounded-2xl p-4 sm:p-6 sports-pitch-pattern border-2 border-emerald-900 shadow-inner overflow-hidden text-white">
                <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none m-3"></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-white/20 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                {/* Home Starting 11 */}
                <div className="relative z-10 mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-2">
                    {match.homeTeam.shortName} (Titulares)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {match.lineups.home.startingXI.map((p) => (
                      <div key={p.number} className="flex items-center gap-2 p-1.5 rounded bg-black/40 backdrop-blur-xs text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                          {p.number}
                        </span>
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-auto tabular-nums">{p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Starting 11 */}
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block mb-2">
                    {match.awayTeam.shortName} (Titulares)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {match.lineups.away.startingXI.map((p) => (
                      <div key={p.number} className="flex items-center gap-2 p-1.5 rounded bg-black/40 backdrop-blur-xs text-xs">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                          {p.number}
                        </span>
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-auto tabular-nums">{p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{match.venue} · Árbitro: {match.referee}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
