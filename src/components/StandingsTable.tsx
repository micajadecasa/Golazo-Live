import React, { useState } from 'react';
import { Search, Star, Trophy, Info } from 'lucide-react';
import { StandingRow, Competition, Team } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface StandingsTableProps {
  laligaStandings: StandingRow[];
  championsStandings: StandingRow[];
  favoriteTeams: string[];
  onToggleFavorite: (teamId: string) => void;
  onSelectTeam?: (team: Team) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  laligaStandings,
  championsStandings,
  favoriteTeams,
  onToggleFavorite,
  onSelectTeam,
}) => {
  const [selectedComp, setSelectedComp] = useState<Competition>('laliga');
  const [searchQuery, setSearchQuery] = useState('');

  const currentTable = selectedComp === 'laliga' ? laligaStandings : championsStandings;

  const filteredRows = currentTable.filter((row) =>
    row.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.team.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls: Competition Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Interactive Segmented Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedComp('laliga')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedComp === 'laliga'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LaLiga EA Sports (20 Equipos)
          </button>
          <button
            onClick={() => setSelectedComp('champions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedComp === 'champions'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            UEFA Champions League (Fase Liga)
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar equipo..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Explanatory rules bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {selectedComp === 'laliga' ? (
              <span>
                Criterio oficial: Puntos &gt; Diferencia de goles particular / general &gt; Goles a favor.
              </span>
            ) : (
              <span>
                Nuevo formato de Liga Única: Posiciones 1 al 8 clasifican directo a Octavos. Posiciones 9 al 24 van al Play-off.
              </span>
            )}
          </span>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 text-[11px]">
          {selectedComp === 'laliga' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                <span>Champions League (1-4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                <span>Europa League (5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span>Descenso (18-20)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                <span>Octavos Directos (1-8)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
                <span>Play-offs (9-24)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">Pos</th>
                <th className="py-3 px-4 min-w-[200px]">Club</th>
                <th className="py-3 px-3 text-right">PJ</th>
                <th className="py-3 px-3 text-right">V</th>
                <th className="py-3 px-3 text-right">E</th>
                <th className="py-3 px-3 text-right">D</th>
                <th className="py-3 px-3 text-right hidden sm:table-cell">GF</th>
                <th className="py-3 px-3 text-right hidden sm:table-cell">GC</th>
                <th className="py-3 px-3 text-right">DG</th>
                <th className="py-3 px-4 text-right font-bold text-amber-400">PTS</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Últimos 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.map((row) => {
                const isFav = favoriteTeams.includes(row.team.id);

                // Border indicator for qualification zones
                let zoneColor = 'border-transparent';
                if (row.zone === 'ucl' || row.zone === 'ucl_top8') zoneColor = 'border-l-4 border-l-blue-500';
                else if (row.zone === 'uel') zoneColor = 'border-l-4 border-l-amber-500';
                else if (row.zone === 'uecl' || row.zone === 'ucl_playoff') zoneColor = 'border-l-4 border-l-sky-500';
                else if (row.zone === 'relegation') zoneColor = 'border-l-4 border-l-rose-500';

                return (
                  <tr
                    key={row.team.id}
                    className={`hover:bg-slate-800/50 transition-colors ${zoneColor} ${
                      isFav ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-300">
                      {row.position}
                    </td>

                    {/* Team Name & Crest */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleFavorite(row.team.id)}
                          className="text-slate-600 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Seguir equipo"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <TeamCrest team={row.team} size="sm" onClick={() => onSelectTeam?.(row.team)} />
                        <div 
                          className="truncate cursor-pointer group"
                          onClick={() => onSelectTeam?.(row.team)}
                          title={`Ver próximos partidos de ${row.team.name}`}
                        >
                          <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {row.team.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {row.team.stadium}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Numerical Stats */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {row.played}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                      {row.won}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                      {row.drawn}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                      {row.lost}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400 hidden sm:table-cell">
                      {row.goalsFor}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400 hidden sm:table-cell">
                      {row.goalsAgainst}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-300">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-sm font-black text-amber-400">
                      {row.points}
                    </td>

                    {/* Form Streak */}
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <div className="inline-flex items-center gap-1">
                        {row.form.map((res, i) => (
                          <span
                            key={i}
                            title={res === 'W' ? 'Victoria' : res === 'D' ? 'Empate' : 'Derrota'}
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono ${
                              res === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : res === 'D'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
