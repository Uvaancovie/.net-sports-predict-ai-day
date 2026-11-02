import React, { useState } from 'react';
import { OddsEvent, Sport, PredictionResult, Market, Outcome } from '../types/odds';
import { Zap, Clock, ShieldCheck, ChevronRight, TrendingUp, Sparkles, Filter, Globe2 } from 'lucide-react';

interface LiveOddsExplorerProps {
  sports: Sport[];
  events: OddsEvent[];
  selectedSport: string;
  onSelectSport: (sportKey: string) => void;
  onRunPrediction: (event: OddsEvent) => void;
  isLoading: boolean;
  activeRegion: string;
  onChangeRegion: (region: string) => void;
}

export const LiveOddsExplorer: React.FC<LiveOddsExplorerProps> = ({
  sports,
  events,
  selectedSport,
  onSelectSport,
  onRunPrediction,
  isLoading,
  activeRegion,
  onChangeRegion,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredEvents = events.filter(e => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      e.home_team.toLowerCase().includes(term) ||
      e.away_team.toLowerCase().includes(term) ||
      e.sport_title.toLowerCase().includes(term)
    );
  });

  const featuredSportKeys = [
    { key: 'upcoming', label: '⚡ Upcoming (All)', icon: '🔥' },
    { key: 'soccer_epl', label: 'Premier League', icon: '⚽' },
    { key: 'cricket_test_match', label: 'Cricket Tests', icon: '🏏' },
    { key: 'basketball_nba', label: 'NBA', icon: '🏀' },
    { key: 'rugbyleague_nrl', label: 'Rugby', icon: '🏉' },
    { key: 'americanfootball_nfl', label: 'NFL', icon: '🏈' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Sport selector & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        {/* Sport Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {featuredSportKeys.map(s => {
            const isSelected = selectedSport === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onSelectSport(s.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary filters: Region & search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Globe2 className="w-3.5 h-3.5" /> Bookmaker Region:
            </span>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {[
                { id: 'uk,us', label: 'Global (UK+US)' },
                { id: 'uk', label: 'UK / EU' },
                { id: 'us', label: 'US Vegas' },
                { id: 'au', label: 'Australia' },
              ].map(reg => (
                <button
                  key={reg.id}
                  onClick={() => onChangeRegion(reg.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeRegion === reg.id
                      ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>Live Fixtures & Odds Matrix</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
              {filteredEvents.length} Matches Available
            </span>
          </h2>
          <span className="text-xs text-slate-400">Odds from The Odds API v4</span>
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-slate-500">Querying real-time bookmaker lines & calculating market spreads...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <p className="text-sm text-slate-700 font-medium">No live fixtures found matching your selection.</p>
            <p className="text-xs text-slate-500">
              The selected sport may not be currently in round or bookmakers have closed trading. Switch to "Upcoming (All)" to view live events.
            </p>
            <button
              onClick={() => onSelectSport('upcoming')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              Load All Upcoming Matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.map(event => {
              const bookmakers = event.bookmakers || [];
              const primaryBookmaker = bookmakers[0];
              const h2h = primaryBookmaker?.markets?.find((m: Market) => m.key === 'h2h');

              // Format date
              const eventDate = new Date(event.commence_time);
              const formattedDate = eventDate.toLocaleDateString('en-ZA', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const formattedTime = eventDate.toLocaleTimeString('en-ZA', {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Extract prices
              const homeOutcome = h2h?.outcomes.find((o: Outcome) => o.name === event.home_team);
              const awayOutcome = h2h?.outcomes.find((o: Outcome) => o.name === event.away_team);
              const drawOutcome = h2h?.outcomes.find((o: Outcome) => o.name.toLowerCase() === 'draw' || o.name.toLowerCase() === 'tie');

              const homePrice = homeOutcome ? homeOutcome.price : 1.9;
              const awayPrice = awayOutcome ? awayOutcome.price : 2.8;
              const drawPrice = drawOutcome ? drawOutcome.price : null;

              // Raw implied %
              const rawHome = Math.round((1 / homePrice) * 100);
              const rawAway = Math.round((1 / awayPrice) * 100);
              const rawDraw = drawPrice ? Math.round((1 / drawPrice) * 100) : 0;
              const vig = Math.max(0, Math.round((rawHome + rawAway + rawDraw - 100) * 10) / 10);

              return (
                <div
                  key={event.id}
                  className="bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-indigo-100 rounded-2xl p-5 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-600">{event.sport_title}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formattedDate} {formattedTime}
                        </span>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        {bookmakers.length} Bookmakers
                      </span>
                    </div>

                    {/* Teams Matchup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                            H
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{event.home_team}</div>
                            <div className="text-[11px] text-slate-500">Home Ground Advantage</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-indigo-600">{homePrice}</div>
                          <div className="text-[10px] text-slate-400 font-mono">~{rawHome}% Implied</div>
                        </div>
                      </div>

                      {drawPrice && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50/60 text-xs text-slate-500">
                          <span>Draw / Tie</span>
                          <span className="font-mono text-slate-700 font-semibold">{drawPrice} ({rawDraw}%)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-rose-600 text-xs">
                            A
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{event.away_team}</div>
                            <div className="text-[11px] text-slate-500">Visiting Team</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-rose-600">{awayPrice}</div>
                          <div className="text-[10px] text-slate-400 font-mono">~{rawAway}% Implied</div>
                        </div>
                      </div>
                    </div>

                    {/* Bookmaker line indicators */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bookmaker vig margin:</span>
                        <span className="font-mono font-semibold text-emerald-600">{vig}%</span>
                      </div>
                      <div className="text-slate-400 font-mono">
                        Source: {primaryBookmaker?.title || 'Consensus'}
                      </div>
                    </div>
                  </div>

                  {/* Action button: Predict & Simulate */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => onRunPrediction(event)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all group-hover:shadow-indigo-500/30"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Monte Carlo & Value Bet Predictor</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
