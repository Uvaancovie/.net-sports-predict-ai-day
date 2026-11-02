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
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
        {/* Sport Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {featuredSportKeys.map(s => {
            const isSelected = selectedSport === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onSelectSport(s.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary filters: Region & search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Globe2 className="w-3.5 h-3.5" /> Bookmaker Region:
            </span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
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
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
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
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Live Fixtures & Odds Matrix</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {filteredEvents.length} Matches Available
            </span>
          </h2>
          <span className="text-xs text-slate-500">Odds from The Odds API v4</span>
        </div>

        {isLoading ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Querying real-time bookmaker lines & calculating market spreads...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm text-slate-300 font-medium">No live fixtures found matching your selection.</p>
            <p className="text-xs text-slate-500">
              The selected sport may not be currently in round or bookmakers have closed trading. Switch to "Upcoming (All)" to view live events.
            </p>
            <button
              onClick={() => onSelectSport('upcoming')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
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
                  className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cyan-400">{event.sport_title}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formattedDate} {formattedTime}
                        </span>
                      </div>
                      <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                        {bookmakers.length} Bookmakers
                      </span>
                    </div>

                    {/* Teams Matchup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center font-bold text-blue-400 text-xs">
                            H
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{event.home_team}</div>
                            <div className="text-[11px] text-slate-400">Home Ground Advantage</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-cyan-300">{homePrice}</div>
                          <div className="text-[10px] text-slate-500 font-mono">~{rawHome}% Implied</div>
                        </div>
                      </div>

                      {drawPrice && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/30 text-xs text-slate-400">
                          <span>Draw / Tie</span>
                          <span className="font-mono text-slate-300 font-semibold">{drawPrice} ({rawDraw}%)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center font-bold text-red-400 text-xs">
                            A
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{event.away_team}</div>
                            <div className="text-[11px] text-slate-400">Visiting Team</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-rose-300">{awayPrice}</div>
                          <div className="text-[10px] text-slate-500 font-mono">~{rawAway}% Implied</div>
                        </div>
                      </div>
                    </div>

                    {/* Bookmaker line indicators */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Bookmaker vig margin:</span>
                        <span className="font-mono font-semibold text-emerald-400">{vig}%</span>
                      </div>
                      <div className="text-slate-500 font-mono">
                        Source: {primaryBookmaker?.title || 'Consensus'}
                      </div>
                    </div>
                  </div>

                  {/* Action button: Predict & Simulate */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => onRunPrediction(event)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all group-hover:shadow-cyan-500/30"
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
