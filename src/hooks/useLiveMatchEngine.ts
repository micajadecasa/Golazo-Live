import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Match, 
  StandingRow, 
  GoalNotification, 
  Competition 
} from '../types/football';
import { 
  INITIAL_LALIGA_STANDINGS, 
  INITIAL_CHAMPIONS_STANDINGS 
} from '../data/mockFootballData';
import { 
  soundService, 
  sendBrowserNotification 
} from '../services/soundEffects';

export function useLiveMatchEngine() {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOnlineConnected, setIsOnlineConnected] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('golazo_online_matches');
    return saved ? JSON.parse(saved) : [];
  });

  const [laligaStandings, setLaligaStandings] = useState<StandingRow[]>(() => {
    const saved = localStorage.getItem('golazo_laliga_standings');
    return saved ? JSON.parse(saved) : INITIAL_LALIGA_STANDINGS;
  });

  const [championsStandings, setChampionsStandings] = useState<StandingRow[]>(() => {
    const saved = localStorage.getItem('golazo_champions_standings');
    return saved ? JSON.parse(saved) : INITIAL_CHAMPIONS_STANDINGS;
  });

  const [notifications, setNotifications] = useState<GoalNotification[]>(() => {
    const saved = localStorage.getItem('golazo_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeGoalToast, setActiveGoalToast] = useState<GoalNotification | null>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('golazo_favorites');
    return saved ? JSON.parse(saved) : ['rma', 'bar', '13', '14']; // Default favorites
  });
  const [onlyFavoritesAlerts, setOnlyFavoritesAlerts] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Track previous match scores to detect new live goals during polling
  const previousScoresRef = useRef<Map<string, { home: number; away: number; status: string }>>(new Map());

  // Save changes to localStorage
  useEffect(() => {
    if (matches.length > 0) {
      localStorage.setItem('golazo_online_matches', JSON.stringify(matches));
    }
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('golazo_laliga_standings', JSON.stringify(laligaStandings));
  }, [laligaStandings]);

  useEffect(() => {
    localStorage.setItem('golazo_champions_standings', JSON.stringify(championsStandings));
  }, [championsStandings]);

  useEffect(() => {
    localStorage.setItem('golazo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('golazo_favorites', JSON.stringify(favoriteTeams));
  }, [favoriteTeams]);

  // Handle Confetti burst for goals
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.25 },
        colors: ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#FFFFFF'],
      });
    } catch {
      // Safe fallback
    }
  }, []);

  // Dispatch goal alert
  const dispatchGoalAlert = useCallback((
    match: Match, 
    scoringTeamId: string, 
    scorer: string, 
    assist?: string, 
    overrideScore?: { home: number; away: number }
  ) => {
    const isHome = scoringTeamId === match.homeTeam.id;
    const scoringTeam = isHome ? match.homeTeam : match.awayTeam;
    const homeScore = overrideScore ? overrideScore.home : match.homeScore;
    const awayScore = overrideScore ? overrideScore.away : match.awayScore;

    const isFav = favoriteTeams.includes(match.homeTeam.id) || favoriteTeams.includes(match.awayTeam.id);
    if (onlyFavoritesAlerts && !isFav) {
      return;
    }

    const notification: GoalNotification = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      matchId: match.id,
      competition: match.competition,
      matchTitle: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
      minute: match.minute,
      teamName: scoringTeam.name,
      scorer,
      assist,
      scoreHome: homeScore,
      scoreAway: awayScore,
      isFinalResult: false,
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);
    setActiveGoalToast(notification);

    if (soundEnabled) {
      soundService.playGoalSound();
    }
    triggerConfetti();

    const alertTitle = `⚽ ¡GOOOL de ${scoringTeam.shortName}! (${match.minute}')`;
    const alertBody = `${scorer} marca para ${scoringTeam.name}. Marcador: ${match.homeTeam.shortName} ${homeScore} - ${awayScore} ${match.awayTeam.shortName}`;
    sendBrowserNotification(alertTitle, alertBody, `match-${match.id}`);

    setTimeout(() => {
      setActiveGoalToast((curr) => (curr?.id === notification.id ? null : curr));
    }, 6000);
  }, [favoriteTeams, onlyFavoritesAlerts, soundEnabled, triggerConfetti]);

  // Dispatch final result alert
  const dispatchFinalResultAlert = useCallback((match: Match) => {
    const isFav = favoriteTeams.includes(match.homeTeam.id) || favoriteTeams.includes(match.awayTeam.id);
    if (onlyFavoritesAlerts && !isFav) return;

    const notification: GoalNotification = {
      id: `final-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      matchId: match.id,
      competition: match.competition,
      matchTitle: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
      minute: 90,
      teamName: 'Resultado Final',
      scorer: 'Final del Partido',
      scoreHome: match.homeScore,
      scoreAway: match.awayScore,
      isFinalResult: true,
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);
    if (soundEnabled) {
      soundService.playWhistleSound(true);
    }

    const title = `🏁 ¡Resultado Final! ${match.homeTeam.shortName} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.shortName}`;
    const body = `El partido ha concluido oficialmente.`;
    sendBrowserNotification(title, body, `final-${match.id}`);
  }, [favoriteTeams, onlyFavoritesAlerts, soundEnabled]);

  // Fetch online data from backend API proxy
  const fetchOnlineData = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);

    try {
      // 1. Fetch matches from online backend proxy
      const matchesRes = await fetch('/api/football/matches');
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        if (matchesData.matches && Array.isArray(matchesData.matches) && matchesData.matches.length > 0) {
          const incomingMatches: Match[] = matchesData.matches;

          // Check for live goal transitions and finished matches
          incomingMatches.forEach((newM) => {
            const prev = previousScoresRef.current.get(newM.id);
            if (prev) {
              if (newM.homeScore > prev.home) {
                dispatchGoalAlert(newM, newM.homeTeam.id, `${newM.homeTeam.shortName} Gol`, undefined, {
                  home: newM.homeScore,
                  away: newM.awayScore,
                });
              }
              if (newM.awayScore > prev.away) {
                dispatchGoalAlert(newM, newM.awayTeam.id, `${newM.awayTeam.shortName} Gol`, undefined, {
                  home: newM.homeScore,
                  away: newM.awayScore,
                });
              }
              if (prev.status === 'LIVE' && newM.status === 'FINISHED') {
                dispatchFinalResultAlert(newM);
              }
            }
            previousScoresRef.current.set(newM.id, {
              home: newM.homeScore,
              away: newM.awayScore,
              status: newM.status,
            });
          });

          setMatches(incomingMatches);
          setIsOnlineConnected(true);
        }
      }

      // 2. Fetch live standings
      const standingsRes = await fetch('/api/football/standings');
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json();
        if (standingsData.laliga && standingsData.laliga.length > 0) {
          setLaligaStandings(standingsData.laliga);
        }
        if (standingsData.champions && standingsData.champions.length > 0) {
          setChampionsStandings(standingsData.champions);
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Online sync error, using cached state:', err);
      setIsOnlineConnected(false);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [dispatchGoalAlert, dispatchFinalResultAlert]);

  // Initial fetch and 20s interval for online feed
  useEffect(() => {
    fetchOnlineData();
    const interval = setInterval(() => {
      fetchOnlineData();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchOnlineData]);

  // Toggle favorite team
  const toggleFavoriteTeam = useCallback((teamId: string) => {
    setFavoriteTeams((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  }, []);

  return {
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
    setSoundEnabled: (enabled: boolean) => {
      setSoundEnabled(enabled);
      soundService.setSoundEnabled(enabled);
    },
    setBrowserNotificationsEnabled,
    refreshOnlineData: () => fetchOnlineData(true),
    toggleFavoriteTeam,
    markNotificationRead: (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    clearNotifications: () => setNotifications([]),
    dismissGoalToast: () => setActiveGoalToast(null),
  };
}
