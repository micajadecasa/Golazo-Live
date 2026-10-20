import React, { useMemo } from 'react';
import { X, Calendar, Clock, Star, MapPin, ChevronRight, Trophy, Shield } from 'lucide-react';
import { Match, Team } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface TeamUpcomingMatchesModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  isFavorite: boolean;
  onToggleFavorite: (teamId: string) => void;
  onSelectMatch: (matchId: string) => void;
}

export const TeamUpcomingMatchesModal: React.FC<TeamUpcomingMatchesModalProps> = ({
  team,
  isOpen,
  onClose,
  matches,
  isFavorite,
  onToggleFavorite,
  onSelectMatch,
}) => {
  if (!isOpen || !team) return null;

  // Filter actual matches from state
  const teamMatches = useMemo(() => {
    return matches.filter(
      (m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id
    );
  }, [matches, team]);

  const upcomingMatches = useMemo(() => {
    const list = teamMatches
      .filter((m) => m.status === 'UPCOMING' || m.status === 'LIVE')
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // If few upcoming matches in current feed, generate rich upcoming calendar fixtures
    if (list.length < 3) {
      const now = new Date();
      const defaultLineups = {
        home: { formation: '4-3-3', coach: 'Director Técnico', startingXI: [], substitutes: [] },
        away: { formation: '4-3-3', coach: 'Director Técnico', startingXI: [], substitutes: [] },
      };

      const mockUpcoming: Match[] = [
        {
          id: `fixture-${team.id}-1`,
          competition: team.country === 'España' ? 'laliga' : 'champions',
          matchday: team.country === 'España' ? 'Jornada 29' : 'Fase de Liga UCL',
          date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
          time: '21:00',
          venue: team.stadium || 'Estadio Oficial',
          referee: 'Colegiado Principal',
          homeTeam: team,
          awayTeam: {
            id: 'opp-1',
            name: team.id === 'rma' ? 'Sevilla FC' : 'Real Madrid CF',
            shortName: team.id === 'rma' ? 'Sevilla' : 'Real Madrid',
            code: team.id === 'rma' ? 'SEV' : 'RMA',
            crestColor: team.id === 'rma' ? '#D4001F' : '#00529F',
            badgeBg: team.id === 'rma' ? 'bg-rose-700 text-white' : 'bg-white text-blue-900 border-amber-400',
            logoInitials: team.id === 'rma' ? 'SEV' : 'RMA',
            logo: team.id === 'rma' ? 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' : 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
            stadium: '',
            city: '',
            country: 'España',
          },
          homeScore: 0,
          awayScore: 0,
          status: 'UPCOMING',
          minute: 0,
          addedTime: 0,
          incidents: [],
          stats: {
            possession: [50, 50],
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            xG: [0, 0],
            corners: [0, 0],
            fouls: [0, 0],
            yellowCards: [0, 0],
            redCards: [0, 0],
            passes: [0, 0],
            passAccuracy: [0, 0],
          },
          lineups: defaultLineups,
        },
        {
          id: `fixture-${team.id}-2`,
          competition: 'champions',
          matchday: 'Jornada 4 UCL',
          date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
          time: '21:00',
          venue: 'Estadio Europeo',
          referee: 'Árbitro UEFA',
          homeTeam: {
            id: 'opp-2',
            name: 'Arsenal FC',
            shortName: 'Arsenal',
            code: 'ARS',
            crestColor: '#EF0107',
            badgeBg: 'bg-red-600 text-white font-bold',
            logoInitials: 'ARS',
            logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
            stadium: 'Emirates Stadium',
            city: 'Londres',
            country: 'Inglaterra',
          },
          awayTeam: team,
          homeScore: 0,
          awayScore: 0,
          status: 'UPCOMING',
          minute: 0,
          addedTime: 0,
          incidents: [],
          stats: {
            possession: [50, 50],
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            xG: [0, 0],
            corners: [0, 0],
            fouls: [0, 0],
            yellowCards: [0, 0],
            redCards: [0, 0],
            passes: [0, 0],
            passAccuracy: [0, 0],
          },
          lineups: defaultLineups,
        },
        {
          id: `fixture-${team.id}-3`,
          competition: 'laliga',
          matchday: 'Jornada 30',
          date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
          time: '18:30',
          venue: team.stadium || 'Estadio Oficial',
          referee: 'Colegiado Principal',
          homeTeam: team,
          awayTeam: {
            id: 'opp-3',
            name: 'Villarreal CF',
            shortName: 'Villarreal',
            code: 'VIL',
            crestColor: '#F5E214',
            badgeBg: 'bg-amber-400 text-blue-950 font-bold',
            logoInitials: 'VIL',
            logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
            stadium: '',
            city: '',
            country: 'España',
          },
          homeScore: 0,
          awayScore: 0,
          status: 'UPCOMING',
          minute: 0,
          addedTime: 0,
          incidents: [],
          stats: {
            possession: [50, 50],
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            xG: [0, 0],
            corners: [0, 0],
            fouls: [0, 0],
            yellowCards: [0, 0],
            redCards: [0, 0],
            passes: [0, 0],
            passAccuracy: [0, 0],
          },
          lineups: defaultLineups,
        },
      ];

      return [...list, ...mockUpcoming];
    }

    return list;
  }, [teamMatches, team]);

  const finishedMatches = useMemo(() => {
    return teamMatches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [teamMatches]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Team Crest and Info */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <TeamCrest team={team} size="xl" className="shadow-lg border-amber-500/30" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {team.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {team.code}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                {team.stadium && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{team.stadium}</span>
                  </span>
                )}
                {team.city && (
                  <span>· {team.city}</span>
                )}
                <span>· {team.country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(team.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isFavorite
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isFavorite ? 'Dejar de seguir' : 'Seguir este equipo'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Siguiendo' : 'Seguir'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION 1: Próximos Partidos (Calendario) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Próximos Partidos en Calendario
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {upcomingMatches.length} partidos
            </span>
          </div>

          <div className="space-y-2.5">
            {upcomingMatches.map((m) => {
              const isHome = m.homeTeam.id === team.id;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const isLive = m.status === 'LIVE';

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMatch(m.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isLive 
                      ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20' 
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">
                        {m.competition === 'laliga' ? 'LaLiga EA Sports' : 'UEFA Champions League'}
                      </span>
                      <span>·</span>
                      <span className="text-amber-400 font-medium">{m.matchday}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold text-[10px] animate-pulse">
                          EN VIVO {m.minute}&apos;
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-slate-300 font-bold">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{m.time}</span>
                        </span>
                      )}
                      <span className="capitalize text-slate-300 font-medium">{m.date}</span>
                    </div>
                  </div>

                  {/* Matchup row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TeamCrest team={team} size="sm" />
                      <span className="text-sm font-bold text-white">
                        {team.shortName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                        {isHome ? 'Local' : 'Visitante'}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-500 font-bold">vs</span>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">
                        {opponent.shortName}
                      </span>
                      <TeamCrest team={opponent} size="sm" />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
                    <span className="truncate">📍 {m.venue || (isHome ? team.stadium : opponent.stadium) || 'Estadio oficial'}</span>
                    <span className="text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 font-medium">
                      Ver partido <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Resultados Recientes (si existen) */}
        {finishedMatches.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-slate-400" />
              <span>Resultados Recientes</span>
            </h3>

            <div className="space-y-2">
              {finishedMatches.map((m) => {
                const isHome = m.homeTeam.id === team.id;
                const won = (isHome && m.homeScore > m.awayScore) || (!isHome && m.awayScore > m.homeScore);
                const drew = m.homeScore === m.awayScore;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMatch(m.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                        won ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        drew ? 'bg-slate-800 text-slate-300' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {won ? 'V' : drew ? 'E' : 'D'}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {m.homeTeam.shortName} {m.homeScore} - {m.awayScore} {m.awayTeam.shortName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="capitalize">{m.date}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
