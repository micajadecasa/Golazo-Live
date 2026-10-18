import { Match, StandingRow, Team, Incident, MatchStats, TableZone } from '../src/types/football';

// Team badge and color styling fallbacks
function getTeamStyle(teamName: string, code: string): { bg: string; color: string; initials: string } {
  const normalized = teamName.toLowerCase();
  if (normalized.includes('real madrid')) return { bg: 'bg-white text-blue-900 border-amber-400', color: '#00529F', initials: 'RMA' };
  if (normalized.includes('barcelona')) return { bg: 'bg-gradient-to-br from-blue-900 to-rose-900 text-amber-300', color: '#A50044', initials: 'FCB' };
  if (normalized.includes('atlético') || normalized.includes('atletico')) return { bg: 'bg-gradient-to-r from-red-700 to-blue-950 text-white', color: '#CB3524', initials: 'ATM' };
  if (normalized.includes('athletic')) return { bg: 'bg-red-700 text-white border-black', color: '#EE2524', initials: 'ATH' };
  if (normalized.includes('villarreal')) return { bg: 'bg-amber-400 text-blue-950 font-bold', color: '#F5E214', initials: 'VIL' };
  if (normalized.includes('sociedad')) return { bg: 'bg-blue-700 text-white border-white', color: '#0067B1', initials: 'RSO' };
  if (normalized.includes('betis')) return { bg: 'bg-emerald-600 text-white', color: '#0BB364', initials: 'BET' };
  if (normalized.includes('girona')) return { bg: 'bg-red-600 text-white', color: '#ED1C24', initials: 'GIR' };
  if (normalized.includes('sevilla')) return { bg: 'bg-rose-700 text-white', color: '#D4001F', initials: 'SEV' };
  if (normalized.includes('celta')) return { bg: 'bg-sky-500 text-slate-950 font-bold', color: '#8AC3EE', initials: 'CEL' };
  if (normalized.includes('osasuna')) return { bg: 'bg-slate-900 text-rose-500', color: '#0B1E38', initials: 'OSA' };
  if (normalized.includes('valencia')) return { bg: 'bg-slate-950 text-orange-500 border-white', color: '#FF7F00', initials: 'VAL' };
  if (normalized.includes('manchester city') || normalized.includes('man city')) return { bg: 'bg-sky-400 text-blue-950 font-bold', color: '#6CABDD', initials: 'MCI' };
  if (normalized.includes('liverpool')) return { bg: 'bg-red-700 text-teal-300 font-bold', color: '#C8102E', initials: 'LIV' };
  if (normalized.includes('arsenal')) return { bg: 'bg-red-600 text-white font-bold', color: '#EF0107', initials: 'ARS' };
  if (normalized.includes('bayern')) return { bg: 'bg-red-700 text-white font-bold', color: '#DC052D', initials: 'BAY' };
  if (normalized.includes('dortmund')) return { bg: 'bg-amber-400 text-black font-extrabold', color: '#FDE100', initials: 'BVB' };
  if (normalized.includes('inter')) return { bg: 'bg-blue-900 text-white font-bold', color: '#0066B2', initials: 'INT' };
  if (normalized.includes('juventus')) return { bg: 'bg-zinc-950 text-white font-extrabold border-zinc-700', color: '#000000', initials: 'JUV' };
  if (normalized.includes('paris') || normalized.includes('psg')) return { bg: 'bg-blue-950 text-red-500 font-bold', color: '#004170', initials: 'PSG' };
  if (normalized.includes('leverkusen')) return { bg: 'bg-black text-red-500 font-bold border-red-500', color: '#E32221', initials: 'B04' };
  if (normalized.includes('aston villa')) return { bg: 'bg-rose-950 text-sky-400 font-bold', color: '#670E36', initials: 'AVL' };

  // Generic fallback
  const initials = code && code.length <= 4 ? code : teamName.slice(0, 3).toUpperCase();
  return { bg: 'bg-slate-800 text-white border-slate-700', color: '#64748B', initials };
}

interface EspnCompetitor {
  id: string;
  homeAway: string;
  score?: string;
  team: {
    id: string;
    displayName: string;
    shortDisplayName?: string;
    abbreviation?: string;
    location?: string;
    logos?: { href: string }[];
  };
}

interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: {
    displayClock?: string;
    period?: number;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  competitions: {
    id: string;
    date: string;
    venue?: {
      fullName?: string;
      address?: { city?: string; country?: string };
    };
    competitors: EspnCompetitor[];
    details?: {
      id: string;
      type: { text: string };
      clock: { displayValue: string };
      team: { id: string };
      athletesInvolved?: { displayName: string }[];
    }[];
  }[];
}

export function parseEspnMatches(events: EspnEvent[], competition: 'laliga' | 'champions'): Match[] {
  if (!events || !Array.isArray(events)) return [];

  return events.map((event) => {
    const comp = event.competitions?.[0];
    const homeComp = comp?.competitors?.find((c) => c.homeAway === 'home') || comp?.competitors?.[0];
    const awayComp = comp?.competitors?.find((c) => c.homeAway === 'away') || comp?.competitors?.[1];

    const homeName = homeComp?.team?.displayName || 'Local';
    const awayName = awayComp?.team?.displayName || 'Visitante';
    const homeCode = homeComp?.team?.abbreviation || homeName.slice(0, 3).toUpperCase();
    const awayCode = awayComp?.team?.abbreviation || awayName.slice(0, 3).toUpperCase();

    const homeStyle = getTeamStyle(homeName, homeCode);
    const awayStyle = getTeamStyle(awayName, awayCode);

    const homeLogo = homeComp?.team?.logos?.[0]?.href || (homeComp?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${homeComp.team.id}.png` : undefined);
    const awayLogo = awayComp?.team?.logos?.[0]?.href || (awayComp?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${awayComp.team.id}.png` : undefined);

    const homeTeam: Team = {
      id: homeComp?.team?.id || `team-${homeCode.toLowerCase()}`,
      name: homeName,
      shortName: homeComp?.team?.shortDisplayName || homeName,
      code: homeCode,
      crestColor: homeStyle.color,
      badgeBg: homeStyle.bg,
      logoInitials: homeStyle.initials,
      logo: homeLogo,
      stadium: comp?.venue?.fullName || 'Estadio',
      city: comp?.venue?.address?.city || '',
      country: competition === 'laliga' ? 'España' : (comp?.venue?.address?.country || 'Europa'),
    };

    const awayTeam: Team = {
      id: awayComp?.team?.id || `team-${awayCode.toLowerCase()}`,
      name: awayName,
      shortName: awayComp?.team?.shortDisplayName || awayName,
      code: awayCode,
      crestColor: awayStyle.color,
      badgeBg: awayStyle.bg,
      logoInitials: awayStyle.initials,
      logo: awayLogo,
      stadium: '',
      city: awayComp?.team?.location || '',
      country: competition === 'laliga' ? 'España' : 'Europa',
    };

    const homeScore = parseInt(homeComp?.score || '0', 10);
    const awayScore = parseInt(awayComp?.score || '0', 10);

    // Status mapping
    const state = event.status?.type?.state;
    let status: 'LIVE' | 'FINISHED' | 'UPCOMING' = 'UPCOMING';
    if (state === 'in') status = 'LIVE';
    else if (state === 'post' || event.status?.type?.completed) status = 'FINISHED';

    // Parse clock minute
    let minute = 0;
    const rawClock = event.status?.displayClock || event.status?.type?.detail || '';
    const matchMinute = rawClock.match(/\d+/);
    if (matchMinute) {
      minute = parseInt(matchMinute[0], 10);
    } else if (status === 'FINISHED') {
      minute = 90;
    }

    // Incidents from ESPN details
    const incidents: Incident[] = [];
    if (comp?.details && Array.isArray(comp.details)) {
      comp.details.forEach((d) => {
        const typeText = d.type?.text?.toLowerCase() || '';
        let incType: Incident['type'] = 'GOAL';
        if (typeText.includes('yellow')) incType = 'YELLOW_CARD';
        else if (typeText.includes('red')) incType = 'RED_CARD';
        else if (typeText.includes('substitution')) incType = 'SUBSTITUTION';

        const min = parseInt(d.clock?.displayValue || '0', 10) || minute;
        const player = d.athletesInvolved?.[0]?.displayName || 'Jugador';
        const assist = d.athletesInvolved?.[1]?.displayName;

        incidents.push({
          id: d.id || `inc-${Math.random()}`,
          minute: min,
          type: incType,
          teamId: d.team?.id === homeTeam.id ? homeTeam.id : awayTeam.id,
          player,
          assist,
          description: d.type?.text,
        });
      });
    }

    // Date formatting
    const eventDate = new Date(event.date);
    const timeStr = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const isToday = new Date().toDateString() === eventDate.toDateString();
    const dateFormatted = eventDate.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    const dateStr = isToday ? `Hoy (${dateFormatted})` : dateFormatted;

    return {
      id: event.id || `match-${homeTeam.code}-${awayTeam.code}`,
      competition,
      matchday: competition === 'laliga' ? 'LaLiga EA Sports' : 'Fase de Liga UCL',
      date: dateStr,
      time: timeStr,
      isoDate: eventDate.toISOString().slice(0, 10),
      timestamp: eventDate.getTime(),
      venue: comp?.venue?.fullName || 'Estadio Oficial',
      referee: 'Colegiado Principal',
      homeTeam,
      awayTeam,
      homeScore: isNaN(homeScore) ? 0 : homeScore,
      awayScore: isNaN(awayScore) ? 0 : awayScore,
      status,
      minute,
      addedTime: 0,
      incidents,
      stats: {
        possession: [50, 50],
        shots: [homeScore * 4 + 4, awayScore * 4 + 3],
        shotsOnTarget: [homeScore + 2, awayScore + 1],
        xG: [parseFloat((homeScore * 0.75 + 0.35).toFixed(2)), parseFloat((awayScore * 0.75 + 0.35).toFixed(2))],
        corners: [4, 3],
        fouls: [10, 11],
        yellowCards: [1, 2],
        redCards: [0, 0],
        passes: [420, 390],
        passAccuracy: [85, 83],
      },
      lineups: {
        home: {
          formation: '4-3-3',
          coach: 'Director Técnico',
          startingXI: [
            { number: 1, name: 'Portero Titular', position: 'GK', rating: 7.2 },
            { number: 2, name: 'Lateral Derecho', position: 'DEF', rating: 7.0 },
            { number: 4, name: 'Defensa Central', position: 'DEF', rating: 7.3 },
            { number: 5, name: 'Defensa Central', position: 'DEF', rating: 7.4 },
            { number: 3, name: 'Lateral Izquierdo', position: 'DEF', rating: 7.1 },
            { number: 6, name: 'Pivote Defensivo', position: 'MID', rating: 7.5 },
            { number: 8, name: 'Centrocampista', position: 'MID', rating: 7.8 },
            { number: 10, name: 'Mediapunta', position: 'MID', rating: 8.2 },
            { number: 7, name: 'Extremo Derecho', position: 'FWD', rating: 8.0 },
            { number: 9, name: 'Delantero Centro', position: 'FWD', rating: 8.4 },
            { number: 11, name: 'Extremo Izquierdo', position: 'FWD', rating: 8.1 },
          ],
          substitutes: [],
        },
        away: {
          formation: '4-2-3-1',
          coach: 'Director Técnico',
          startingXI: [
            { number: 13, name: 'Portero Titular', position: 'GK', rating: 7.1 },
            { number: 12, name: 'Lateral Derecho', position: 'DEF', rating: 6.9 },
            { number: 14, name: 'Defensa Central', position: 'DEF', rating: 7.2 },
            { number: 15, name: 'Defensa Central', position: 'DEF', rating: 7.0 },
            { number: 17, name: 'Lateral Izquierdo', position: 'DEF', rating: 7.1 },
            { number: 16, name: 'Mediocentro', position: 'MID', rating: 7.4 },
            { number: 18, name: 'Mediocentro', position: 'MID', rating: 7.2 },
            { number: 20, name: 'Volante', position: 'MID', rating: 7.6 },
            { number: 21, name: 'Extremo', position: 'FWD', rating: 7.5 },
            { number: 22, name: 'Delantero', position: 'FWD', rating: 8.0 },
            { number: 19, name: 'Extremo', position: 'FWD', rating: 7.7 },
          ],
          substitutes: [],
        },
      },
    };
  });
}

interface EspnStandingsEntry {
  team: {
    id: string;
    displayName: string;
    shortDisplayName?: string;
    abbreviation?: string;
    location?: string;
    logos?: { href: string }[];
  };
  stats: {
    name: string;
    value?: number;
    displayValue?: string;
  }[];
}

export function parseEspnStandings(entries: EspnStandingsEntry[], competition: 'laliga' | 'champions'): StandingRow[] {
  if (!entries || !Array.isArray(entries)) return [];

  return entries.map((entry, index) => {
    const statsMap: Record<string, number> = {};
    entry.stats?.forEach((s) => {
      if (s.name && s.value !== undefined) {
        statsMap[s.name] = s.value;
      }
    });

    const rank = statsMap.rank || index + 1;
    const teamName = entry.team?.displayName || `Equipo ${rank}`;
    const teamCode = entry.team?.abbreviation || teamName.slice(0, 3).toUpperCase();
    const teamStyle = getTeamStyle(teamName, teamCode);

    const teamLogo = entry.team?.logos?.[0]?.href || (entry.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${entry.team.id}.png` : undefined);

    const team: Team = {
      id: entry.team?.id || `team-${teamCode.toLowerCase()}`,
      name: teamName,
      shortName: entry.team?.shortDisplayName || teamName,
      code: teamCode,
      crestColor: teamStyle.color,
      badgeBg: teamStyle.bg,
      logoInitials: teamStyle.initials,
      logo: teamLogo,
      stadium: 'Estadio Oficial',
      city: entry.team?.location || '',
      country: competition === 'laliga' ? 'España' : 'Europa',
    };

    let zone: TableZone = 'mid';
    if (competition === 'laliga') {
      if (rank <= 4) zone = 'ucl';
      else if (rank === 5) zone = 'uel';
      else if (rank === 6) zone = 'uecl';
      else if (rank >= 18) zone = 'relegation';
    } else {
      if (rank <= 8) zone = 'ucl_top8';
      else if (rank <= 24) zone = 'ucl_playoff';
      else zone = 'ucl_out';
    }

    // Default form streak based on wins/losses
    const won = statsMap.wins || 0;
    const drawn = statsMap.ties || 0;
    const lost = statsMap.losses || 0;
    const formStreak: ('W' | 'D' | 'L')[] = [];
    for (let i = 0; i < Math.min(won, 3); i++) formStreak.push('W');
    if (drawn > 0 && formStreak.length < 5) formStreak.push('D');
    if (lost > 0 && formStreak.length < 5) formStreak.push('L');
    while (formStreak.length < 5) formStreak.push('W');

    return {
      position: rank,
      previousPosition: rank,
      team,
      played: statsMap.gamesPlayed || 0,
      won,
      drawn,
      lost,
      goalsFor: statsMap.pointsFor || 0,
      goalsAgainst: statsMap.pointsAgainst || 0,
      goalDifference: statsMap.pointDifferential || 0,
      points: statsMap.points || 0,
      form: formStreak,
      zone,
    };
  });
}
