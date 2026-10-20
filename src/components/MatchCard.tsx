import { Star, ChevronRight, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Match, Team } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface MatchCardProps {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: (teamId: string) => void;
  onSelectMatch: (matchId: string) => void;
  onSelectTeam?: (team: Team) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isFavorite,
  onToggleFavorite,
  onSelectMatch,
  onSelectTeam,
}) => {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isUpcoming = match.status === 'UPCOMING';

  const homeGoals = match.incidents.filter((inc) => inc.type === 'GOAL' && inc.teamId === match.homeTeam.id);
  const awayGoals = match.incidents.filter((inc) => inc.type === 'GOAL' && inc.teamId === match.awayTeam.id);

  const handleTeamClick = (e: React.MouseEvent, team: Team) => {
    e.stopPropagation();
    if (onSelectTeam) {
      onSelectTeam(team);
    }
  };

  return (
    <div 
      onClick={() => onSelectMatch(match.id)}
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${
        isLive 
          ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-black/40 hover:border-amber-400' 
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">
            {match.competition === 'laliga' ? 'LaLiga EA Sports' : 'UEFA Champions League'}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="capitalize">{match.date}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Label */}
          {isLive && (
            <div className="flex items-center gap-1.5 text-red-400 font-bold font-mono tabular-nums bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>{match.minute}&apos;</span>
            </div>
          )}
          {isFinished && (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finalizado</span>
            </div>
          )}
          {isUpcoming && (
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>{match.time}</span>
            </div>
          )}

          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.homeTeam.id);
            }}
            title={isFavorite ? 'Siguiendo este equipo' : 'Seguir equipo'}
            className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Scoreboard area */}
      <div className="p-4 hover:bg-slate-800/20 transition-colors">
        <div className="grid grid-cols-12 items-center gap-2">
          {/* Home Team (Clickable crest or name to see upcoming matches) */}
          <div 
            onClick={(e) => handleTeamClick(e, match.homeTeam)}
            className="col-span-5 flex items-center gap-3 cursor-pointer group hover:opacity-90"
            title={`Ver próximos partidos de ${match.homeTeam.name}`}
          >
            <TeamCrest team={match.homeTeam} size="md" onClick={(e) => handleTeamClick(e, match.homeTeam)} />
            <div className="truncate">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                {match.homeTeam.shortName}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {match.homeTeam.city}
              </p>
            </div>
          </div>

          {/* Central Score or Kickoff Time */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            {isUpcoming ? (
              <div className="flex flex-col items-center">
                <span className="font-mono tabular-nums text-sm font-bold text-amber-400 px-2.5 py-1 bg-slate-950 rounded border border-slate-800">
                  {match.time}
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  HORARIO
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 font-mono tabular-nums text-2xl font-black text-white tracking-wider">
                  <span className={match.homeScore > match.awayScore ? 'text-amber-400' : ''}>
                    {match.homeScore}
                  </span>
                  <span className="text-slate-600 font-light">-</span>
                  <span className={match.awayScore > match.homeScore ? 'text-amber-400' : ''}>
                    {match.awayScore}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                  {isLive ? 'EN VIVO' : 'RESULTADO'}
                </span>
              </div>
            )}
          </div>

          {/* Away Team (Clickable crest or name to see upcoming matches) */}
          <div 
            onClick={(e) => handleTeamClick(e, match.awayTeam)}
            className="col-span-5 flex items-center justify-end gap-3 text-right cursor-pointer group hover:opacity-90"
            title={`Ver próximos partidos de ${match.awayTeam.name}`}
          >
            <div className="truncate">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                {match.awayTeam.shortName}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {match.awayTeam.city}
              </p>
            </div>
            <TeamCrest team={match.awayTeam} size="md" onClick={(e) => handleTeamClick(e, match.awayTeam)} />
          </div>
        </div>

        {/* Goal Scorers row (if any) */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-[11px] text-slate-400 font-medium">
            <div className="space-y-0.5 truncate">
              {homeGoals.map((g) => (
                <div key={g.id} className="truncate">
                  ⚽ {g.player} <span className="font-mono text-slate-500 tabular-nums">{g.minute}&apos;</span>
                </div>
              ))}
            </div>
            <div className="space-y-0.5 text-right truncate">
              {awayGoals.map((g) => (
                <div key={g.id} className="truncate">
                  {g.player} <span className="font-mono text-slate-500 tabular-nums">{g.minute}&apos;</span> ⚽
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Venue & Action */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 truncate text-[11px] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="truncate">{match.venue || 'Estadio oficial'}</span>
        </span>

        <div className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px]">
          <span>Ver ficha</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
