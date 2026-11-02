import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Zap,
  Percent,
  Play,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { PlanTier } from '../types/subscription';
import { OddsEvent } from '../types/odds';

interface HeroSectionProps {
  onOpenCheckout: (planId: PlanTier) => void;
  onExploreMatches: () => void;
  onRunFeaturedPrediction: (event: OddsEvent) => void;
  featuredEvent?: OddsEvent | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCheckout,
  onExploreMatches,
  onRunFeaturedPrediction,
  featuredEvent,
}) => {
  // Fallback featured event if none loaded yet
  const defaultEvent: OddsEvent = {
    id: 'hero-featured-arsenal-chelsea',
    sport_key: 'soccer_epl',
    sport_title: 'English Premier League',
    commence_time: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    home_team: 'Arsenal',
    away_team: 'Chelsea',
    bookmakers: [
      {
        key: 'betway_za',
        title: 'Betway SA',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Arsenal', price: 1.95 },
              { name: 'Chelsea', price: 4.10 },
              { name: 'Draw', price: 3.65 },
            ],
          },
        ],
      },
    ],
    h2h: {
      previousMatches: [
        { date: '2026-04-23', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 5, awayScore: 0, winner: 'home' },
        { date: '2025-11-10', homeTeam: 'Chelsea', awayTeam: 'Arsenal', homeScore: 1, awayScore: 1, winner: 'draw' },
        { date: '2025-05-02', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 3, awayScore: 1, winner: 'home' },
      ],
      homeForm: [
        { result: 'W', opponent: 'Wolves', score: '2-0', date: '2026-10-28' },
        { result: 'W', opponent: 'Shakhtar', score: '1-0', date: '2026-10-22' },
        { result: 'D', opponent: 'Liverpool', score: '2-2', date: '2026-10-18' },
        { result: 'W', opponent: 'PSG', score: '2-0', date: '2026-10-12' },
        { result: 'W', opponent: 'Southampton', score: '3-1', date: '2026-10-05' },
      ],
      awayForm: [
        { result: 'W', opponent: 'Newcastle', score: '2-1', date: '2026-10-27' },
        { result: 'L', opponent: 'Liverpool', score: '1-2', date: '2026-10-20' },
        { result: 'W', opponent: 'Gent', score: '4-2', date: '2026-10-15' },
        { result: 'W', opponent: 'Brighton', score: '4-2', date: '2026-10-06' },
        { result: 'D', opponent: 'Nottm Forest', score: '1-1', date: '2026-09-29' },
      ],
      h2hSummary: {
        homeWins: 4,
        awayWins: 1,
        draws: 2,
        totalMatches: 7,
        avgScore: 2.8,
      },
    },
  };

  const activeMatch = featuredEvent || defaultEvent;

  return (
    <section id="hero" className="relative pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-200/40 via-sky-200/30 to-emerald-200/40 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800 tracking-tight">
                South Africa's Premier .NET Quantitative Sports Intelligence
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-sans">
              Outsmart the Bookmakers with{' '}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Quantitative .NET
              </span>{' '}
              Sports Intelligence.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Eliminate betting house margins with multiplicative vig stripping. Model match volatility across{' '}
              <strong className="text-slate-900 font-semibold">10,000 C# Monte Carlo simulations</strong>, inspect
              true Poisson goal distributions, and isolate high-probability +EV edges sized with the Kelly Criterion.
            </p>

            {/* Zero-Pill Metric Discipline */}
            <div className="text-xs text-slate-500 font-medium pt-1">
              <span>ZAR Tiers from R249/mo</span>
              <span className="text-slate-300 mx-2">·</span>
              <span>The Odds API v4 Pipeline</span>
              <span className="text-slate-300 mx-2">·</span>
              <span>Capitec Pay &amp; Instant EFT</span>
              <span className="text-slate-300 mx-2">·</span>
              <span className="text-emerald-700 font-semibold">Cancel anytime</span>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => onOpenCheckout('free')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-600/25 hover:shadow-cyan-600/35 transition-all hover:scale-[1.02] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free 7-Day Trial</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onExploreMatches}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-800 bg-white/80 hover:bg-white border border-slate-200/90 shadow-sm hover:shadow transition-all"
              >
                <Play className="w-4 h-4 text-cyan-600" />
                <span>Test Live Match Prediction</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-xl font-extrabold text-slate-900 font-mono">10,000+</div>
                <div className="text-xs text-slate-500">Monte Carlo runs/sec</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-cyan-700 font-mono">0.0% Vig</div>
                <div className="text-xs text-slate-500">Stripped fair odds</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-700 font-mono">+7.4% EV</div>
                <div className="text-xs text-slate-500">Average edge detected</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 font-mono">.NET 9</div>
                <div className="text-xs text-slate-500">Durban 2026 Engine</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-3xl blur-xl" />

              {/* Main Frosted Glass Card */}
              <div className="relative glass-card rounded-3xl p-6 border border-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-5 bg-white/85">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Live Market Signal
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200/60 font-mono">
                    EPL · Vig: -5.4% Stripped
                  </span>
                </div>

                {/* Matchup Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {activeMatch.home_team} vs {activeMatch.away_team}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kickoff in 18h · Emirates Stadium</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                    +EV Edge
                  </span>
                </div>

                {/* Odds vs True Fair Probability Comparison */}
                <div className="space-y-2.5">
                  {/* Home Team */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{activeMatch.home_team} (Home)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through text-[11px] font-mono">1.95</span>
                        <span className="font-mono font-bold text-emerald-700">1.82 True (55.0%)</span>
                      </div>
                    </div>
                    {/* Visual Probability Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: '55%' }}
                      />
                    </div>
                  </div>

                  {/* Draw */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Draw</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] font-mono">3.65</span>
                        <span className="font-mono text-slate-700">3.92 True (25.5%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '25.5%' }} />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{activeMatch.away_team} (Away)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] font-mono">4.10</span>
                        <span className="font-mono text-slate-700">5.12 True (19.5%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: '19.5%' }} />
                    </div>
                  </div>
                </div>

                {/* +EV Alert Callout */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-300/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-emerald-900">
                      Positive Edge Identified: +7.4% EV
                    </div>
                    <p className="text-slate-600 leading-tight">
                      Betway offers <span className="font-mono font-semibold">1.95</span> vs our C# model's fair line of{' '}
                      <span className="font-mono font-semibold">1.82</span>. Fractional Kelly recommends 3.2% capital sizing.
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onRunFeaturedPrediction(activeMatch)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Run 10,000 Monte Carlo Simulations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
