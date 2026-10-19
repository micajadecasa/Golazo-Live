import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Radio,
  CalendarDays
} from 'lucide-react';
import { useLiveMatchEngine } from './hooks/useLiveMatchEngine';
import { Header } from './components/Header';
import { MatchCard } from './components/MatchCard';
import { StandingsTable } from './components/StandingsTable';
import { TopScorersView } from './components/TopScorersView';
import { LiveGoalToast } from './components/LiveGoalToast';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { LiveOnlineStatusBar } from './components/LiveOnlineStatusBar';
import { MatchCalendar } from './components/MatchCalendar';
import { TeamCrest } from './components/TeamCrest';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { Competition, MatchStatus } from './types/football';

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

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers'>('matches');
  const [competitionFilter, setCompetitionFilter] = useState<'all' | Competition>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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

  // Featured Spotlight match: prioritize LIVE match, then next upcoming match
  const featuredMatch = liveMatches[0] || upcomingMatches[0] || matches[0];

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
        {/* Real-time online feed status bar */}
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

        {/* VIEW 1: MATCHES (Partidos anteriores, en vivo y futuros) */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Featured Match Hero Spotlight */}
            {featuredMatch && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                  {/* Left: Competition & status with official crests */}
                  <div className="space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-400">
                      <span className="text-amber-400 font-bold uppercase tracking-wider">
                        {featuredMatch.competition === 'laliga' ? 'LaLiga EA Sports' : 'UEFA Champions League'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="capitalize">{featuredMatch.date}</span>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <TeamCrest team={featuredMatch.homeTeam} size="lg" />
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {featuredMatch.homeTeam.shortName} <span className="text-amber-400">vs</span> {featuredMatch.awayTeam.shortName}
                      </h2>
                      <TeamCrest team={featuredMatch.awayTeam} size="lg" />
                    </div>

                    <p className="text-xs text-slate-400">
                      📍 {featuredMatch.venue || 'Estadio oficial'}
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

            {/* Matches Grid */}
            {filteredMatches.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map((m) => {
                  const isFav = favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id);
                  return (
                    <MatchCard
                      key={m.id}
                      match={m}
                      isFavorite={isFav}
                      onToggleFavorite={toggleFavoriteTeam}
                      onSelectMatch={(id) => setSelectedMatchId(id)}
                    />
                  );
                })}
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
          />
        )}

        {/* VIEW 3: TOP SCORERS (Pichichi & Champions) */}
        {activeTab === 'scorers' && <TopScorersView />}
      </main>

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatchId(null)}
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

      {/* Clean Footer */}
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
              onClick={() => setActiveTab('scorers')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Goleadores
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
