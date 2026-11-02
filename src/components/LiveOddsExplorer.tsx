import React, { useState } from 'react';
import { OddsEvent, Sport, Market, Outcome, FormEntry } from '../types/odds';
import { Clock, ChevronRight, Sparkles, Globe2 } from 'lucide-react';

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

const formTone: Record<string, string> = {
  W: 'bg-emerald-500/12 text-emerald-700 border-emerald-200/80',
  D: 'bg-slate-500/10 text-slate-600 border-slate-200',
  L: 'bg-rose-500/10 text-rose-600 border-rose-200/80',
};

const FormRibbon: React.FC<{ form?: FormEntry[]; label?: string }> = ({ form, label }) => {
  if (!form || form.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>}
      {form.map((entry, idx) => (
        <span
          key={idx}
          title={`${entry.result} vs ${entry.opponent} (${entry.score})`}
          className={`w-5 h-5 rounded-md border text-[10px] font-bold flex items-center justify-center metric ${formTone[entry.result]}`}
        >
          {entry.result}
        </span>
      ))}
    </div>
  );
};

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
    { key: 'upcoming', label: 'Upcoming (All)' },
    { key: 'soccer_epl', label: 'Premier League' },
    { key: 'cricket_test_match', label: 'Cricket Tests' },
    { key: 'basketball_nba', label: 'NBA' },
    { key: 'rugbyleague_nrl', label: 'Rugby' },
    { key: 'americanfootball_nfl', label: 'NFL' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {featuredSportKeys.map(s => {
            const isSelected = selectedSport === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onSelectSport(s.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white text-cyan-700 border-cyan-200 shadow-[0_8px_24px_rgba(14,165,233,0.12)]'
                    : 'bg-white/50 text-slate-600 border-white/70 hover:bg-white/90 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/70">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium whitespace-nowrap">
              <Globe2 className="w-3.5 h-3.5" /> Region
            </span>
            <div className="flex gap-1 p-1 rounded-xl bg-white/60 border border-white/80 text-[11px]">
              {[
                { id: 'uk,us', label: 'Global' },
                { id: 'uk', label: 'UK / EU' },
                { id: 'us', label: 'US' },
                { id: 'au', label: 'AU' },
              ].map(reg => (
                <button
                  key={reg.id}
                  onClick={() => onChangeRegion(reg.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeRegion === reg.id
                      ? 'bg-white text-cyan-700 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Search team or league..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="glass-input w-full sm:w-72 px-3 py-2 text-xs"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Live fixtures &amp; odds matrix
            <span className="ml-2 font-mono text-cyan-700">{filteredEvents.length}</span>
          </h2>
          <span className="text-[11px] text-slate-400">Live from The Odds API v4 · H2H form generated in-memory</span>
        </div>

        {isLoading ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent" />
            <p className="text-sm text-slate-500">Querying bookmaker lines and building form history...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
            <p className="text-sm text-slate-700 font-medium">No fixtures match this selection.</p>
            <p className="text-xs text-slate-500">
              The sport may be out of round or bookmakers have closed trading. Try Upcoming (All).
            </p>
            <button
              onClick={() => onSelectSport('upcoming')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              Load all upcoming matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.map(event => {
              const bookmakers = event.bookmakers || [];
              const primaryBookmaker = bookmakers[0];
              const h2hMarket = primaryBookmaker?.markets?.find((m: Market) => m.key === 'h2h');
              const record = event.h2h;

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

              const homeOutcome = h2hMarket?.outcomes.find((o: Outcome) => o.name === event.home_team);
              const awayOutcome = h2hMarket?.outcomes.find((o: Outcome) => o.name === event.away_team);
              const drawOutcome = h2hMarket?.outcomes.find(
                (o: Outcome) => o.name.toLowerCase() === 'draw' || o.name.toLowerCase() === 'tie'
              );

              const homePrice = homeOutcome ? homeOutcome.price : 1.9;
              const awayPrice = awayOutcome ? awayOutcome.price : 2.8;
              const drawPrice = drawOutcome ? drawOutcome.price : null;

              const rawHome = Math.round((1 / homePrice) * 100);
              const rawAway = Math.round((1 / awayPrice) * 100);
              const rawDraw = drawPrice ? Math.round((1 / drawPrice) * 100) : 0;
              const vig = Math.max(0, Math.round((rawHome + rawAway + rawDraw - 100) * 10) / 10);

              const summary = record?.h2hSummary;
              const totalH2H = summary ? Math.max(1, summary.totalMatches) : 1;

              return (
                <div key={event.id} className="glass-card rounded-3xl p-5 flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] text-slate-500">
                        <span className="font-semibold text-cyan-700">{event.sport_title}</span>
                        <span className="text-slate-300"> · </span>
                        <span className="metric">{formattedDate}</span>
                        <span className="text-slate-300"> · </span>
                        <span className="metric inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formattedTime}
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap metric">
                        {bookmakers.length} books
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="inner-well rounded-2xl p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{event.home_team}</div>
                          <div className="text-[10px] text-slate-400 mb-1.5">Home</div>
                          <FormRibbon form={record?.homeForm} />
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base metric text-cyan-700">{homePrice}</div>
                          <div className="text-[10px] text-slate-400 metric">~{rawHome}% implied</div>
                        </div>
                      </div>

                      {drawPrice && (
                        <div className="flex items-center justify-between px-3.5 py-1.5 text-[11px] text-slate-500">
                          <span>Draw / Tie</span>
                          <span className="metric text-slate-700">
                            {drawPrice} ({rawDraw}%)
                          </span>
                        </div>
                      )}

                      <div className="inner-well rounded-2xl p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{event.away_team}</div>
                          <div className="text-[10px] text-slate-400 mb-1.5">Away</div>
                          <FormRibbon form={record?.awayForm} />
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base metric text-rose-600">{awayPrice}</div>
                          <div className="text-[10px] text-slate-400 metric">~{rawAway}% implied</div>
                        </div>
                      </div>
                    </div>

                    {summary && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            H2H
                            <span className="text-slate-300"> · </span>
                            <span className="metric text-slate-700">
                              {summary.homeWins}-{summary.draws}-{summary.awayWins}
                            </span>
                          </span>
                          <span className="text-slate-400 metric">avg {summary.avgScore} pts</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-slate-100">
                          <div style={{ width: `${(summary.homeWins / totalH2H) * 100}%` }} className="bg-cyan-500 h-full" />
                          <div style={{ width: `${(summary.draws / totalH2H) * 100}%` }} className="bg-slate-300 h-full" />
                          <div style={{ width: `${(summary.awayWins / totalH2H) * 100}%` }} className="bg-rose-400 h-full" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>
                        Vig <span className="metric text-emerald-600">{vig}%</span>
                      </span>
                      <span className="text-slate-400">{primaryBookmaker?.title || 'Consensus'}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/70">
                    <button
                      onClick={() => onRunPrediction(event)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run prediction &amp; H2H analysis</span>
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
