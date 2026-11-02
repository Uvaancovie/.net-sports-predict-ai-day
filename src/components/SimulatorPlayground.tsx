import React, { useState } from 'react';
import { PredictionResult } from '../types/odds';
import { api } from '../services/api';
import { Play, Sparkles, Sliders, Shield, RotateCcw, BarChart3, CheckCircle2 } from 'lucide-react';

export const SimulatorPlayground: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState('Springboks (South Africa)');
  const [awayTeam, setAwayTeam] = useState('All Blacks (New Zealand)');
  const [sportType, setSportType] = useState('Rugby Union');
  const [homeOdds, setHomeOdds] = useState('1.85');
  const [awayOdds, setAwayOdds] = useState('2.10');
  const [drawOdds, setDrawOdds] = useState('21.00');
  const [homeAdvantage, setHomeAdvantage] = useState(5);
  const [iterations, setIterations] = useState(15000);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await api.runCustomSimulation({
        homeTeam,
        awayTeam,
        sportType,
        homeOdds: parseFloat(homeOdds) || 2.0,
        awayOdds: parseFloat(awayOdds) || 2.0,
        drawOdds: drawOdds ? parseFloat(drawOdds) : undefined,
        homeAdvantage,
        iterations,
      });
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const presetMatchups = [
    {
      name: 'Springboks vs All Blacks (Rugby)',
      home: 'South Africa',
      away: 'New Zealand',
      sport: 'Rugby Union',
      hOdds: '1.90',
      aOdds: '2.05',
      dOdds: '25.0',
    },
    {
      name: 'Arsenal vs Man City (EPL)',
      home: 'Arsenal',
      away: 'Manchester City',
      sport: 'Football / Soccer',
      hOdds: '2.40',
      aOdds: '2.80',
      dOdds: '3.40',
    },
    {
      name: 'Proteas vs Australia (Cricket)',
      home: 'South Africa',
      away: 'Australia',
      sport: 'Cricket Test Match',
      hOdds: '2.20',
      aOdds: '1.95',
      dOdds: '6.00',
    },
    {
      name: 'Kaizer Chiefs vs Orlando Pirates (PSL)',
      home: 'Kaizer Chiefs',
      away: 'Orlando Pirates',
      sport: 'Football / Soccer',
      hOdds: '2.60',
      aOdds: '2.70',
      dOdds: '2.90',
    },
    {
      name: 'Celtics vs Lakers (NBA)',
      home: 'Boston Celtics',
      away: 'Los Angeles Lakers',
      sport: 'Basketball',
      hOdds: '1.45',
      aOdds: '2.85',
      dOdds: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Custom Match Prediction Lab
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Interactive Monte Carlo &amp; Implied Odds Simulator
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Input any two teams, specify market consensus decimal odds, calibrate home advantage factors, and trigger up to 50,000 algorithmic simulations. Ideal for live on-stage audience interaction at Durban Data &amp; AI Day!
        </p>

        {/* Quick presets */}
        <div className="pt-2 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
          {presetMatchups.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHomeTeam(p.home);
                setAwayTeam(p.away);
                setSportType(p.sport);
                setHomeOdds(p.hOdds);
                setAwayOdds(p.aOdds);
                setDrawOdds(p.dOdds);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-medium"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Match Parameters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sport / League</label>
              <input
                type="text"
                value={sportType}
                onChange={e => setSportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Home Team</label>
                <input
                  type="text"
                  value={homeTeam}
                  onChange={e => setHomeTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Away Team</label>
                <input
                  type="text"
                  value={awayTeam}
                  onChange={e => setAwayTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Home Odds</label>
                <input
                  type="number"
                  step="0.05"
                  value={homeOdds}
                  onChange={e => setHomeOdds(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Draw Odds (Opt)</label>
                <input
                  type="number"
                  step="0.1"
                  value={drawOdds}
                  onChange={e => setDrawOdds(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Away Odds</label>
                <input
                  type="number"
                  step="0.05"
                  value={awayOdds}
                  onChange={e => setAwayOdds(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Home Field Advantage</span>
                  <span className="font-mono text-cyan-400">+{homeAdvantage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={homeAdvantage}
                  onChange={e => setHomeAdvantage(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Simulation Iterations</span>
                  <span className="font-mono text-cyan-400">{iterations.toLocaleString()} runs</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="5000"
                  value={iterations}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute {iterations.toLocaleString()} Simulations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Output */}
        <div className="lg:col-span-7 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          {prediction ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {prediction.homeTeam} vs {prediction.awayTeam}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Consensus Vig: {prediction.overroundPercent}% removed | Model Confidence: {prediction.confidenceScore}%
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Favored: {prediction.predictedWinner === 'home' ? prediction.homeTeam : prediction.predictedWinner === 'away' ? prediction.awayTeam : 'Draw'}
                </span>
              </div>

              {/* Probabilities Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">{prediction.homeTeam}</div>
                  <div className="text-2xl font-extrabold font-mono text-cyan-400 my-1">
                    {prediction.trueProbabilities.home}%
                  </div>
                  <div className="text-[10px] text-slate-500">True Probability</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">Draw / Tie</div>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 my-1">
                    {prediction.trueProbabilities.draw ?? 'N/A'}%
                  </div>
                  <div className="text-[10px] text-slate-500">Draw Probability</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400">{prediction.awayTeam}</div>
                  <div className="text-2xl font-extrabold font-mono text-rose-400 my-1">
                    {prediction.trueProbabilities.away}%
                  </div>
                  <div className="text-[10px] text-slate-500">True Probability</div>
                </div>
              </div>

              {/* Monte Carlo Visual breakdown */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Monte Carlo Outcomes ({prediction.monteCarlo.iterations.toLocaleString()} runs)
                  </span>
                  <span className="text-slate-400 font-mono">
                    Home {prediction.monteCarlo.homeWinPct}% • Draw {prediction.monteCarlo.drawPct}% • Away {prediction.monteCarlo.awayWinPct}%
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div style={{ width: `${prediction.monteCarlo.homeWinPct}%` }} className="bg-cyan-500 h-full" />
                  {prediction.monteCarlo.drawPct > 0 && (
                    <div style={{ width: `${prediction.monteCarlo.drawPct}%` }} className="bg-amber-400 h-full" />
                  )}
                  <div style={{ width: `${prediction.monteCarlo.awayWinPct}%` }} className="bg-rose-500 h-full" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-slate-400 font-mono text-center">
                  <div>Home Wins: {prediction.monteCarlo.homeWins.toLocaleString()}</div>
                  <div>Draws: {prediction.monteCarlo.draws.toLocaleString()}</div>
                  <div>Away Wins: {prediction.monteCarlo.awayWins.toLocaleString()}</div>
                </div>
              </div>

              {/* Key Scorelines */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Top Simulated Scorelines (Poisson Sampling)
                </div>
                <div className="flex flex-wrap gap-2">
                  {prediction.monteCarlo.simulatedScorelines.map((s: { score: string; count: number; pct: number }, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-200"
                    >
                      <span className="font-bold text-white">{s.score}</span>{' '}
                      <span className="text-emerald-400 text-[11px]">({s.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical summary */}
              <div className="text-xs text-slate-400 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <span className="font-bold text-slate-200">Algorithmic Assessment: </span>
                {prediction.tacticalAnalysis.summary}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
              <BarChart3 className="w-12 h-12 text-slate-700" />
              <div className="text-sm font-medium text-slate-300">No simulation executed yet</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Click 'Execute Simulations' or choose a quick preset on the left to run live Monte Carlo calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
