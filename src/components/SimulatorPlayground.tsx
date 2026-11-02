import React, { useState } from 'react';
import { PredictionResult } from '../types/odds';
import { api } from '../services/api';
import { Play, Sparkles, Sliders, RotateCcw, BarChart3 } from 'lucide-react';

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

  const presets = [
    { name: 'Springboks vs All Blacks', home: 'South Africa', away: 'New Zealand', sport: 'Rugby Union', h: '1.90', a: '2.05', d: '25.0' },
    { name: 'Arsenal vs Man City', home: 'Arsenal', away: 'Manchester City', sport: 'Football / Soccer', h: '2.40', a: '2.80', d: '3.40' },
    { name: 'Proteas vs Australia', home: 'South Africa', away: 'Australia', sport: 'Cricket Test Match', h: '2.20', a: '1.95', d: '6.00' },
    { name: 'Chiefs vs Pirates', home: 'Kaizer Chiefs', away: 'Orlando Pirates', sport: 'Football / Soccer', h: '2.60', a: '2.70', d: '2.90' },
    { name: 'Celtics vs Lakers', home: 'Boston Celtics', away: 'Los Angeles Lakers', sport: 'Basketball', h: '1.45', a: '2.85', d: '' },
  ];

  const inputClass = 'glass-input w-full px-3 py-2 text-xs';

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-cyan-700 text-[11px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Custom prediction lab
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Interactive Monte Carlo &amp; implied odds simulator
        </h2>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Input any two teams, set consensus decimal odds, calibrate home advantage, and run up to 50,000
          simulations. The same deterministic form engine used in the live feed enriches every run.
        </p>

        <div className="pt-2 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-slate-500 font-medium">Presets</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHomeTeam(p.home);
                setAwayTeam(p.away);
                setSportType(p.sport);
                setHomeOdds(p.h);
                setAwayOdds(p.a);
                setDrawOdds(p.d);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/70 border border-white/80 hover:bg-white text-slate-600 transition-colors font-medium"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-700" />
            Match parameters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Sport / league</label>
              <input type="text" value={sportType} onChange={e => setSportType(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Home team</label>
                <input type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Away team</label>
                <input type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Home odds</label>
                <input type="number" step="0.05" value={homeOdds} onChange={e => setHomeOdds(e.target.value)} className={`${inputClass} metric`} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Draw (opt)</label>
                <input type="number" step="0.1" value={drawOdds} onChange={e => setDrawOdds(e.target.value)} placeholder="3.5" className={`${inputClass} metric`} />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Away odds</label>
                <input type="number" step="0.05" value={awayOdds} onChange={e => setAwayOdds(e.target.value)} className={`${inputClass} metric`} />
              </div>
            </div>

            <div className="pt-3 space-y-3 border-t border-white/70">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Home field advantage</span>
                  <span className="metric text-cyan-700">+{homeAdvantage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={homeAdvantage}
                  onChange={e => setHomeAdvantage(Number(e.target.value))}
                  className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Simulation iterations</span>
                  <span className="metric text-cyan-700">{iterations.toLocaleString()} runs</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="5000"
                  value={iterations}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full accent-cyan-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute {iterations.toLocaleString()} simulations</span>
                </>
              )}
            </button>
            <button
              onClick={() => setPrediction(null)}
              className="w-full py-2 text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear results
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          {prediction ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/70">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {prediction.homeTeam} vs {prediction.awayTeam}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Vig <span className="metric">{prediction.overroundPercent}%</span> stripped
                    <span className="text-slate-300"> · </span>
                    confidence <span className="metric">{prediction.confidenceScore}%</span>
                    {typeof prediction.formAdjustment === 'number' && (
                      <>
                        <span className="text-slate-300"> · </span>
                        form <span className="metric">{prediction.formAdjustment > 0 ? '+' : ''}{prediction.formAdjustment} pts</span>
                      </>
                    )}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-200/70 metric">
                  {prediction.predictedWinner === 'home' ? prediction.homeTeam : prediction.predictedWinner === 'away' ? prediction.awayTeam : 'Draw'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="inner-well p-4 rounded-2xl">
                  <div className="text-[11px] text-slate-500 truncate">{prediction.homeTeam}</div>
                  <div className="text-2xl metric text-cyan-700 my-1">{prediction.trueProbabilities.home}%</div>
                  <div className="text-[10px] text-slate-500">True probability</div>
                </div>
                <div className="inner-well p-4 rounded-2xl">
                  <div className="text-[11px] text-slate-500">Draw / tie</div>
                  <div className="text-2xl metric text-amber-600 my-1">{prediction.trueProbabilities.draw ?? '—'}%</div>
                  <div className="text-[10px] text-slate-500">Draw probability</div>
                </div>
                <div className="inner-well p-4 rounded-2xl">
                  <div className="text-[11px] text-slate-500 truncate">{prediction.awayTeam}</div>
                  <div className="text-2xl metric text-rose-600 my-1">{prediction.trueProbabilities.away}%</div>
                  <div className="text-[10px] text-slate-500">True probability</div>
                </div>
              </div>

              <div className="inner-well p-5 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-cyan-700" />
                    Monte Carlo outcomes ({prediction.monteCarlo.iterations.toLocaleString()} runs)
                  </span>
                  <span className="text-slate-500 metric">
                    H {prediction.monteCarlo.homeWinPct}% · D {prediction.monteCarlo.drawPct}% · A {prediction.monteCarlo.awayWinPct}%
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-200/70 rounded-full overflow-hidden flex shadow-inner">
                  <div style={{ width: `${prediction.monteCarlo.homeWinPct}%` }} className="bg-cyan-500 h-full" />
                  {prediction.monteCarlo.drawPct > 0 && (
                    <div style={{ width: `${prediction.monteCarlo.drawPct}%` }} className="bg-amber-400 h-full" />
                  )}
                  <div style={{ width: `${prediction.monteCarlo.awayWinPct}%` }} className="bg-rose-500 h-full" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500 metric text-center">
                  <div>Home {prediction.monteCarlo.homeWins.toLocaleString()}</div>
                  <div>Draws {prediction.monteCarlo.draws.toLocaleString()}</div>
                  <div>Away {prediction.monteCarlo.awayWins.toLocaleString()}</div>
                </div>
              </div>

              <div className="inner-well p-4 rounded-2xl">
                <div className="text-[11px] font-semibold text-slate-600 mb-2">Top simulated scorelines</div>
                <div className="flex flex-wrap gap-2">
                  {prediction.monteCarlo.simulatedScorelines.map((s, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-white/70 rounded-xl border border-white/80 text-[11px] metric text-slate-700">
                      <span className="font-bold text-slate-900">{s.score}</span>{' '}
                      <span className="text-emerald-600">({s.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-600 inner-well p-4 rounded-2xl">
                <span className="font-bold text-slate-900">Assessment: </span>
                {prediction.tacticalAnalysis.summary}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
              <BarChart3 className="w-12 h-12 text-slate-300" />
              <div className="text-sm font-medium">No simulation executed yet</div>
              <p className="text-xs max-w-sm">
                Pick a preset or execute simulations to run live Monte Carlo calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
