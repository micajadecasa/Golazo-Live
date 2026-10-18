import React, { useState } from 'react';
import { Award, Target, Flame, ArrowUpRight } from 'lucide-react';
import { TOP_SCORERS } from '../data/mockFootballData';
import { Competition } from '../types/football';

export const TopScorersView: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<Competition>('laliga');

  const scorers = TOP_SCORERS[selectedComp];
  const leader = scorers[0];

  return (
    <div className="space-y-6">
      {/* Switcher */}
      <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setSelectedComp('laliga')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedComp === 'laliga'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Trofeo Pichichi · LaLiga EA Sports
        </button>
        <button
          onClick={() => setSelectedComp('champions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            selectedComp === 'champions'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Máximos Goleadores · UEFA Champions League
        </button>
      </div>

      {/* Leader Showcase Card */}
      {leader && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center text-3xl font-black shrink-0">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Líder en solitario</span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                {leader.player}
              </h3>
              <p className="text-xs text-slate-400">
                {leader.teamName} · {leader.matches} partidos jugados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 divide-x divide-slate-800">
            <div className="text-center px-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Goles</span>
              <span className="text-3xl font-black font-mono tabular-nums text-amber-400">
                {leader.goals}
              </span>
            </div>
            <div className="text-center px-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Asistencias</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {leader.assists}
              </span>
            </div>
            <div className="text-center px-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Promedio</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {(leader.goals / leader.matches).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Complete Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Jugador</th>
              <th className="py-3 px-4">Equipo</th>
              <th className="py-3 px-4 text-right">Partidos</th>
              <th className="py-3 px-4 text-right">Asistencias</th>
              <th className="py-3 px-4 text-right">Penaltis</th>
              <th className="py-3 px-4 text-right font-bold text-amber-400">Goles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {scorers.map((scorer) => (
              <tr key={scorer.rank} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-400">
                  {scorer.rank}
                </td>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                  <span>{scorer.player}</span>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {scorer.teamName}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                  {scorer.matches}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                  {scorer.assists}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                  {scorer.penalties}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-base font-black text-amber-400">
                  {scorer.goals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
