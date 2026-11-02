export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export type FormResult = 'W' | 'D' | 'L';

export interface FormEntry {
  result: FormResult;
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

export interface Outcome {
  name: string;
  price: number; // decimal or american
  point?: number; // for spreads and totals
  description?: string;
}

export interface Market {
  key: 'h2h' | 'spreads' | 'totals' | 'outrights' | string;
  last_update?: string;
  outcomes: Outcome[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
  h2h?: HeadToHeadRecord;
}

export interface PredictionResult {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  sportTitle: string;
  commenceTime: string;
  consensusOdds: {
    home: number;
    away: number;
    draw?: number;
  };
  rawImpliedProb: {
    home: number;
    away: number;
    draw?: number;
  };
  trueProbabilities: {
    home: number;
    away: number;
    draw?: number;
  };
  overroundPercent: number; // e.g. 5.4%
  predictedWinner: 'home' | 'away' | 'draw';
  confidenceScore: number; // 0 - 100%
  expectedGoals?: {
    home: number;
    away: number;
  };
  monteCarlo: {
    iterations: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    homeWinPct: number;
    awayWinPct: number;
    drawPct: number;
    simulatedScorelines: { score: string; count: number; pct: number }[];
  };
  valueBets: {
    team: string;
    bookmaker: string;
    offeredOdds: number;
    trueOdds: number;
    expectedValuePct: number;
    kellyStakePct: number;
  }[];
  tacticalAnalysis: {
    summary: string;
    keyFactors: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
  };
  h2h?: HeadToHeadRecord;
  formAdjustment?: number;
}

export interface QuotaInfo {
  remaining: number;
  used: number;
  lastCost: number;
  isCached: boolean;
  cacheExpiresInSeconds?: number;
}
