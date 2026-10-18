import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { parseEspnMatches, parseEspnStandings } from './server/footballService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache to avoid rate limits
let matchesCache: { data: any; timestamp: number } | null = null;
let standingsCache: { data: any; timestamp: number } | null = null;

async function fetchOnlineMatches() {
  const now = Date.now();
  if (matchesCache && now - matchesCache.timestamp < 15000) {
    return matchesCache.data;
  }

  try {
    // Query past, today, and future dates for comprehensive schedules
    const laligaDates = ['20261016', '20261017', '20261018', '20261019', '20261024', '20261025', '20261026'];
    const uclDates = ['20261020', '20261021', '20261103', '20261104'];

    const laligaPromises = laligaDates.map((dateStr) =>
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=${dateStr}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).then((r) => r.json()).catch(() => ({}))
    );

    const uclPromises = uclDates.map((dateStr) =>
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=${dateStr}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).then((r) => r.json()).catch(() => ({}))
    );

    const [laligaResults, uclResults] = await Promise.all([
      Promise.all(laligaPromises),
      Promise.all(uclPromises),
    ]);

    const seenIds = new Set<string>();
    const laligaEvents: any[] = [];
    laligaResults.forEach((res) => {
      if (res?.events && Array.isArray(res.events)) {
        res.events.forEach((ev: any) => {
          if (!seenIds.has(ev.id)) {
            seenIds.add(ev.id);
            laligaEvents.push(ev);
          }
        });
      }
    });

    const uclEvents: any[] = [];
    uclResults.forEach((res) => {
      if (res?.events && Array.isArray(res.events)) {
        res.events.forEach((ev: any) => {
          if (!seenIds.has(ev.id)) {
            seenIds.add(ev.id);
            uclEvents.push(ev);
          }
        });
      }
    });

    const laligaMatches = parseEspnMatches(laligaEvents, 'laliga');
    const uclMatches = parseEspnMatches(uclEvents, 'champions');

    // Combine and sort by timestamp
    const combinedMatches = [...laligaMatches, ...uclMatches].sort((a, b) => {
      return (a.timestamp || 0) - (b.timestamp || 0);
    });

    matchesCache = {
      data: {
        matches: combinedMatches,
        provider: 'ESPN Live Sports Online',
        lastUpdated: new Date().toISOString(),
        online: true,
      },
      timestamp: now,
    };

    return matchesCache.data;
  } catch (err) {
    console.error('Error fetching online matches:', err);
    if (matchesCache) return matchesCache.data;
    return { matches: [], provider: 'Offline Fallback', online: false, lastUpdated: new Date().toISOString() };
  }
}

async function fetchOnlineStandings() {
  const now = Date.now();
  if (standingsCache && now - standingsCache.timestamp < 45000) {
    return standingsCache.data;
  }

  try {
    const [laligaRes, uclRes] = await Promise.allSettled([
      fetch('https://site.api.espn.com/apis/v2/sports/soccer/esp.1/standings', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).then((r) => r.json()),
      fetch('https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).then((r) => r.json()),
    ]);

    const laligaEntries = laligaRes.status === 'fulfilled' ? laligaRes.value?.children?.[0]?.standings?.entries || [] : [];
    const uclEntries = uclRes.status === 'fulfilled' ? uclRes.value?.children?.[0]?.standings?.entries || [] : [];

    const laligaStandings = parseEspnStandings(laligaEntries, 'laliga');
    const championsStandings = parseEspnStandings(uclEntries, 'champions');

    standingsCache = {
      data: {
        laliga: laligaStandings,
        champions: championsStandings,
        provider: 'ESPN Live Standings Online',
        lastUpdated: new Date().toISOString(),
        online: true,
      },
      timestamp: now,
    };

    return standingsCache.data;
  } catch (err) {
    console.error('Error fetching online standings:', err);
    if (standingsCache) return standingsCache.data;
    return { laliga: [], champions: [], online: false, lastUpdated: new Date().toISOString() };
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route: Live Online Matches
  app.get('/api/football/matches', async (_req, res) => {
    try {
      const data = await fetchOnlineMatches();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch online matches' });
    }
  });

  // API Route: Live Online Standings
  app.get('/api/football/standings', async (_req, res) => {
    try {
      const data = await fetchOnlineStandings();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch online standings' });
    }
  });

  // API Route: Match Summary & Rosters
  app.get('/api/football/match-summary/:competition/:id', async (req, res) => {
    try {
      const { competition, id } = req.params;
      const leagueSlug = competition === 'laliga' ? 'esp.1' : 'uefa.champions';
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueSlug}/summary?event=${id}`);
      const summary = await response.json();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch match summary' });
    }
  });

  // API Route: Health & Online Status
  app.get('/api/football/status', async (_req, res) => {
    res.json({
      online: true,
      provider: 'ESPN Live Sports API Feed',
      timestamp: Date.now(),
    });
  });

  // Development: Vite Dev Server Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GolazoLive Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
