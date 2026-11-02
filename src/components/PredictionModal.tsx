import React, { useState } from 'react';
import { PredictionResult, OddsEvent } from '../types/odds';
import {
  X,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

interface PredictionModalProps {
  prediction: PredictionResult | null;
  event: OddsEvent | null;
  onClose: () => void;
  onReSimulate: (options: { homeAdvantage: number; iterations: number }) => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({
  prediction,
  event,
  onClose,
  onReSimulate,
}) => {
  const [homeAdvantage, setHomeAdvantage] = useState(4);
  const [iterations, setIterations] = useState(10000);

  if (!prediction || !event) return null;

  const handleApplySliders = () => {
    onReSimulate({ homeAdvantage, iterations });
  };

  const isHomeWinner = prediction.predictedWinner === 'home';
  const isAwayWinner = prediction.predictedWinner === 'away';
  const isDraw = prediction.predictedWinner === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {prediction.sportTitle}
                </span>
                <span className="text-xs text-slate-400">Consensus Model &amp; Monte Carlo</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {prediction.homeTeam} vs {prediction.awayTeam}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Prediction Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Home Team Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isHomeWinner
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/50 border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-400">HOME WINNER</span>
                {isHomeWinner && (
                  <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Favored
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-white">{prediction.homeTeam}</div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-mono font-extrabold text-cyan-400">
                    {prediction.trueProbabilities.home}%
                  </div>
                  <div className="text-[11px] text-slate-400">True Fair Probability</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-300 font-semibold">
                    ${(100 / prediction.trueProbabilities.home).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Fair Odds</div>
                </div>
              </div>
            </div>

            {/* Draw / Balance Card */}
            {prediction.trueProbabilities.draw !== undefined ? (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDraw
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/50 border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-slate-400">DRAW / TIE</span>
                  {isDraw && (
                    <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">
                      Most Probable
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-white">Even Scoreline</div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-mono font-extrabold text-amber-400">
                      {prediction.trueProbabilities.draw}%
                    </div>
                    <div className="text-[11px] text-slate-400">Draw Probability</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-slate-300 font-semibold">
                      ${(100 / prediction.trueProbabilities.draw).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">Fair Odds</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">OVERROUND VIG FEE</span>
                <div className="my-2">
                  <div className="text-3xl font-mono font-extrabold text-emerald-400">
                    {prediction.overroundPercent}%
                  </div>
                  <div className="text-xs text-slate-400">Total Bookmaker Margin Stripped</div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Consensus across {event.bookmakers.length} bookmakers
                </div>
              </div>
            )}

            {/* Away Team Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isAwayWinner
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/10'
                  : 'bg-slate-950/50 border-slate-800/80'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-slate-400">AWAY WINNER</span>
                {isAwayWinner && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Favored
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-white">{prediction.awayTeam}</div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-mono font-extrabold text-rose-400">
                    {prediction.trueProbabilities.away}%
                  </div>
                  <div className="text-[11px] text-slate-400">True Fair Probability</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-300 font-semibold">
                    ${(100 / prediction.trueProbabilities.away).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Fair Odds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Probability Distribution Bar */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Probability Split (Consensus Stripped)</span>
              <span className="font-mono text-cyan-400">Model Confidence: {prediction.confidenceScore}%</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${prediction.trueProbabilities.home}%` }}
                className="bg-cyan-500 h-full transition-all duration-500"
                title={`${prediction.homeTeam}: ${prediction.trueProbabilities.home}%`}
              />
              {prediction.trueProbabilities.draw && (
                <div
                  style={{ width: `${prediction.trueProbabilities.draw}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                  title={`Draw: ${prediction.trueProbabilities.draw}%`}
                />
              )}
              <div
                style={{ width: `${prediction.trueProbabilities.away}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`${prediction.awayTeam}: ${prediction.trueProbabilities.away}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span className="text-cyan-400">{prediction.homeTeam} ({prediction.trueProbabilities.home}%)</span>
              {prediction.trueProbabilities.draw && (
                <span className="text-amber-400">Draw ({prediction.trueProbabilities.draw}%)</span>
              )}
              <span className="text-rose-400">{prediction.awayTeam} ({prediction.trueProbabilities.away}%)</span>
            </div>
          </div>

          {/* Monte Carlo 10,000 Iterations & Poisson Scorelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Monte Carlo Simulation</h4>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                  {prediction.monteCarlo.iterations.toLocaleString()} Runs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Home Wins</div>
                  <div className="text-base font-bold font-mono text-cyan-400">
                    {prediction.monteCarlo.homeWins.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{prediction.monteCarlo.homeWinPct}%</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Draws</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {prediction.monteCarlo.draws.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{prediction.monteCarlo.drawPct}%</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Away Wins</div>
                  <div className="text-base font-bold font-mono text-rose-400">
                    {prediction.monteCarlo.awayWins.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{prediction.monteCarlo.awayWinPct}%</div>
                </div>
              </div>

              {prediction.expectedGoals && (
                <div className="flex items-center justify-between text-xs bg-slate-900/60 px-3 py-2 rounded-xl text-slate-300">
                  <span>Poisson Expected Scoring:</span>
                  <span className="font-mono font-bold text-white">
                    {prediction.expectedGoals.home} vs {prediction.expectedGoals.away}
                  </span>
                </div>
              )}
            </div>

            {/* Top Simulated Scorelines */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Most Frequent Simulated Scorelines</h4>
              </div>

              <div className="space-y-2">
                {prediction.monteCarlo.simulatedScorelines.map((item: { score: string; count: number; pct: number }, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="font-mono font-bold text-white">{item.score}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">{item.count.toLocaleString()} times</span>
                      <span className="font-mono font-bold text-emerald-400 w-12 text-right">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Value Bet Detector (+EV Opportunities) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Positive Expected Value (+EV) Analysis</h4>
              </div>
              <span className="text-xs text-slate-400">Kelly Criterion Sizing</span>
            </div>

            {prediction.valueBets.length === 0 ? (
              <div className="bg-slate-900/60 p-4 rounded-xl text-center text-xs text-slate-400">
                Consensus market odds across active bookmakers are tightly balanced. No mispriced +EV arbitrage opportunities detected above 1.5% edge.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prediction.valueBets.map((vb: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{vb.team}</span>
                        <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                          {vb.bookmaker}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Offered: <span className="text-white font-mono">{vb.offeredOdds}</span> | True:{' '}
                        <span className="text-slate-400 font-mono">{vb.trueOdds}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-extrabold text-emerald-400">
                        +{vb.expectedValuePct}% EV
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Kelly: {vb.kellyStakePct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tactical Analysis & AI Insights */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Tactical Prediction Insights</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  prediction.tacticalAnalysis.riskLevel === 'Low'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : prediction.tacticalAnalysis.riskLevel === 'Medium'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {prediction.tacticalAnalysis.riskLevel} Volatility
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {prediction.tacticalAnalysis.summary}
            </p>
            <ul className="space-y-1.5 pt-2">
              {prediction.tacticalAnalysis.keyFactors.map((kf: string, i: number) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Simulation Parameters (Tuning Knobs) */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Live Model Tuning (Conference Demo Mode)
              </span>
              <button
                onClick={handleApplySliders}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Re-Simulate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Home Field Advantage Factor</span>
                  <span className="font-mono text-cyan-400">+{homeAdvantage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={homeAdvantage}
                  onChange={e => setHomeAdvantage(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Simulation Iterations</span>
                  <span className="font-mono text-cyan-400">{iterations.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="2000"
                  value={iterations}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <div>
            Data sourced live via The Odds API v4 • Computed via C# / .NET Algorithmic Model
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
