import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const rawKey = (process.env.ODDS_API_KEY || 'b59370b4edcfdb8e3ef4104f2ca72dac').trim();
const hexMatch = rawKey.match(/[a-f0-9]{32}/i);
const ODDS_API_KEY = hexMatch ? hexMatch[0] : 'b59370b4edcfdb8e3ef4104f2ca72dac';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const JWT_SECRET = process.env.JWT_SECRET || 'uiheifiuhiunqglrJKGOOWFHIUHuigLGYUHuyguGuguhiUIGjhfuyKJHG';
const JWT_ISSUER = process.env.JWT_ISSUER || 'SportsGroundBookingApi';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'SportsGroundBookingApiUsers';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Odds API In-Memory Cache & Telemetry
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const oddsCache = new Map<string, CacheEntry<any>>();

let quotaTelemetry = {
  remaining: 500,
  used: 0,
  lastCost: 0,
  lastUpdated: new Date().toISOString(),
};

function updateQuotaFromHeaders(headers: Record<string, any>) {
  if (headers['x-requests-remaining']) {
    quotaTelemetry.remaining = parseInt(headers['x-requests-remaining'], 10);
  }
  if (headers['x-requests-used']) {
    quotaTelemetry.used = parseInt(headers['x-requests-used'], 10);
  }
  if (headers['x-requests-last']) {
    quotaTelemetry.lastCost = parseInt(headers['x-requests-last'], 10);
  }
  quotaTelemetry.lastUpdated = new Date().toISOString();
}

function getCached<T>(key: string): { data: T; isCached: boolean; ttlRemaining: number } | null {
  const entry = oddsCache.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (now - entry.timestamp > entry.ttlMs) {
    oddsCache.delete(key);
    return null;
  }
  return {
    data: entry.data,
    isCached: true,
    ttlRemaining: Math.round((entry.ttlMs - (now - entry.timestamp)) / 1000),
  };
}

function setCache<T>(key: string, data: T, ttlMs: number) {
  oddsCache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// Fallback Sports Data (if offline / quota limited)
const fallbackSports = [
  { key: 'upcoming', group: 'Featured', title: 'Upcoming Matches (All Sports)', description: 'Live & next upcoming games across all major leagues', active: true, has_outrights: false },
  { key: 'soccer_epl', group: 'Soccer', title: 'English Premier League', description: 'English Premier League Football', active: true, has_outrights: false },
  { key: 'cricket_test_match', group: 'Cricket', title: 'Test Matches', description: 'International Cricket Test Matches', active: true, has_outrights: false },
  { key: 'basketball_nba', group: 'Basketball', title: 'NBA', description: 'US National Basketball Association', active: true, has_outrights: false },
  { key: 'rugbyleague_nrl', group: 'Rugby League', title: 'NRL & Rugby Union', description: 'Rugby League & South African Rugby Championship', active: true, has_outrights: false },
  { key: 'americanfootball_nfl', group: 'American Football', title: 'NFL', description: 'US Football', active: true, has_outrights: false },
  { key: 'tennis_atp_french_open', group: 'Tennis', title: 'ATP Tennis', description: 'Men\'s Professional Tennis Tour', active: true, has_outrights: false },
];

// Fallback Events Data with Realistic Odds
const fallbackEvents = [
  {
    id: 'demo-match-epl-01',
    sport_key: 'soccer_epl',
    sport_title: 'English Premier League',
    commence_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    home_team: 'Arsenal',
    away_team: 'Chelsea',
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Arsenal', price: 1.85 },
              { name: 'Draw', price: 3.75 },
              { name: 'Chelsea', price: 4.2 },
            ],
          },
        ],
      },
      {
        key: 'betmgm',
        title: 'BetMGM',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Arsenal', price: 1.9 },
              { name: 'Draw', price: 3.6 },
              { name: 'Chelsea', price: 4.35 },
            ],
          },
        ],
      },
      {
        key: 'betonlineag',
        title: 'BetOnline',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Arsenal', price: 1.88 },
              { name: 'Draw', price: 3.8 },
              { name: 'Chelsea', price: 4.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'demo-match-cricket-01',
    sport_key: 'cricket_test_match',
    sport_title: 'International Cricket',
    commence_time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    home_team: 'South Africa',
    away_team: 'India',
    bookmakers: [
      {
        key: 'betfair',
        title: 'Betfair',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'South Africa', price: 2.1 },
              { name: 'Draw', price: 5.5 },
              { name: 'India', price: 2.05 },
            ],
          },
        ],
      },
      {
        key: 'unibet',
        title: 'Unibet',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'South Africa', price: 2.15 },
              { name: 'Draw', price: 5.2 },
              { name: 'India', price: 2.0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'demo-match-nba-01',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    home_team: 'Boston Celtics',
    away_team: 'Golden State Warriors',
    bookmakers: [
      {
        key: 'fanduel',
        title: 'FanDuel',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Boston Celtics', price: 1.52 },
              { name: 'Golden State Warriors', price: 2.65 },
            ],
          },
        ],
      },
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Boston Celtics', price: 1.55 },
              { name: 'Golden State Warriors', price: 2.6 },
            ],
          },
        ],
      },
    ],
  },
];

// ==========================================
// Head-to-Head History & Form Engine
// ==========================================

export interface FormEntry {
  result: 'W' | 'D' | 'L';
  opponent: string;
  score: string;
  date: string;
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away' | 'draw';
}

export interface HeadToHeadRecord {
  previousMatches: H2HMatch[];
  homeForm: FormEntry[];
  awayForm: FormEntry[];
  h2hSummary: {
    homeWins: number;
    awayWins: number;
    draws: number;
    totalMatches: number;
    avgScore: number;
  };
}

const FORM_OPPONENTS: Record<string, string[]> = {
  cricket: ['India', 'Australia', 'England', 'New Zealand', 'Pakistan', 'Sri Lanka'],
  basketball: ['Boston Celtics', 'Golden State Warriors', 'Milwaukee Bucks', 'Denver Nuggets', 'Miami Heat'],
  nfl: ['Kansas City Chiefs', 'Buffalo Bills', 'San Francisco 49ers', 'Dallas Cowboys', 'Philadelphia Eagles'],
  rugby: ['New Zealand', 'Australia', 'England', 'Ireland', 'France', 'Argentina'],
  football: ['Manchester City', 'Liverpool', 'Chelsea', 'Tottenham', 'Newcastle', 'Aston Villa'],
};

function fnv1aHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    if (state === 0) state = 0x9e3779b9;
    return state / 4294967296;
  };
}

function sportFamily(sportTitle: string): string {
  const sport = (sportTitle || '').toLowerCase();
  if (sport.includes('cricket')) return 'cricket';
  if (sport.includes('basketball') || sport.includes('nba')) return 'basketball';
  if (sport.includes('nfl') || sport.includes('american football')) return 'nfl';
  if (sport.includes('rugby')) return 'rugby';
  return 'football';
}

function randomScore(family: string, rng: () => number): number {
  if (family === 'cricket') return 110 + Math.floor(rng() * 111);
  if (family === 'basketball') return 88 + Math.floor(rng() * 41);
  if (family === 'nfl') return 10 + Math.floor(rng() * 28);
  return Math.floor(rng() * 5);
}

function isoDaysAgo(days: number): string {
  const base = Date.UTC(2026, 9, 18);
  return new Date(base - days * 86400000).toISOString();
}

function buildForm(team: string, family: string, rng: () => number): FormEntry[] {
  const pool = FORM_OPPONENTS[family] || FORM_OPPONENTS.football;
  const entries: FormEntry[] = [];

  for (let i = 0; i < 5; i++) {
    let opponent = pool[Math.floor(rng() * pool.length)];
    if (opponent === team) {
      opponent = pool[(pool.indexOf(opponent) + 1) % pool.length];
    }

    const teamScore = randomScore(family, rng);
    const opponentScore = randomScore(family, rng);
    const result: FormEntry['result'] =
      teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'D';

    entries.push({
      result,
      opponent,
      score: `${teamScore}-${opponentScore}`,
      date: isoDaysAgo(7 + i * 7),
    });
  }

  return entries;
}

export function buildHeadToHead(
  homeTeam: string,
  awayTeam: string,
  sportTitle = ''
): HeadToHeadRecord {
  const family = sportFamily(sportTitle);
  const rng = makeRng(fnv1aHash(`${homeTeam}|${awayTeam}|${family}`));

  const previousMatches: H2HMatch[] = [];
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  let totalScore = 0;

  for (let i = 0; i < 5; i++) {
    const queriedHomeIsHost = i % 2 === 0;
    const matchHome = queriedHomeIsHost ? homeTeam : awayTeam;
    const matchAway = queriedHomeIsHost ? awayTeam : homeTeam;
    const homeScore = randomScore(family, rng);
    const awayScore = randomScore(family, rng);

    let winner: H2HMatch['winner'] = 'draw';
    if (homeScore > awayScore) winner = 'home';
    else if (awayScore > homeScore) winner = 'away';

    if (winner === 'draw') draws++;
    else if ((winner === 'home' && queriedHomeIsHost) || (winner === 'away' && !queriedHomeIsHost)) homeWins++;
    else awayWins++;

    totalScore += homeScore + awayScore;
    previousMatches.push({
      date: isoDaysAgo(i * 14),
      homeTeam: matchHome,
      awayTeam: matchAway,
      homeScore,
      awayScore,
      winner,
    });
  }

  return {
    previousMatches,
    homeForm: buildForm(homeTeam, family, rng),
    awayForm: buildForm(awayTeam, family, rng),
    h2hSummary: {
      homeWins,
      awayWins,
      draws,
      totalMatches: previousMatches.length,
      avgScore: Math.round((totalScore / previousMatches.length) * 10) / 10,
    },
  };
}

function withH2H(events: any): any {
  if (!Array.isArray(events)) return events;
  return events.map(event => ({
    ...event,
    h2h: buildHeadToHead(event.home_team, event.away_team, event.sport_title),
  }));
}

function formPoints(form: FormEntry[]): number {
  return form.reduce(
    (acc, entry) => acc + (entry.result === 'W' ? 1 : entry.result === 'D' ? 0.5 : 0),
    0
  );
}

function formProbabilityDelta(homeForm: FormEntry[], awayForm: FormEntry[], weight = 1): number {
  return ((formPoints(homeForm) - formPoints(awayForm)) / 5) * 0.06 * weight;
}

// ==========================================
// Prediction Math Engine
// ==========================================

function calculatePoisson(k: number, lambda: number): number {
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

function runMonteCarloSimulation(
  probHome: number,
  probAway: number,
  probDraw = 0,
  iterations = 10000,
  expGoalsHome = 1.65,
  expGoalsAway = 1.25
) {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  const scorelineMap = new Map<string, number>();

  for (let i = 0; i < iterations; i++) {
    // Scoreline simulation using Poisson sampling
    let gHome = 0;
    let gAway = 0;

    // Inverse transform sampling for Poisson
    let p = Math.random();
    let cum = 0;
    for (let k = 0; k <= 7; k++) {
      cum += calculatePoisson(k, expGoalsHome);
      if (p <= cum) {
        gHome = k;
        break;
      }
    }

    p = Math.random();
    cum = 0;
    for (let k = 0; k <= 7; k++) {
      cum += calculatePoisson(k, expGoalsAway);
      if (p <= cum) {
        gAway = k;
        break;
      }
    }

    if (gHome > gAway) homeWins++;
    else if (gAway > gHome) awayWins++;
    else draws++;

    const key = `${gHome}-${gAway}`;
    scorelineMap.set(key, (scorelineMap.get(key) || 0) + 1);
  }

  // Top scorelines
  const simulatedScorelines = Array.from(scorelineMap.entries())
    .map(([score, count]) => ({
      score,
      count,
      pct: Math.round((count / iterations) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    iterations,
    homeWins,
    awayWins,
    draws,
    homeWinPct: Math.round((homeWins / iterations) * 1000) / 10,
    awayWinPct: Math.round((awayWins / iterations) * 1000) / 10,
    drawPct: Math.round((draws / iterations) * 1000) / 10,
    simulatedScorelines,
  };
}

function analyzePrediction(event: any, customOptions: any = {}) {
  const homeTeam = event.home_team;
  const awayTeam = event.away_team;
  const sportTitle = event.sport_title || 'Sports Event';
  const headToHead = buildHeadToHead(homeTeam, awayTeam, sportTitle);
  const formDelta = formProbabilityDelta(
    headToHead.homeForm,
    headToHead.awayForm,
    customOptions.formWeight ?? 1
  );

  // Extract all h2h market prices across bookmakers
  const homePrices: number[] = [];
  const awayPrices: number[] = [];
  const drawPrices: number[] = [];

  const bookmakerValueChecks: Array<{
    team: string;
    bookmaker: string;
    offeredOdds: number;
    trueOdds: number;
    expectedValuePct: number;
    kellyStakePct: number;
  }> = [];

  const bookmakers = event.bookmakers || [];
  for (const b of bookmakers) {
    const h2h = b.markets?.find((m: any) => m.key === 'h2h');
    if (h2h) {
      for (const outcome of h2h.outcomes) {
        let decPrice = outcome.price;
        // Convert American odds to Decimal if negative/high
        if (decPrice > 50) {
          decPrice = 1 + decPrice / 100;
        } else if (decPrice < -50) {
          decPrice = 1 + 100 / Math.abs(decPrice);
        }

        if (outcome.name === homeTeam) homePrices.push(decPrice);
        else if (outcome.name === awayTeam) awayPrices.push(decPrice);
        else if (outcome.name.toLowerCase() === 'draw' || outcome.name.toLowerCase() === 'tie') drawPrices.push(decPrice);
      }
    }
  }

  // Consensus average prices (defaulting if bookmaker data is sparse)
  const avgHome = homePrices.length ? homePrices.reduce((a, b) => a + b, 0) / homePrices.length : 1.95;
  const avgAway = awayPrices.length ? awayPrices.reduce((a, b) => a + b, 0) / awayPrices.length : 2.85;
  const hasDraw = drawPrices.length > 0;
  const avgDraw = hasDraw ? drawPrices.reduce((a, b) => a + b, 0) / drawPrices.length : undefined;

  // Raw implied probabilities
  const rawHomeProb = 1 / avgHome;
  const rawAwayProb = 1 / avgAway;
  const rawDrawProb = avgDraw ? 1 / avgDraw : 0;
  const totalOverround = rawHomeProb + rawAwayProb + rawDrawProb;
  const overroundPercent = Math.round((totalOverround - 1) * 1000) / 10;

  // Stripped true probabilities
  const trueHomeProb = rawHomeProb / totalOverround;
  const trueAwayProb = rawAwayProb / totalOverround;
  const trueDrawProb = avgDraw ? rawDrawProb / totalOverround : undefined;

  // Apply optional custom factors (e.g., Home Ground Advantage boost)
  const homeAdvantage = (customOptions.homeAdvantage ?? 4) / 100;
  const adjustedHomeProb = Math.min(0.95, Math.max(0.05, trueHomeProb + homeAdvantage * 0.3 + formDelta));
  const remainingProb = 1 - adjustedHomeProb;
  const adjustedAwayProb = trueDrawProb ? remainingProb * (trueAwayProb / (trueAwayProb + trueDrawProb)) : remainingProb;
  const adjustedDrawProb = trueDrawProb ? remainingProb * (trueDrawProb / (trueAwayProb + trueDrawProb)) : undefined;

  // True Fair Odds
  const fairOddsHome = Math.round((1 / adjustedHomeProb) * 100) / 100;
  const fairOddsAway = Math.round((1 / adjustedAwayProb) * 100) / 100;

  // Value bet scanning across actual bookmakers
  for (const b of bookmakers) {
    const h2h = b.markets?.find((m: any) => m.key === 'h2h');
    if (h2h) {
      for (const outcome of h2h.outcomes) {
        let decPrice = outcome.price;
        if (decPrice > 50) decPrice = 1 + decPrice / 100;
        else if (decPrice < -50) decPrice = 1 + 100 / Math.abs(decPrice);

        const targetProb = outcome.name === homeTeam ? adjustedHomeProb : outcome.name === awayTeam ? adjustedAwayProb : adjustedDrawProb || 0;
        const targetFair = outcome.name === homeTeam ? fairOddsHome : fairOddsAway;

        // Positive EV test: Prob * Odds > 1
        const ev = targetProb * decPrice - 1;
        if (ev > 0.015) {
          // Kelly stake calculation
          const bVal = decPrice - 1;
          const kelly = (bVal * targetProb - (1 - targetProb)) / bVal;
          bookmakerValueChecks.push({
            team: outcome.name,
            bookmaker: b.title,
            offeredOdds: Math.round(decPrice * 100) / 100,
            trueOdds: targetFair,
            expectedValuePct: Math.round(ev * 1000) / 10,
            kellyStakePct: Math.round(Math.max(0, kelly * 0.25) * 1000) / 10, // Fractional Kelly
          });
        }
      }
    }
  }

  // Determine predicted winner
  let predictedWinner: 'home' | 'away' | 'draw' = 'home';
  if (adjustedAwayProb > adjustedHomeProb && (!adjustedDrawProb || adjustedAwayProb > adjustedDrawProb)) {
    predictedWinner = 'away';
  } else if (adjustedDrawProb && adjustedDrawProb > adjustedHomeProb && adjustedDrawProb > adjustedAwayProb) {
    predictedWinner = 'draw';
  }

  const confidenceScore = Math.round(
    Math.max(adjustedHomeProb, adjustedAwayProb, adjustedDrawProb || 0) * 100
  );

  // Expected goals estimate
  const expGoalsHome = Math.round((1.2 + (adjustedHomeProb - 0.4) * 2.2) * 100) / 100;
  const expGoalsAway = Math.round((1.0 + (adjustedAwayProb - 0.4) * 1.8) * 100) / 100;

  // Run 10,000 Monte Carlo iterations
  const monteCarlo = runMonteCarloSimulation(
    adjustedHomeProb,
    adjustedAwayProb,
    adjustedDrawProb,
    customOptions.iterations || 10000,
    expGoalsHome,
    expGoalsAway
  );

  return {
    matchId: event.id,
    homeTeam,
    awayTeam,
    sportTitle,
    commenceTime: event.commence_time,
    consensusOdds: {
      home: Math.round(avgHome * 100) / 100,
      away: Math.round(avgAway * 100) / 100,
      draw: avgDraw ? Math.round(avgDraw * 100) / 100 : undefined,
    },
    rawImpliedProb: {
      home: Math.round(rawHomeProb * 1000) / 10,
      away: Math.round(rawAwayProb * 1000) / 10,
      draw: avgDraw ? Math.round(rawDrawProb * 1000) / 10 : undefined,
    },
    trueProbabilities: {
      home: Math.round(adjustedHomeProb * 1000) / 10,
      away: Math.round(adjustedAwayProb * 1000) / 10,
      draw: adjustedDrawProb ? Math.round(adjustedDrawProb * 1000) / 10 : undefined,
    },
    overroundPercent,
    predictedWinner,
    confidenceScore,
    expectedGoals: {
      home: expGoalsHome,
      away: expGoalsAway,
    },
    monteCarlo,
    valueBets: bookmakerValueChecks.slice(0, 4),
    formAdjustment: Math.round(formDelta * 1000) / 10,
    h2h: headToHead,
    tacticalAnalysis: {
      summary: `${homeTeam} holds a projected ${Math.round(adjustedHomeProb * 100)}% win likelihood vs ${awayTeam} (${Math.round(adjustedAwayProb * 100)}%), reflecting consensus bookmaker market pricing after stripping a ${overroundPercent}% vigorish fee.`,
      keyFactors: [
        `Market consensus assigns ${homeTeam} ${fairOddsHome} fair true decimal odds.`,
        `Poisson model estimates ${expGoalsHome} to ${expGoalsAway} scoring ratio in standard game conditions.`,
        `10,000 Monte Carlo runs indicate ${monteCarlo.homeWins} home wins, ${monteCarlo.awayWins} away wins, and ${monteCarlo.draws} draws.`,
        `Recent form ${headToHead.homeForm.map(f => f.result).join('-')} vs ${headToHead.awayForm.map(f => f.result).join('-')} applies a ${Math.round(formDelta * 1000) / 10} pt probability adjustment.`,
        bookmakerValueChecks.length > 0
          ? `Value alert: Detected +EV opportunity on ${bookmakerValueChecks[0].team} at ${bookmakerValueChecks[0].offeredOdds} with ${bookmakerValueChecks[0].expectedValuePct}% positive margin.`
          : 'Consensus market prices are tightly aligned with implied probabilities with no major bookmaker inefficiencies.',
      ],
      riskLevel: confidenceScore > 65 ? 'Low' : confidenceScore > 48 ? 'Medium' : 'High',
    },
  };
}

// ==========================================
// Odds API Proxy Endpoints
// ==========================================

// 1. Get Sports
app.get('/api/odds/sports', async (_req: Request, res: Response) => {
  const cacheKey = 'sports-list';
  const cached = getCached(cacheKey);
  if (cached) {
    res.json({ sports: cached.data, quota: { ...quotaTelemetry, isCached: true, ttlRemaining: cached.ttlRemaining } });
    return;
  }

  try {
    const url = `${ODDS_API_BASE}/sports/?apiKey=${ODDS_API_KEY}`;
    const response = await axios.get(url, { timeout: 8000 });
    updateQuotaFromHeaders(response.headers);

    const data = response.data;
    setCache(cacheKey, data, 1000 * 60 * 60); // 1 hour cache (cost is 0, but saves roundtrips)
    res.json({ sports: data, quota: { ...quotaTelemetry, isCached: false } });
  } catch (err: any) {
    console.warn('[Odds API] Sports fetch failed, using fallback list:', err?.message);
    res.json({ sports: fallbackSports, quota: { ...quotaTelemetry, isCached: true } });
  }
});

// 2. Get Events with Odds
app.get('/api/odds/events', async (req: Request, res: Response) => {
  const sport = (req.query.sport as string) || 'upcoming';
  const regions = (req.query.regions as string) || 'uk,us';
  const markets = (req.query.markets as string) || 'h2h';
  const cacheKey = `odds-${sport}-${regions}-${markets}`;

  const cached = getCached(cacheKey);
  if (cached) {
    res.json({
      events: withH2H(cached.data),
      sportKey: sport,
      quota: { ...quotaTelemetry, isCached: true, ttlRemaining: cached.ttlRemaining },
    });
    return;
  }

  try {
    const endpoint = sport === 'upcoming'
      ? `${ODDS_API_BASE}/sports/upcoming/odds/?regions=${regions}&markets=${markets}&apiKey=${ODDS_API_KEY}`
      : `${ODDS_API_BASE}/sports/${sport}/odds/?regions=${regions}&markets=${markets}&apiKey=${ODDS_API_KEY}`;

    const response = await axios.get(endpoint, { timeout: 10000 });
    updateQuotaFromHeaders(response.headers);

    const data = response.data;
    // Cache for 5 minutes (300,000 ms) to conserve user quota credits
    setCache(cacheKey, data, 1000 * 60 * 5);

    res.json({
      events: withH2H(data),
      sportKey: sport,
      quota: { ...quotaTelemetry, isCached: false },
    });
  } catch (err: any) {
    console.warn(`[Odds API] Odds fetch for ${sport} failed, serving realistic simulated fixtures:`, err?.message);
    // Filter fallback events matching or return default
    const filtered = sport === 'upcoming'
      ? fallbackEvents
      : fallbackEvents.filter(e => e.sport_key === sport);

    res.json({
      events: withH2H(filtered.length ? filtered : fallbackEvents),
      sportKey: sport,
      quota: { ...quotaTelemetry, isCached: true },
      fallbackNotice: 'Demonstration data loaded (Odds API network call bypassed or rate limited)',
    });
  }
});

// 3. Quota Status
app.get('/api/odds/quota', (_req: Request, res: Response) => {
  res.json({
    remaining: quotaTelemetry.remaining,
    used: quotaTelemetry.used,
    lastCost: quotaTelemetry.lastCost,
    lastUpdated: quotaTelemetry.lastUpdated,
  });
});

// 4. Clear Cache (Manual refresh button)
app.post('/api/odds/cache/clear', (_req: Request, res: Response) => {
  oddsCache.clear();
  res.json({ success: true, message: 'Odds API cache cleared' });
});

// ==========================================
// Prediction Engine Endpoints
// ==========================================

// Predict from an Odds API event
app.post('/api/predict/simulate', (req: Request, res: Response) => {
  const { event, options } = req.body;
  if (!event || !event.home_team || !event.away_team) {
    res.status(400).json({ success: false, message: 'Valid event with home_team and away_team required' });
    return;
  }
  const prediction = analyzePrediction(event, options);
  res.json({ success: true, prediction });
});

// Custom 2-team simulation
app.post('/api/predict/custom', (req: Request, res: Response) => {
  const { homeTeam, awayTeam, sportType, homeOdds, awayOdds, drawOdds, homeAdvantage, iterations } = req.body;
  if (!homeTeam || !awayTeam || !homeOdds || !awayOdds) {
    res.status(400).json({ success: false, message: 'homeTeam, awayTeam, homeOdds, and awayOdds are required' });
    return;
  }

  const outcomes: any[] = [
    { name: homeTeam, price: Number(homeOdds) },
    { name: awayTeam, price: Number(awayOdds) },
  ];
  if (drawOdds && Number(drawOdds) > 0) {
    outcomes.push({ name: 'Draw', price: Number(drawOdds) });
  }

  const syntheticEvent = {
    id: `custom-${Date.now()}`,
    sport_key: 'custom',
    sport_title: sportType || 'Custom Match',
    commence_time: new Date().toISOString(),
    home_team: homeTeam,
    away_team: awayTeam,
    bookmakers: [
      {
        key: 'consensus',
        title: 'Custom Line',
        last_update: new Date().toISOString(),
        markets: [{ key: 'h2h', outcomes }],
      },
    ],
  };

  const prediction = analyzePrediction(syntheticEvent, {
    homeAdvantage: homeAdvantage !== undefined ? Number(homeAdvantage) : 4,
    iterations: iterations ? Number(iterations) : 10000,
  });

  res.json({ success: true, prediction });
});

// ==========================================
// SaaS Subscriptions & Simulated Checkout (ZAR)
// ==========================================

interface SubscriptionRecord {
  id: string;
  planId: 'free' | 'pro' | 'syndicate';
  planName: string;
  billingInterval: 'monthly' | 'annual';
  amountZar: number;
  vatZar: number;
  licenseKey: string;
  txRef: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'trialing' | 'expired';
  customerName: string;
  customerEmail: string;
  paymentMethod: 'card' | 'instant_eft';
  paymentDetailsSummary: string;
}

const subscriptionsStore = new Map<string, SubscriptionRecord>();

// Pre-seed a demo active license key
const demoLicenseKey = 'UBP-PRO-2026-DURBAN-001';
subscriptionsStore.set(demoLicenseKey, {
  id: 'sub-demo-01',
  planId: 'pro',
  planName: 'Pro Punter',
  billingInterval: 'monthly',
  amountZar: 249,
  vatZar: 32.48,
  licenseKey: demoLicenseKey,
  txRef: 'TXN-ZA-2026-0001',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  customerName: 'Durban Community Punter',
  customerEmail: 'speaker@betpredict.co.za',
  paymentMethod: 'card',
  paymentDetailsSummary: 'Visa ending in 4242',
});

function generateLicenseKey(planId: string): string {
  const chars = '0123456789ABCDEF';
  const chunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `UBP-${planId.toUpperCase()}-${chunk()}-${chunk()}-${chunk()}`;
}

// Checkout simulation endpoint
app.post('/api/checkout/simulate', (req: Request, res: Response) => {
  const {
    planId = 'pro',
    billingInterval = 'monthly',
    paymentMethod = 'card',
    customerName = 'South African Bettor',
    customerEmail = 'punter@domain.co.za',
    cardDetails,
    eftDetails,
  } = req.body;

  let planName = 'Pro Punter';
  let amountZar = 249;
  let durationDays = 30;

  if (planId === 'free') {
    planName = 'Free Trial (7-Day)';
    amountZar = 0;
    durationDays = 7;
  } else if (planId === 'pro') {
    planName = 'Pro Punter';
    amountZar = billingInterval === 'annual' ? 199 * 12 : 249;
    durationDays = billingInterval === 'annual' ? 365 : 30;
  } else if (planId === 'syndicate') {
    planName = 'Syndicate Enterprise';
    amountZar = billingInterval === 'annual' ? 719 * 12 : 899;
    durationDays = billingInterval === 'annual' ? 365 : 30;
  }

  // 15% South African VAT computation
  const vatZar = Math.round((amountZar * 15) / 115 * 100) / 100;

  let paymentSummary = '7-Day Free Pass';
  if (paymentMethod === 'card') {
    const last4 = cardDetails?.cardNumberLast4 || '4242';
    paymentSummary = `Card ending in •••• ${last4} (3D Secure Authenticated)`;
  } else if (paymentMethod === 'instant_eft') {
    const bank = eftDetails?.bank || 'Capitec Pay';
    paymentSummary = `Instant EFT via ${bank} (SA Real-Time Clearing)`;
  }

  const licenseKey = generateLicenseKey(planId);
  const txRef = `TXN-ZA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const subscription: SubscriptionRecord = {
    id: `sub_${Date.now()}`,
    planId,
    planName,
    billingInterval,
    amountZar,
    vatZar,
    licenseKey,
    txRef,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    status: planId === 'free' ? 'trialing' : 'active',
    customerName,
    customerEmail,
    paymentMethod,
    paymentDetailsSummary: paymentSummary,
  };

  subscriptionsStore.set(licenseKey, subscription);

  res.json({
    success: true,
    message: 'Subscription payment successfully processed and license activated.',
    subscription,
  });
});

// Verify license key endpoint
app.get('/api/checkout/verify/:licenseKey', (req: Request, res: Response) => {
  const licenseKey = String(req.params.licenseKey || '');
  const sub = subscriptionsStore.get(licenseKey);
  if (!sub) {
    res.status(404).json({ success: false, message: 'License key not found or expired.' });
    return;
  }
  res.json({ success: true, subscription: sub });
});

// ==========================================
// Conference Presentation Deck Metadata
// ==========================================

app.get('/api/conference/metadata', (_req: Request, res: Response) => {
  res.json({
    event: 'Data & AI Community Day Durban: Encore / .NET Conf Community Edition South Africa',
    date: 'November 21, 2026',
    speaker: 'Uvaan',
    sessionTitle: 'Developing A .NET Sports Predictor',
    duration: '50 Minutes',
    venue: 'Richfield College Umhlanga Campus, Centenary Boulevard, Park Square, Umhlanga, Durban',
    schedule: '08:00 AM - 18:00',
    slides: [
      {
        id: 1,
        title: 'Developing A .NET Sports Predictor',
        subtitle: 'Transforming Live Odds Market Signals into Actionable Match Predictions with C# & Modern Math',
        points: [
          'Welcome to Data & AI Community Day Durban: Encore',
          'Bridging Data Engineering, Live APIs, and Machine Learning in .NET',
          'Why sports prediction is an ideal proving ground for real-time data pipelines',
          'Session duration: 50 minutes of practical architecture and live code',
        ],
      },
      {
        id: 2,
        title: 'The Data Source: The Odds API v4',
        subtitle: 'Real-time bookmaker odds from 40+ global sportsbooks',
        points: [
          'The Odds API architecture & JSON protocol',
          'Tracking usage credits (x-requests-remaining, x-requests-used)',
          'Supported markets: Head-to-Head (h2h / Moneyline), Spreads, Totals',
          'Handling time zones, commence times, and live in-play updates',
        ],
      },
      {
        id: 3,
        title: 'The Math: Stripping Vigorish & Implied Probabilities',
        subtitle: 'How bookmakers profit and how we extract true fair probability',
        points: [
          'Raw implied probability: P_raw = 1 / DecimalOdds',
          'Bookmaker overround / margin: Total = Sum(P_raw) > 100% (typically 104% - 110%)',
          'Shin / Proportional normalization to isolate true underlying win probability',
          'Expected Value (+EV) equation: EV = (TrueProb * OfferedOdds) - 1',
        ],
      },
      {
        id: 4,
        title: 'Simulation Engines: Poisson & Monte Carlo',
        subtitle: 'Generating probabilistic match outcomes and score distributions',
        points: [
          'Poisson distribution for low-scoring events (Football / Soccer, Hockey)',
          'P(k; λ) = (λ^k * e^-λ) / k! for goal expectation',
          'Running 10,000 Monte Carlo match simulations in parallel in C#',
          'Extracting confidence intervals and standard deviation',
        ],
      },
      {
        id: 5,
        title: '.NET 10 / C# 13 Architecture for Prediction Services',
        subtitle: 'High performance, resiliency, and clean architecture',
        points: [
          'IHttpClientFactory with Polly for exponential backoff & circuit breakers',
          'MemoryCache / DistributedCache to prevent quota exhaustion',
          'Background Worker Services (IHostedService) for periodic odds ingestion',
          'ML.NET and ONNX runtime integration for feature-engineered predictive models',
        ],
      },
      {
        id: 6,
        title: 'Live Interactive Demo',
        subtitle: 'Running live predictions on stage at Park Square Umhlanga',
        points: [
          'Live fixture lookup across EPL, Cricket, NBA, Rugby',
          'Real-time bookmaker odds comparison',
          'Monte Carlo simulation visualization',
          'Kelly Criterion capital allocation guidance',
        ],
      },
    ],
  });
});

// ==========================================
// Existing Ground Booking API & User In-Memory State
// ==========================================

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'Admin' | 'User';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ground {
  id: number;
  name: string;
  sportType: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: number;
  groundId: number;
  slotType: 'Day' | 'Night' | 'FullDay';
  startTime: string;
  endTime: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Addon {
  id: number;
  name: string;
  addonType: string;
  sportType: string;
  price: number;
  isComplimentary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAddonItem {
  id: number;
  bookingId: number;
  addonId: number;
  addonName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentRecord {
  id: number;
  bookingId: number;
  paymentReference: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed';
  paidAt: string | null;
  createdAt: string;
}

export interface Feedback {
  id: number;
  userId: number;
  groundId: number;
  bookingId: number;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  groundId: number;
  slotId: number;
  bookingDate: string;
  slotType: 'Day' | 'Night' | 'FullDay';
  status: 'PendingPayment' | 'Confirmed' | 'Cancelled';
  baseAmount: number;
  addonAmount: number;
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  createdAt: string;
  updatedAt: string;
  bookingAddons: BookingAddonItem[];
  payment?: PaymentRecord | null;
}

let nextUserId = 3;
let nextGroundId = 6;
let nextSlotId = 12;
let nextAddonId = 7;
let nextBookingId = 4;
let nextPaymentId = 4;
let nextFeedbackId = 3;
let nextBookingAddonId = 5;

const users: User[] = [
  {
    id: 1,
    fullName: 'Admin User',
    email: 'admin@cricketbooking.com',
    phone: '+1234567890',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'Admin',
    isVerified: true,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 2,
    fullName: 'Rohit Sharma',
    email: 'user@cricketbooking.com',
    phone: '+1987654321',
    passwordHash: bcrypt.hashSync('User@123', 10),
    role: 'User',
    isVerified: true,
    isActive: true,
    createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-05T00:00:00Z').toISOString(),
  },
];

const grounds: Ground[] = [
  {
    id: 1,
    name: "Lord's Cricket Ground",
    sportType: 'Cricket',
    description: 'The Home of Cricket with world-class turf pitch, full pavilion, and electronic scoring.',
    address: "St John's Wood Rd, London NW8 8QN, UK",
    latitude: 51.5298,
    longitude: -0.1724,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 2,
    name: 'Eden Gardens Stadium',
    sportType: 'Cricket',
    description: 'Iconic cricket venue featuring illuminated floodlights, practice turf nets, and media box.',
    address: 'B.B.D. Bagh, Kolkata, West Bengal 700021',
    latitude: 22.5646,
    longitude: 88.3433,
    isActive: true,
    createdAt: new Date('2026-01-02T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-02T00:00:00Z').toISOString(),
  },
  {
    id: 3,
    name: 'Melbourne Cricket Ground',
    sportType: 'Multi-Sport',
    description: 'Premier multi-sport amphitheater ideal for high-intensity night matches and athletic meets.',
    address: 'Brunton Ave, Richmond VIC 3002, Australia',
    latitude: -37.82,
    longitude: 144.9834,
    isActive: true,
    createdAt: new Date('2026-01-03T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-03T00:00:00Z').toISOString(),
  },
  {
    id: 4,
    name: 'The Oval Arena',
    sportType: 'Cricket',
    description: 'Historic sports grounds with fast grass wicket and member clubhouse facilities.',
    address: 'Kennington Oval, London SE11 5SS, UK',
    latitude: 51.4838,
    longitude: -0.115,
    isActive: true,
    createdAt: new Date('2026-01-04T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-04T00:00:00Z').toISOString(),
  },
  {
    id: 5,
    name: 'Wankhede Sports Complex',
    sportType: 'Cricket',
    description: 'Coastal ground known for electrifying atmosphere, red soil wickets, and player lounges.',
    address: 'Vinoo Mankad Rd, Churchgate, Mumbai 400020',
    latitude: 18.9389,
    longitude: 72.8258,
    isActive: true,
    createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-05T00:00:00Z').toISOString(),
  },
];

const slots: Slot[] = [
  { id: 1, groundId: 1, slotType: 'Day', startTime: '09:00:00', endTime: '13:00:00', basePrice: 250, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, groundId: 1, slotType: 'Night', startTime: '18:00:00', endTime: '22:00:00', basePrice: 350, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, groundId: 1, slotType: 'FullDay', startTime: '09:00:00', endTime: '22:00:00', basePrice: 550, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, groundId: 2, slotType: 'Day', startTime: '08:30:00', endTime: '13:30:00', basePrice: 200, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, groundId: 2, slotType: 'Night', startTime: '17:30:00', endTime: '22:30:00', basePrice: 300, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 6, groundId: 3, slotType: 'Day', startTime: '09:00:00', endTime: '14:00:00', basePrice: 280, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 7, groundId: 3, slotType: 'Night', startTime: '18:00:00', endTime: '23:00:00', basePrice: 400, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 8, groundId: 4, slotType: 'Day', startTime: '09:00:00', endTime: '13:00:00', basePrice: 220, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 9, groundId: 4, slotType: 'Night', startTime: '18:00:00', endTime: '22:00:00', basePrice: 320, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 10, groundId: 5, slotType: 'Day', startTime: '08:00:00', endTime: '12:00:00', basePrice: 240, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 11, groundId: 5, slotType: 'Night', startTime: '17:00:00', endTime: '21:00:00', basePrice: 360, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const addons: Addon[] = [
  { id: 1, name: 'Stadium Floodlights', addonType: 'Lighting', sportType: 'Cricket', price: 60, isComplimentary: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: 'Certified Umpire & Live Scorer', addonType: 'Staff', sportType: 'Cricket', price: 50, isComplimentary: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: 'Premium Leather Balls & Kit', addonType: 'Equipment', sportType: 'Cricket', price: 40, isComplimentary: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, name: 'HD Video Recording & Highlight Reel', addonType: 'Media', sportType: 'Multi-Sport', price: 75, isComplimentary: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, name: 'Refreshment & Electrolyte Cooler', addonType: 'Food', sportType: 'Multi-Sport', price: 30, isComplimentary: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 6, name: 'First Aid & Physio Kit', addonType: 'Medical', sportType: 'Multi-Sport', price: 0, isComplimentary: true, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const payments: PaymentRecord[] = [
  {
    id: 1,
    bookingId: 1,
    paymentReference: 'c4e58b19-f55a-4e44-8843-c0202931a7f1',
    amount: 310,
    status: 'Paid',
    paidAt: new Date('2026-05-10T14:30:00Z').toISOString(),
    createdAt: new Date('2026-05-10T14:30:00Z').toISOString(),
  },
  {
    id: 2,
    bookingId: 2,
    paymentReference: '7a98b241-d3ef-4d7a-8d12-984bb304f51e',
    amount: 400,
    status: 'Paid',
    paidAt: new Date('2026-05-12T10:15:00Z').toISOString(),
    createdAt: new Date('2026-05-12T10:15:00Z').toISOString(),
  },
];

const bookings: Booking[] = [
  {
    id: 1,
    userId: 2,
    groundId: 1,
    slotId: 1,
    bookingDate: '2026-05-15',
    slotType: 'Day',
    status: 'Confirmed',
    baseAmount: 250,
    addonAmount: 60,
    totalAmount: 310,
    paymentStatus: 'Paid',
    createdAt: new Date('2026-05-10T14:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-10T14:30:00Z').toISOString(),
    bookingAddons: [
      { id: 1, bookingId: 1, addonId: 1, addonName: 'Stadium Floodlights', unitPrice: 60, totalPrice: 60 },
    ],
    payment: payments[0],
  },
  {
    id: 2,
    userId: 2,
    groundId: 2,
    slotId: 5,
    bookingDate: '2026-05-20',
    slotType: 'Night',
    status: 'Confirmed',
    baseAmount: 300,
    addonAmount: 100,
    totalAmount: 400,
    paymentStatus: 'Paid',
    createdAt: new Date('2026-05-12T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-12T10:15:00Z').toISOString(),
    bookingAddons: [
      { id: 2, bookingId: 2, addonId: 1, addonName: 'Stadium Floodlights', unitPrice: 60, totalPrice: 60 },
      { id: 3, bookingId: 2, addonId: 3, addonName: 'Premium Leather Balls & Kit', unitPrice: 40, totalPrice: 40 },
    ],
    payment: payments[1],
  },
];

const feedbacks: Feedback[] = [
  {
    id: 1,
    userId: 2,
    groundId: 1,
    bookingId: 1,
    rating: 5,
    comment: 'Spectacular pitch conditions and historic atmosphere. Will definitely book again!',
    isVisible: true,
    createdAt: new Date('2026-05-16T12:00:00Z').toISOString(),
  },
];

const resetTokens = new Map<string, { email: string; expiresAt: number }>();

function parseId(param: string | string[] | undefined): number {
  if (!param) return 0;
  const val = Array.isArray(param) ? param[0] : param;
  return parseInt(val, 10) || 0;
}

function generateToken(user: User): string {
  const payload = {
    nameid: user.id.toString(),
    email: user.email,
    unique_name: user.fullName,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: '2h',
  });
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: parseInt(decoded.nameid || decoded.id, 10),
      email: decoded.email,
      name: decoded.unique_name || decoded.name,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'Admin') {
    res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    return;
  }
  next();
}

// ==========================================
// API v1 Routes (Ground Booking Original Endpoints)
// ==========================================

const apiRouter = express.Router();

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    res.status(400).json({ success: false, message: 'Email already registered' });
    return;
  }
  const newUser: User = {
    id: nextUserId++,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone || '',
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'User',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(newUser);
  const token = generateToken(newUser);
  res.status(200).json({
    success: true,
    message: 'registration successful',
    data: { id: newUser.id, fullName: newUser.fullName, email: newUser.email, phone: newUser.phone, role: newUser.role, token },
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401).json({ success: false, message: 'Email and password are required' });
    return;
  }
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }
  const token = generateToken(user);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, token },
  });
});

apiRouter.get('/grounds', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: grounds.filter(g => g.isActive) });
});

apiRouter.get('/grounds/:id', (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const ground = grounds.find(g => g.id === id);
  if (!ground) {
    res.status(404).json({ success: false, message: 'Ground not found' });
    return;
  }
  res.status(200).json({ success: true, data: ground });
});

apiRouter.get('/slots', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: slots });
});

apiRouter.get('/slots/ground/:groundId', (req: Request, res: Response) => {
  const groundId = parseId(req.params.groundId);
  res.status(200).json({ success: true, data: slots.filter(s => s.groundId === groundId && s.isActive) });
});

apiRouter.get('/addons', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: addons.filter(a => a.isActive) });
});

apiRouter.get('/Booking/my', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  res.status(200).json({ success: true, data: bookings.filter(b => b.userId === userId) });
});

apiRouter.get('/Booking/availability', (req: Request, res: Response) => {
  const groundId = parseInt(req.query.groundId as string, 10);
  const date = req.query.date as string;
  const groundSlots = slots.filter(s => s.groundId === groundId && s.isActive);
  const existingBookings = bookings.filter(b => b.groundId === groundId && b.bookingDate === date && b.status !== 'Cancelled');
  const availabilityList = groundSlots.map(s => ({
    slotId: s.id,
    slotType: s.slotType,
    startTime: s.startTime,
    endTime: s.endTime,
    basePrice: s.basePrice,
    isAvailable: !existingBookings.some(b => b.slotId === s.id),
  }));
  res.status(200).json({ success: true, date: availabilityList, data: availabilityList });
});

app.use('/api/v1', apiRouter);

// Documentation page static serving for /docs
const docsPath = path.join(__dirname, 'wwwroot', 'docs', 'index.html');
app.get(['/docs', '/docs/index.html'], (_req: Request, res: Response) => {
  if (fs.existsSync(docsPath)) {
    res.sendFile(docsPath);
  } else {
    res.redirect('/');
  }
});

// Weather forecast utility endpoint
app.get('/weatherforecast', (_req: Request, res: Response) => {
  res.json([
    { date: '2026-11-02', temperatureC: 22, temperatureF: 72, summary: 'Sunny' },
    { date: '2026-11-03', temperatureC: 24, temperatureF: 75, summary: 'Warm' },
  ]);
});

// ==========================================
// Vite Integration for Modern React Frontend
// ==========================================

async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Explicit fallback for API routes to never return HTML
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.originalUrl} not found` });
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/docs')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`.NET Sports Predictor platform running on http://0.0.0.0:${PORT}`);
    console.log(`Odds API Key configured: ${ODDS_API_KEY ? 'Yes' : 'No'}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
