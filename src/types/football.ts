export type Competition = 'laliga' | 'champions';

export type MatchStatus = 'LIVE' | 'FINISHED' | 'UPCOMING';

export type IncidentType = 
  | 'GOAL' 
  | 'PENALTY_GOAL' 
  | 'OWN_GOAL' 
  | 'RED_CARD' 
  | 'YELLOW_CARD' 
  | 'SUBSTITUTION' 
  | 'VAR';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  crestColor: string;
  secondaryColor?: string;
  badgeBg: string;
  logoInitials: string;
  logo?: string;
  stadium: string;
  city: string;
  country: string;
}

export interface Incident {
  id: string;
  minute: number;
  addedMinute?: number;
  type: IncidentType;
  teamId: string;
  player: string;
  assist?: string;
  description?: string;
  scoreText?: string;
}

export interface MatchStats {
  possession: [number, number]; // [home, away]
  shots: [number, number];
  shotsOnTarget: [number, number];
  xG: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passes: [number, number];
  passAccuracy: [number, number];
}

export interface LineupPlayer {
  number: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number;
  isCaptain?: boolean;
}

export interface Lineup {
  formation: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: string;
}

export interface Match {
  id: string;
  competition: Competition;
  matchday: string;
  date: string;
  time: string;
  isoDate?: string; // YYYY-MM-DD
  timestamp?: number;
  roundName?: string;
  venue: string;
  referee: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number;
  addedTime: number;
  isHalfTime?: boolean;
  incidents: Incident[];
  stats: MatchStats;
  lineups: {
    home: Lineup;
    away: Lineup;
  };
}

export type TableZone = 
  | 'ucl'          // La Liga 1-4 Champions League
  | 'uel'          // La Liga 5 Europa League
  | 'uecl'         // La Liga 6 Conference League
  | 'relegation'   // La Liga 18-20 Descenso
  | 'mid'          // Zona tranquila
  | 'ucl_top8'     // Champions League Fase Liga 1-8 (Octavos directos)
  | 'ucl_playoff'  // Champions League Fase Liga 9-24 (Dieciseisavos playoff)
  | 'ucl_out';     // Champions League 25-36 (Eliminados)

export interface StandingRow {
  position: number;
  previousPosition: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  zone: TableZone;
}

export interface GoalNotification {
  id: string;
  timestamp: number;
  matchId: string;
  competition: Competition;
  matchTitle: string;
  minute: number;
  teamName: string;
  scorer: string;
  assist?: string;
  scoreHome: number;
  scoreAway: number;
  isFinalResult?: boolean;
  read: boolean;
}

export interface TopScorer {
  rank: number;
  player: string;
  teamName: string;
  teamCode: string;
  teamColor: string;
  goals: number;
  assists: number;
  matches: number;
  penalties: number;
}
