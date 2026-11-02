import React, { useState } from 'react';
import { QuotaInfo } from '../types/odds';
import { Database, RefreshCw, Key, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

interface ApiPipelineViewerProps {
  quota: QuotaInfo;
  onRefreshQuota: () => void;
}

export const ApiPipelineViewer: React.FC<ApiPipelineViewerProps> = ({ quota, onRefreshQuota }) => {
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/odds/cache/clear', { method: 'POST' });
      const data = await res.json();
      setClearMessage(data.message || 'Cache cleared');
      onRefreshQuota();
      setTimeout(() => setClearMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const metricCard = (label: string, value: React.ReactNode, hint: string) => (
    <div className="inner-well p-4 rounded-2xl">
      <span className="text-[11px] text-slate-500 block mb-1">{label}</span>
      <div className="text-2xl metric">{value}</div>
      <span className="text-[10px] text-slate-400">{hint}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-200/70 flex items-center justify-center text-cyan-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">The Odds API v4 pipeline</h2>
              <p className="text-[11px] text-slate-500">Live quota telemetry, cache layers &amp; resilient proxy</p>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="px-3.5 py-1.5 rounded-xl bg-white/70 border border-white/80 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
            <span>Clear server cache</span>
          </button>
        </div>

        {clearMessage && (
          <div className="text-xs bg-emerald-500/10 border border-emerald-200/80 text-emerald-700 p-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{clearMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {metricCard('Requests remaining', <span className="text-emerald-600">{quota.remaining}</span>, 'out of 500 initial quota')}
          {metricCard('Requests consumed', <span className="text-cyan-700">{quota.used}</span>, 'this billing period')}
          {metricCard('Last request cost', <span className="text-slate-800">{quota.lastCost}</span>, 'credits consumed')}
          {metricCard(
            'Cache optimization',
            <span className="text-amber-600 text-base">{quota.isCached ? 'Active' : 'Live passthrough'}</span>,
            'prevents quota burnout'
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Configured credentials</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="inner-well p-3 rounded-xl metric text-slate-700">
              <span className="text-slate-400 block text-[10px]">ODDS_API_KEY</span>
              <span className="text-cyan-700 font-bold break-all">b59370b4edcfdb8e3ef4104f2ca72dac</span>
            </div>
            <div className="inner-well p-3 rounded-xl metric text-slate-700">
              <span className="text-slate-400 block text-[10px]">API HOST (v4)</span>
              <span className="text-slate-600">https://api.the-odds-api.com/v4</span>
            </div>
            <div className="inner-well p-3 rounded-xl text-slate-500 text-[11px]">
              Demo key seeded for the Durban conference build.
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Reference documentation</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              The Odds API v4 specification covering endpoints, schemas, regions (uk, us, eu, au),
              markets (h2h, spreads, totals), and bookmakers (DraftKings, FanDuel, BetMGM, Unibet, Betfair).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="/docs/index.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-colors"
            >
              <span>Open booking API docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Endpoint breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/60 text-slate-500 border-b border-white/80">
              <tr>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Method</th>
                <th className="p-3">Quota cost</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/70 metric">
              {[
                ['/v4/sports/', 'GET', '0 credits', 'Returns in-season sports & leagues'],
                ['/v4/sports/{sport}/odds/', 'GET', '1 credit / region / market', 'Upcoming & live games with bookmaker odds'],
                ['/v4/sports/{sport}/scores/', 'GET', '1 - 2 credits', 'Live & completed match scores'],
                ['/v4/sports/{sport}/events', 'GET', '0 credits', 'Fixtures and commence times without odds'],
              ].map(([endpoint, method, cost, purpose]) => (
                <tr key={endpoint}>
                  <td className="p-3 text-cyan-700">{endpoint}</td>
                  <td className="p-3 text-slate-600">{method}</td>
                  <td className={`p-3 font-bold ${cost.startsWith('0') ? 'text-emerald-600' : 'text-amber-600'}`}>{cost}</td>
                  <td className="p-3 text-slate-500 font-sans">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
