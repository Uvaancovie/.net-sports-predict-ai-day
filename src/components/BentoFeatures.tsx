import React from 'react';
import {
  Percent,
  Cpu,
  TrendingUp,
  History,
  ShieldAlert,
  Binary,
  Layers,
  Sparkles,
  ArrowUpRight,
  Calculator,
} from 'lucide-react';

export const BentoFeatures: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mathematical Foundations &amp; Algorithms</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered to Beat the House Margin.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Bookmakers price markets to secure a guaranteed 4% to 9% overround. Our C# predictive engine strips this
            built-in house advantage and models true stochastic variance.
          </p>
        </div>

        {/* 4-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Feature 01: Vig-Stripping Engine */}
          <div className="lg:col-span-6 glass-card rounded-3xl p-7 space-y-5 bg-white/80 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-700 uppercase tracking-widest">
                  01 / Margin Deconstruction
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700">
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Multiplicative Vig-Stripping Engine
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Bookmakers artificially inflate odds so that implied probabilities sum to 104%–108%. We apply
                closed-form proportional normalization to extract the true underlying Bernoulli and Dirichlet probabilities.
              </p>

              {/* Formula Callout */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 font-mono text-xs space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Normalisation Formula</div>
                <div className="text-slate-800 font-bold">
                  P_fair(i) = (1 / O_i) / Σ (1 / O_k)
                </div>
                <div className="text-[11px] text-slate-500">
                  Reveals true win rates by stripping the bookmaker's 5.2% overround juice.
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Arbitrage Detection</span>
              <span className="text-cyan-700 font-semibold">Zero-Juice Consensus</span>
            </div>
          </div>

          {/* Feature 02: 10,000 Monte Carlo Simulations */}
          <div className="lg:col-span-6 glass-card rounded-3xl p-7 space-y-5 bg-white/80 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  02 / Stochastic Modeling
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                10,000-Run Parallel C# Monte Carlo Engine
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Instead of simple point estimates, our engine runs 10,000 full match simulations in C# using vectorized
                random number generators and Poisson distribution matrices to simulate scorelines and tail risk.
              </p>

              {/* Formula Callout */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 font-mono text-xs space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400">Poisson Score Expectancy</div>
                <div className="text-slate-800 font-bold">
                  P(X = k) = (λ^k · e^(-λ)) / k!
                </div>
                <div className="text-[11px] text-slate-500">
                  Generates precise likelihood for exact scorelines: 2-1, 1-1, 3-0, etc.
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Parallel Threading in .NET 9</span>
              <span className="text-emerald-700 font-semibold">&lt; 15ms execution time</span>
            </div>
          </div>

          {/* Feature 03: +EV Edge Scanner & Kelly Sizing */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-7 space-y-5 bg-white/80 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 uppercase tracking-widest">
                  03 / Positive Expected Value
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Real-Time +EV Scanner &amp; Kelly Criterion Staking
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Identifies pricing discrepancies between bookmakers and the true fair line. If the bookmaker offers
                decimal odds higher than the model's true probability inverse, the system generates an immediate +EV alert
                and calculates the optimal fractional Kelly bet size to maximize bankroll compound growth.
              </p>

              {/* Formulas Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 font-mono text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Expected Value (+EV)</div>
                  <div className="text-slate-800 font-bold">EV = (P_fair × Odds) - 1</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Flags edges &gt; +3.0%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 font-mono text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Quarter Kelly Stake</div>
                  <div className="text-slate-800 font-bold">f* = 0.25 × ((b·p - q) / b)</div>
                  <div className="text-[11px] text-cyan-700 font-semibold">Protects capital drawdown</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Bankroll Preservation</span>
              <span className="text-amber-800 font-semibold">Automated Risk Management</span>
            </div>
          </div>

          {/* Feature 04: Head-to-Head & Form Trends */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-7 space-y-5 bg-white/80 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-700 uppercase tracking-widest">
                  04 / Empirical Evidence
                </span>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-700">
                  <History className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Head-to-Head Archives &amp; Form Momentum
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Raw odds miss tactical nuance. We ingest the last 5 direct encounters between opponents and weight recent
                5-match form (`W-W-D-L-W`) with an exponential decay factor (λ = 0.85), shifting probability priors toward
                in-form squads.
              </p>

              {/* Form Badges Visual */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Recent Momentum</span>
                <div className="flex items-center gap-1 font-mono font-bold text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">W</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">W</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300">D</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">L</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">W</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Time-Weighted Decay</span>
              <span className="text-sky-700 font-semibold">Form Factor Adjusted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
