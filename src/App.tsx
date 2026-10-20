import { useState, useMemo } from 'react';
import { 
  Filter, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Search,
  Zap
} from 'lucide-react';
import { useLiveMatchEngine } from './hooks/useLiveMatchEngine';
import { Header } from './components/Header';
import { MatchCard } from './components/MatchCard';
import { StandingsTable } from './components/StandingsTable';
import { LiveGoalToast } from './components/LiveGoalToast';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { LiveOnlineStatusBar } from './components/LiveOnlineStatusBar';
import { MatchCalendar } from './components/MatchCalendar';
import { TeamCrest } from './components/TeamCrest';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { TeamUpcomingMatchesModal } from './components/TeamUpcomingMatchesModal';
import { Competition, MatchStatus, Team } from './types/football';

export default function App() {
  const {
    matches,
    laligaStandings,
    championsStandings,
    notifications,
    activeGoalToast,
    isRefreshing,
    isOnlineConnected,
    lastUpdated,
    favoriteTeams,
    onlyFavoritesAlerts,
    soundEnabled,
    browserNotificationsEnabled,
    setOnlyFavoritesAlerts,
    setSoundEnabled,
    setBrowserNotificationsEnabled,
    refreshOnlineData,
    toggleFavoriteTeam,
    clearNotifications,
    dismissGoalToast,
  } = useLiveMatchEngine();

  // Navigation states: Only 'matches' and 'standings' (goleadores removed)
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');
  const [competitionFilter, setCompetitionFilter] = useState<'all' | Competition>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedTeamForUpcoming, setSelectedTeamForUpcoming] = useState<Team | null>(null);

  // Dynamic todayIso based on current local date
  const todayIso = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Selected match for modal
  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  // Matches breakdowns
  const liveMatches = useMemo(() => matches.filter((m) => m.status === 'LIVE'), [matches]);
  const finishedMatches = useMemo(() => matches.filter((m) => m.status === 'FINISHED'), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => m.status === 'UPCOMING'), [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Competition filter
      if (competitionFilter !== 'all' && m.competition !== competitionFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }
      // Interactive Calendar Date filter
      if (selectedDate) {
        const matchIso = m.isoDate || (m.timestamp ? new Date(m.timestamp).toISOString().slice(0, 10) : null);
        if (matchIso !== selectedDate) return false;
      }
      // Favorites filter
      if (onlyFavoritesAlerts) {
        const isFav = favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id);
        if (!isFav) return false;
      }
      // Search by club name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = `${m.homeTeam.name} ${m.awayTeam.name} ${m.homeTeam.code} ${m.awayTeam.code} ${m.venue}`.toLowerCase();
        if (!matchTitle.includes(q)) return false;
      }
      return true;
    });
  }, [matches, competitionFilter, statusFilter, selectedDate, onlyFavoritesAlerts, favoriteTeams, searchQuery]);

  // Priority sorting:
  // 1. Matches involving FAVORITE TEAMS at the very beginning!
  // 2. Matches of TODAY in the forefront!
  // 3. Matches LIVE
  // 4. Matches UPCOMING
  // 5. Matches FINISHED
  const sortedFilteredMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const aFav = favoriteTeams.includes(a.homeTeam.id) || favoriteTeams.includes(a.awayTeam.id);
      const bFav = favoriteTeams.includes(b.homeTeam.id) || favoriteTeams.includes(b.awayTeam.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      const aIsToday = a.isoDate === todayIso || (a.timestamp ? new Date(a.timestamp).toDateString() === new Date().toDateString() : false);
      const bIsToday = b.isoDate === todayIso || (b.timestamp ? new Date(b.timestamp).toDateString() === new Date().toDateString() : false);
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;

      if (a.status === 'UPCOMING' && b.status === 'FINISHED') return -1;
      if (a.status === 'FINISHED' && b.status === 'UPCOMING') return 1;

      return (a.timestamp || 0) - (b.timestamp || 0);
    });
  }, [filteredMatches, favoriteTeams, todayIso]);

  // Featured Spotlight match: prioritize Favorite Team playing today or LIVE, then marquee match of today
  const featuredMatch = useMemo(() => {
    const favLive = liveMatches.find((m) => favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id));
    if (favLive) return favLive;
    if (liveMatches[0]) return liveMatches[0];

    const favToday = matches.find((m) => 
      (m.isoDate === todayIso || (m.timestamp && new Date(m.timestamp).toDateString() === new Date().toDateString())) && 
      (favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id))
    );
    if (favToday) return favToday;

    const anyToday = matches.find((m) => m.isoDate === todayIso || (m.timestamp && new Date(m.timestamp).toDateString() === new Date().toDateString()));
    if (anyToday) return anyToday;

    return upcomingMatches[0] || matches[0];
  }, [liveMatches, favoriteTeams, matches, todayIso, upcomingMatches]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNotificationCenter={() => setIsNotificationCenterOpen(true)}
        unreadCount={unreadCount}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled(!soundEnabled)}
        browserNotificationsEnabled={browserNotificationsEnabled}
        setBrowserNotificationsEnabled={setBrowserNotificationsEnabled}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Floating Live Goal Notification Toast */}
      <LiveGoalToast
        notification={activeGoalToast}
        onClose={dismissGoalToast}
        onSelectMatch={(id) => setSelectedMatchId(id)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time online feed status bar with Date badge */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Fecha actual:</span>
              <strong className="text-white capitalize font-medium">{todayFormatted}</strong>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-semibold border border-amber-400/20 text-[11px]">
                ⭐ Favoritos y partidos de hoy al principio
              </span>
              <span className="hidden sm:inline text-slate-500">·</span>
              <span className="hidden sm:inline text-[11px] text-slate-400">
                Pulsa en cualquier escudo para ver sus próximos partidos
              </span>
            </div>
          </div>

          <LiveOnlineStatusBar
            isRefreshing={isRefreshing}
            isOnlineConnected={isOnlineConnected}
            lastUpdated={lastUpdated}
            onRefreshOnline={refreshOnlineData}
            matchesCount={matches.length}
            liveCount={liveMatches.length}
            onlyFavoritesAlerts={onlyFavoritesAlerts}
            setOnlyFavoritesAlerts={setOnlyFavoritesAlerts}
            favoriteTeamsCount={favoriteTeams.length}
          />
        </div>

        {/* VIEW 1: MATCHES (Partidos de hoy en primer plano, favoritos al principio) */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Featured Match Hero Spotlight */}
            {featuredMatch && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                  {/* Left: Competition & status with official crests */}
                  <div className="space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-400">
                      <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{featuredMatch.competition === 'laliga' ? 'LaLiga EA Sports' : 'UEFA Champions League'}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="capitalize font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {featuredMatch.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                      {/* Home team crest & name */}
                      <div 
                        onClick={() => setSelectedTeamForUpcoming(featuredMatch.homeTeam)}
                        className="flex items-center gap-2 cursor-pointer group"
                        title={`Ver próximos partidos de ${featuredMatch.homeTeam.name}`}
                      >
                        <TeamCrest team={featuredMatch.homeTeam} size="lg" onClick={() => setSelectedTeamForUpcoming(featuredMatch.homeTeam)} />
                        <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                          {featuredMatch.homeTeam.shortName}
                        </h2>
                      </div>

                      <span className="text-amber-400 font-bold text-lg">vs</span>

                      {/* Away team name & crest */}
                      <div 
                        onClick={() => setSelectedTeamForUpcoming(featuredMatch.awayTeam)}
                        className="flex items-center gap-2 cursor-pointer group"
                        title={`Ver próximos partidos de ${featuredMatch.awayTeam.name}`}
                      >
                        <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                          {featuredMatch.awayTeam.shortName}
                        </h2>
                        <TeamCrest team={featuredMatch.awayTeam} size="lg" onClick={() => setSelectedTeamForUpcoming(featuredMatch.awayTeam)} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1">
                      <span>📍 {featuredMatch.venue || 'Estadio oficial'}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-400/90 text-[11px] font-medium">Toca el escudo o nombre para ver calendario del club</span>
                    </p>
                  </div>

                  {/* Center: Score or Scheduled Kickoff time */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg min-w-[200px]">
                    {featuredMatch.status === 'UPCOMING' ? (
                      <div className="text-center">
                        <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">HORARIO OFICIAL</span>
                        <span className="font-mono tabular-nums text-3xl font-black text-amber-400">
                          {featuredMatch.time}
                        </span>
                        <span className="text-xs text-slate-400 capitalize block mt-1">
                          {featuredMatch.date}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="font-mono tabular-nums text-4xl sm:text-5xl font-black text-white tracking-wider flex items-center gap-3">
                          <span>{featuredMatch.homeScore}</span>
                          <span className="text-slate-600 font-light">-</span>
                          <span>{featuredMatch.awayScore}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold font-mono">
                          {featuredMatch.status === 'LIVE' ? (
                            <span className="flex items-center gap-1.5 text-red-400 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              <span>MINUTO {featuredMatch.minute}&apos;</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resultado Final</span>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: View details */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedMatchId(featuredMatch.id)}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ver Ficha y Alineaciones</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Match Calendar Bar (Horizontal matchday carousel + monthly calendar modal) */}
            <MatchCalendar
              matches={matches}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Filter toolbar: Competition & Status tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
              {/* Competition Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setCompetitionFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    competitionFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas las Ligas
                </button>
                <button
                  onClick={() => setCompetitionFilter('laliga')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    competitionFilter === 'laliga'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LaLiga EA Sports
                </button>
                <button
                  onClick={() => setCompetitionFilter('champions')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    competitionFilter === 'champions'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UEFA Champions League
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({matches.length})
                </button>
                {liveMatches.length > 0 && (
                  <button
                    onClick={() => setStatusFilter('LIVE')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === 'LIVE'
                        ? 'bg-red-600 text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                    <span>En Vivo ({liveMatches.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setStatusFilter('FINISHED')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'FINISHED'
                      ? 'bg-slate-800 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resultados ({finishedMatches.length})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('UPCOMING')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'UPCOMING'
                      ? 'bg-slate-800 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calendario ({upcomingMatches.length})</span>
                </button>
              </div>

              {/* Search input: strictly by club name */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar club..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Matches List Ordered (Favorites & Today first) */}
            {sortedFilteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 p-8 space-y-3">
                <Filter className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No hay partidos con estos filtros</h3>
                <p className="text-xs text-slate-500">
                  {selectedDate ? `No se encontraron encuentros en la fecha ${selectedDate}.` : 'Prueba cambiando los filtros.'}
                </p>
                <button
                  onClick={() => {
                    setCompetitionFilter('all');
                    setStatusFilter('all');
                    setSelectedDate(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Ver Todos los Partidos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Listado de Partidos</span>
                    <span>·</span>
                    <span className="text-amber-400">Ordenados con favoritos y hoy al frente</span>
                  </div>
                  <span className="font-mono text-slate-500">{sortedFilteredMatches.length} partidos</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedFilteredMatches.map((m) => {
                    const isFav = favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id);
                    return (
                      <MatchCard
                        key={m.id}
                        match={m}
                        isFavorite={isFav}
                        onToggleFavorite={toggleFavoriteTeam}
                        onSelectMatch={(id) => setSelectedMatchId(id)}
                        onSelectTeam={(team) => setSelectedTeamForUpcoming(team)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STANDINGS TABLE (Tabla de Posiciones Actualizada) */}
        {activeTab === 'standings' && (
          <StandingsTable
            laligaStandings={laligaStandings}
            championsStandings={championsStandings}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={toggleFavoriteTeam}
            onSelectTeam={(team) => setSelectedTeamForUpcoming(team)}
          />
        )}
      </main>

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatchId(null)}
      />

      {/* Team Upcoming Matches Modal (Opens when clicking any crest or team name) */}
      <TeamUpcomingMatchesModal
        team={selectedTeamForUpcoming}
        isOpen={!!selectedTeamForUpcoming}
        onClose={() => setSelectedTeamForUpcoming(null)}
        matches={matches}
        isFavorite={selectedTeamForUpcoming ? favoriteTeams.includes(selectedTeamForUpcoming.id) : false}
        onToggleFavorite={toggleFavoriteTeam}
        onSelectMatch={(id) => setSelectedMatchId(id)}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onClear={clearNotifications}
        onSelectMatch={(id) => setSelectedMatchId(id)}
        browserNotificationsEnabled={browserNotificationsEnabled}
        setBrowserNotificationsEnabled={setBrowserNotificationsEnabled}
      />

      {/* Android PWA Install Prompt & Modal */}
      <AndroidInstallModal
        forceOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Clean Footer (Goleadores removed) */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">GolazoLive</span>
            <span aria-hidden="true">·</span>
            <span>LaLiga EA Sports &amp; UEFA Champions League</span>
            <span aria-hidden="true">·</span>
            <span>Resultados oficiales y calendario en vivo</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('matches')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Partidos
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Clasificación
            </button>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>📱 Instalar en Android</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
