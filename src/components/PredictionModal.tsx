import React, { useState } from 'react';
import { PredictionResult, OddsEvent, FormEntry } from '../types/odds';
import {
  X,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  History,
} from 'lucide-react';

interface PredictionModalProps {
  prediction: PredictionResult | null;
  event: OddsEvent | null;
  onClose: () => void;
  onReSimulate: (options: { homeAdvantage: number; iterations: number }) => void;
}

const formTone: Record<string, string> = {
  W: 'bg-emerald-500/12 text-emerald-700 border-emerald-200/80',
  D: 'bg-slate-500/10 text-slate-600 border-slate-200',
  L: 'bg-rose-500/10 text-rose-600 border-rose-200/80',
};

const FormRow: React.FC<{ form: FormEntry[]; team: string }> = ({ form, team }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-slate-700 truncate">{team}</span>
    <div className="flex items-center gap-1">
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
  </div>
);

export const PredictionModal: React.FC<PredictionModalProps> = ({
  prediction,
  event,
  onClose,
  onReSimulate,
}) => {
  const [homeAdvantage, setHomeAdvantage] = useState(4);
  const [iterations, setIterations] = useState(10000);

  if (!prediction || !event) return null;

  const isHomeWinner = prediction.predictedWinner === 'home';
  const isAwayWinner = prediction.predictedWinner === 'away';
  const isDraw = prediction.predictedWinner === 'draw';
  const record = prediction.h2h || event.h2h;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
      <div className="glass-modal relative w-full max-w-4xl rounded-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-200/70 flex items-center justify-center text-cyan-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-cyan-700">{prediction.sportTitle}</span>
                <span className="text-slate-300"> · </span>
                Consensus model &amp; Monte Carlo
              </p>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {prediction.homeTeam} vs {prediction.awayTeam}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isHomeWinner
                  ? 'bg-cyan-500/10 border-cyan-200/80 shadow-[0_10px_30px_rgba(14,165,233,0.12)]'
                  : 'inner-well'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Home win</span>
                {isHomeWinner && (
                  <span className="text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Favored
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-slate-900 truncate">{prediction.homeTeam}</div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl metric text-cyan-700">{prediction.trueProbabilities.home}%</div>
                  <div className="text-[11px] text-slate-500">True probability</div>
                </div>
                <div className="text-right">
                  <div className="text-sm metric text-slate-700">{(100 / prediction.trueProbabilities.home).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Fair odds</div>
                </div>
              </div>
            </div>

            {prediction.trueProbabilities.draw !== undefined ? (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDraw ? 'bg-amber-500/10 border-amber-200/80' : 'inner-well'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Draw / tie</span>
                  {isDraw && (
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Most probable
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-slate-900">Even scoreline</div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl metric text-amber-600">{prediction.trueProbabilities.draw}%</div>
                    <div className="text-[11px] text-slate-500">Draw probability</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm metric text-slate-700">
                      {(100 / prediction.trueProbabilities.draw).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">Fair odds</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="inner-well p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Overround vig fee</span>
                <div className="my-2">
                  <div className="text-3xl metric text-emerald-600">{prediction.overroundPercent}%</div>
                  <div className="text-xs text-slate-500">Bookmaker margin stripped</div>
                </div>
                <div className="text-[11px] text-slate-400">Across {event.bookmakers.length} bookmakers</div>
              </div>
            )}

            <div
              className={`p-5 rounded-2xl border transition-all ${
                isAwayWinner
                  ? 'bg-rose-500/10 border-rose-200/80 shadow-[0_10px_30px_rgba(244,63,94,0.10)]'
                  : 'inner-well'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Away win</span>
                {isAwayWinner && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Favored
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-slate-900 truncate">{prediction.awayTeam}</div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl metric text-rose-600">{prediction.trueProbabilities.away}%</div>
                  <div className="text-[11px] text-slate-500">True probability</div>
                </div>
                <div className="text-right">
                  <div className="text-sm metric text-slate-700">{(100 / prediction.trueProbabilities.away).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Fair odds</div>
                </div>
              </div>
            </div>
          </div>

          <div className="inner-well p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Probability split (consensus stripped)</span>
              <span className="metric text-cyan-700">Confidence: {prediction.confidenceScore}%</span>
            </div>
            <div className="h-4 w-full bg-slate-200/70 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${prediction.trueProbabilities.home}%` }} className="bg-cyan-500 h-full transition-all duration-500" />
              {prediction.trueProbabilities.draw && (
                <div style={{ width: `${prediction.trueProbabilities.draw}%` }} className="bg-amber-400 h-full transition-all duration-500" />
              )}
              <div style={{ width: `${prediction.trueProbabilities.away}%` }} className="bg-rose-500 h-full transition-all duration-500" />
            </div>
            <div className="flex items-center justify-between text-[11px] metric text-slate-500 pt-1">
              <span className="text-cyan-700">{prediction.homeTeam} ({prediction.trueProbabilities.home}%)</span>
              {prediction.trueProbabilities.draw && (
                <span className="text-amber-600">Draw ({prediction.trueProbabilities.draw}%)</span>
              )}
              <span className="text-rose-600">{prediction.awayTeam} ({prediction.trueProbabilities.away}%)</span>
            </div>
          </div>

          {record && (
            <div className="inner-well p-5 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  Head-to-head history
                </h4>
                <span className="text-[11px] text-slate-500 metric">
                  {record.h2hSummary.homeWins}-{record.h2hSummary.draws}-{record.h2hSummary.awayWins}
                  <span className="text-slate-300"> · </span>
                  avg {record.h2hSummary.avgScore} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormRow form={record.homeForm} team={prediction.homeTeam} />
                  <FormRow form={record.awayForm} team={prediction.awayTeam} />
                  <p className="text-[11px] text-slate-500 pt-1">
                    Recent form shifts the model by{' '}
                    <span className={`metric ${(prediction.formAdjustment ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(prediction.formAdjustment ?? 0) >= 0 ? '+' : ''}
                      {prediction.formAdjustment ?? 0} pts
                    </span>{' '}
                    in favour of {prediction.homeTeam}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {record.previousMatches.map((match, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-white/70 rounded-lg px-2.5 py-1.5 border border-white/80">
                      <span className="text-slate-400 metric w-16 shrink-0">
                        {new Date(match.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className={`truncate ${match.winner === 'home' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {match.homeTeam}
                      </span>
                      <span className="metric text-slate-900 px-2 shrink-0">
                        {match.homeScore}–{match.awayScore}
                      </span>
                      <span className={`truncate text-right ${match.winner === 'away' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {match.awayTeam}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="inner-well p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-700" />
                  <h4 className="text-sm font-bold text-slate-900">Monte Carlo simulation</h4>
                </div>
                <span className="text-[10px] metric text-cyan-700">{prediction.monteCarlo.iterations.toLocaleString()} runs</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Home wins', value: prediction.monteCarlo.homeWins, pct: prediction.monteCarlo.homeWinPct, tone: 'text-cyan-700' },
                  { label: 'Draws', value: prediction.monteCarlo.draws, pct: prediction.monteCarlo.drawPct, tone: 'text-amber-600' },
                  { label: 'Away wins', value: prediction.monteCarlo.awayWins, pct: prediction.monteCarlo.awayWinPct, tone: 'text-rose-600' },
                ].map(cell => (
                  <div key={cell.label} className="bg-white/70 p-2.5 rounded-xl border border-white/80">
                    <div className="text-[10px] text-slate-500">{cell.label}</div>
                    <div className={`text-base metric ${cell.tone}`}>{cell.value.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 metric">{cell.pct}%</div>
                  </div>
                ))}
              </div>

              {prediction.expectedGoals && (
                <div className="flex items-center justify-between text-[11px] bg-white/70 border border-white/80 px-3 py-2 rounded-xl text-slate-600">
                  <span>Poisson expected scoring</span>
                  <span className="metric text-slate-900">
                    {prediction.expectedGoals.home} vs {prediction.expectedGoals.away}
                  </span>
                </div>
              )}
            </div>

            <div className="inner-well p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Most frequent scorelines</h4>
              </div>

              <div className="space-y-2">
                {prediction.monteCarlo.simulatedScorelines.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/70 px-3 py-2 rounded-xl border border-white/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center metric text-[10px] text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="metric font-bold text-slate-900">{item.score}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 metric">{item.count.toLocaleString()} times</span>
                      <span className="metric font-bold text-emerald-600 w-12 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="inner-well p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Positive expected value (+EV)</h4>
              </div>
              <span className="text-[11px] text-slate-500">Quarter-Kelly sizing</span>
            </div>

            {prediction.valueBets.length === 0 ? (
              <div className="bg-white/70 border border-white/80 p-4 rounded-xl text-center text-[11px] text-slate-500">
                Consensus odds are tightly balanced. No +EV opportunities above the 1.5% edge threshold.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prediction.valueBets.map((vb, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{vb.team}</span>
                        <span className="text-[10px] text-emerald-700 metric">{vb.bookmaker}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 metric">
                        {vb.offeredOdds} offered · {vb.trueOdds} fair
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs metric font-extrabold text-emerald-600">+{vb.expectedValuePct}% EV</div>
                      <div className="text-[10px] text-slate-500 metric">Kelly {vb.kellyStakePct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="inner-well p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-700" />
                Tactical prediction insights
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  prediction.tacticalAnalysis.riskLevel === 'Low'
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/80'
                    : prediction.tacticalAnalysis.riskLevel === 'Medium'
                    ? 'bg-amber-500/10 text-amber-700 border border-amber-200/80'
                    : 'bg-rose-500/10 text-rose-700 border border-rose-200/80'
                }`}
              >
                {prediction.tacticalAnalysis.riskLevel} volatility
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{prediction.tacticalAnalysis.summary}</p>
            <ul className="space-y-1.5 pt-2">
              {prediction.tacticalAnalysis.keyFactors.map((kf, i) => (
                <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="inner-well p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-700" />
                Live model tuning
              </span>
              <button
                onClick={() => onReSimulate({ homeAdvantage, iterations })}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Re-simulate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Home field advantage</span>
                  <span className="metric text-cyan-700">+{homeAdvantage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={homeAdvantage}
                  onChange={e => setHomeAdvantage(Number(e.target.value))}
                  className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Simulation iterations</span>
                  <span className="metric text-cyan-700">{iterations.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="2000"
                  value={iterations}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/70 bg-white/40 backdrop-blur-xl flex items-center justify-between text-[11px] text-slate-500">
          <span>The Odds API v4 · deterministic H2H engine · .NET 10 model</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/80 border border-white/90 hover:bg-white text-slate-700 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
