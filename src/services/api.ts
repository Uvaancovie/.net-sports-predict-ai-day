import { Sport, OddsEvent, PredictionResult, QuotaInfo } from '../types/odds';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.warn(`[API] Expected JSON response from ${url} but received ${contentType}:`, text.substring(0, 100));
    throw new Error(`API returned invalid content type (${contentType || 'non-JSON'}).`);
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json as T;
}

export const api = {
  async getSports(): Promise<{ sports: Sport[]; quota: QuotaInfo }> {
    return fetchJson<{ sports: Sport[]; quota: QuotaInfo }>('/api/odds/sports');
  },

  async getUpcomingOdds(sport = 'upcoming', regions = 'uk,us', markets = 'h2h'): Promise<{
    events: OddsEvent[];
    quota: QuotaInfo;
    sportKey: string;
    fallbackNotice?: string;
  }> {
    return fetchJson<{
      events: OddsEvent[];
      quota: QuotaInfo;
      sportKey: string;
      fallbackNotice?: string;
    }>(`/api/odds/events?sport=${sport}&regions=${regions}&markets=${markets}`);
  },

  async getQuota(): Promise<QuotaInfo> {
    return fetchJson<QuotaInfo>('/api/odds/quota');
  },

  async predictMatch(event: OddsEvent, options?: { homeAdvantage?: number; formWeight?: number; iterations?: number }): Promise<PredictionResult> {
    const data = await fetchJson<{ success: boolean; prediction: PredictionResult }>('/api/predict/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        options: options || {},
      }),
    });
    return data.prediction;
  },

  async runCustomSimulation(params: {
    homeTeam: string;
    awayTeam: string;
    sportType: string;
    homeOdds: number;
    awayOdds: number;
    drawOdds?: number;
    homeAdvantage: number;
    iterations: number;
  }): Promise<PredictionResult> {
    const data = await fetchJson<{ success: boolean; prediction: PredictionResult }>('/api/predict/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return data.prediction;
  },
};
