import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, CalendarDays, Check, Flame } from 'lucide-react';
import { Match } from '../types/football';

interface MatchCalendarProps {
  matches: Match[];
  selectedDate: string | null; // ISO Date YYYY-MM-DD or null for all
  onSelectDate: (isoDate: string | null) => void;
}

interface DateOption {
  isoDate: string;
  displayDay: string;
  displayDate: string;
  isToday: boolean;
  isPast: boolean;
  matchCount: number;
  hasUCL: boolean;
  hasLaLiga: boolean;
  hasLive: boolean;
}

export const MatchCalendar: React.FC<MatchCalendarProps> = ({
  matches,
  selectedDate,
  onSelectDate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [viewYear, setViewYear] = useState<number>(2026);

  // Today in 2026
  const todayIso = '2026-10-18';

  // Aggregate distinct dates from matches
  const availableDates: DateOption[] = useMemo(() => {
    const map = new Map<string, { matches: Match[] }>();

    matches.forEach((m) => {
      const iso = m.isoDate || (m.timestamp ? new Date(m.timestamp).toISOString().slice(0, 10) : null);
      if (!iso) return;
      if (!map.has(iso)) {
        map.set(iso, { matches: [] });
      }
      map.get(iso)!.matches.push(m);
    });

    const list: DateOption[] = [];
    Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([iso, data]) => {
        const d = new Date(`${iso}T12:00:00Z`);
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
        const dateName = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const isToday = iso === todayIso;
        const isPast = iso < todayIso;

        list.push({
          isoDate: iso,
          displayDay: isToday ? 'HOY' : dayName.toUpperCase().replace('.', ''),
          displayDate: dateName,
          isToday,
          isPast,
          matchCount: data.matches.length,
          hasUCL: data.matches.some((m) => m.competition === 'champions'),
          hasLaLiga: data.matches.some((m) => m.competition === 'laliga'),
          hasLive: data.matches.some((m) => m.status === 'LIVE'),
        });
      });

    return list;
  }, [matches, todayIso]);

  // Calendar matrix generator for monthly view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Monday is first day of week in Spain (0 = Sun, 1 = Mon ... 6 = Sat)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    // Pad previous month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, iso: null, count: 0 });
    }

    // Days of current month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const monthStr = String(viewMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const iso = `${viewYear}-${monthStr}-${dayStr}`;
      const matchOpt = availableDates.find((ad) => ad.isoDate === iso);

      days.push({
        day: d,
        iso,
        count: matchOpt ? matchOpt.matchCount : 0,
        isToday: iso === todayIso,
        hasUCL: matchOpt?.hasUCL,
        hasLaLiga: matchOpt?.hasLaLiga,
      });
    }

    return days;
  }, [viewYear, viewMonth, availableDates, todayIso]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-3">
      {/* Horizontal Matchday Dates Scroller */}
      <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        {/* Dates Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none flex-1">
          {/* 'All' button */}
          <button
            onClick={() => onSelectDate(null)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex flex-col items-center justify-center min-w-[70px] ${
              selectedDate === null
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Ver</span>
            <span className="text-sm font-bold">Todos</span>
          </button>

          {/* Individual Available Match Dates */}
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.isoDate;
            return (
              <button
                key={item.isoDate}
                onClick={() => onSelectDate(item.isoDate)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex flex-col items-center justify-center min-w-[85px] border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                    : item.isToday
                    ? 'bg-slate-950 border-amber-500/60 text-amber-400 hover:bg-slate-800'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold tracking-wider ${
                    isSelected ? 'text-slate-950' : item.isToday ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {item.displayDay}
                  </span>
                  {item.hasLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </div>

                <span className="text-xs font-black capitalize font-mono tabular-nums mt-0.5">
                  {item.displayDate}
                </span>

                <span className={`text-[10px] mt-0.5 ${
                  isSelected ? 'text-slate-900 font-medium' : 'text-slate-500'
                }`}>
                  {item.matchCount} part.
                </span>
              </button>
            );
          })}
        </div>

        {/* Button to open Full Monthly Calendar */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
          title="Ver calendario mensual completo con fechas"
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Calendario</span>
        </button>
      </div>

      {/* Active Filter notification if a date is selected */}
      {selectedDate && (
        <div className="flex items-center justify-between px-3 py-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Filtrado por fecha: <strong className="text-white font-mono">{selectedDate}</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectDate(null)}
            className="text-xs text-amber-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <span>Quitar filtro de fecha</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Monthly Calendar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Calendario Oficial de Partidos
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else {
                    setViewMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-sm text-white">
                {monthNames[viewMonth]} {viewYear}
              </span>

              <button
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else {
                    setViewMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1 border-b border-slate-800/80">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {calendarDays.map((cd, index) => {
                if (!cd.day) {
                  return <div key={index} className="h-10" />;
                }

                const hasMatches = cd.count > 0;
                const isSelected = selectedDate === cd.iso;

                return (
                  <button
                    key={index}
                    disabled={!hasMatches}
                    onClick={() => {
                      if (hasMatches && cd.iso) {
                        onSelectDate(cd.iso);
                        setIsModalOpen(false);
                      }
                    }}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs relative transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                        : hasMatches
                        ? 'bg-slate-950 border border-slate-700/80 text-white hover:border-amber-400 hover:bg-slate-800 cursor-pointer'
                        : 'text-slate-600 cursor-default opacity-40'
                    }`}
                  >
                    <span className="font-mono tabular-nums text-xs">
                      {cd.day}
                    </span>
                    {hasMatches && (
                      <span className={`text-[9px] font-bold ${
                        isSelected ? 'text-slate-950' : 'text-amber-400'
                      }`}>
                        {cd.count} p.
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick shortcuts */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">Accesos rápidos:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => {
                    onSelectDate('2026-10-18');
                    setIsModalOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Hoy (18 Oct)
                </button>
                <button
                  onClick={() => {
                    onSelectDate('2026-10-20');
                    setIsModalOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Champions (20 Oct)
                </button>
                <button
                  onClick={() => {
                    onSelectDate('2026-10-21');
                    setIsModalOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  Champions (21 Oct)
                </button>
                <button
                  onClick={() => {
                    onSelectDate('2026-10-24');
                    setIsModalOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                >
                  LaLiga (24 Oct)
                </button>
                <button
                  onClick={() => {
                    onSelectDate(null);
                    setIsModalOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer ml-auto"
                >
                  Todos los Días
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
