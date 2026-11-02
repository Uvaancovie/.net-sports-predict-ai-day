import React, { useState } from 'react';
import { QuotaInfo } from '../types/odds';
import { Database, ShieldCheck, RefreshCw, Key, FileText, CheckCircle2, ExternalLink, Zap } from 'lucide-react';

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">The Odds API v4 Pipeline Status</h2>
              <p className="text-xs text-slate-400">Live Quota Tracking, Cache Layers &amp; Resilient Proxy</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
              <span>Clear Server Cache</span>
            </button>
          </div>
        </div>

        {clearMessage && (
          <div className="text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{clearMessage}</span>
          </div>
        )}

        {/* Quota Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Requests Remaining</span>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {quota.remaining}
            </div>
            <span className="text-[10px] text-slate-500">out of 500 initial quota</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Requests Consumed</span>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {quota.used}
            </div>
            <span className="text-[10px] text-slate-500">this billing period</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Last Request Cost</span>
            <div className="text-2xl font-mono font-bold text-white">
              {quota.lastCost}
            </div>
            <span className="text-[10px] text-slate-500">credits consumed</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Cache Optimization</span>
            <div className="text-base font-mono font-bold text-amber-400 my-1">
              {quota.isCached ? 'ACTIVE (5m TTL)' : 'Live Passthrough'}
            </div>
            <span className="text-[10px] text-slate-500">Prevents quota burnout</span>
          </div>
        </div>
      </div>

      {/* PDF Documentation & API Key Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configured Credentials</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300">
              <span className="text-slate-500 block text-[10px]">ODDS_API_KEY</span>
              <span className="text-cyan-300 font-bold">b59370b4edcfdb8e3ef4104f2ca72dac</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300">
              <span className="text-slate-500 block text-[10px]">API HOST (v4)</span>
              <span className="text-slate-300">https://api.the-odds-api.com/v4</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 text-xs">
              Sourced directly from your Sessionize presentation workspace requirements.
            </div>
          </div>
        </div>

        {/* Documentation PDF Asset */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Attached Reference Documentation
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Full 76-page specification provided: <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">ODDS-API-DOCS-V4_c5663ce9.pdf</code> covering endpoints, schemas, regions (uk, us, eu, au), markets (h2h, spreads, totals), and bookmakers (DraftKings, FanDuel, BetMGM, Unibet, Betfair).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="/docs/index.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <span>Open Ground Booking API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Endpoints Table from PDF */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          The Odds API v4 Endpoints Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Method</th>
                <th className="p-3">Quota Cost</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr>
                <td className="p-3 text-cyan-400">/v4/sports/</td>
                <td className="p-3 text-slate-300">GET</td>
                <td className="p-3 text-emerald-400 font-bold">0 Credits</td>
                <td className="p-3 text-slate-400 font-sans">Returns in-season sports &amp; leagues</td>
              </tr>
              <tr>
                <td className="p-3 text-cyan-400">/v4/sports/{`{sport}`}/odds/</td>
                <td className="p-3 text-slate-300">GET</td>
                <td className="p-3 text-amber-400 font-bold">1 Credit / region / market</td>
                <td className="p-3 text-slate-400 font-sans">Upcoming &amp; live games with bookmaker odds</td>
              </tr>
              <tr>
                <td className="p-3 text-cyan-400">/v4/sports/{`{sport}`}/scores/</td>
                <td className="p-3 text-slate-300">GET</td>
                <td className="p-3 text-amber-400 font-bold">1 - 2 Credits</td>
                <td className="p-3 text-slate-400 font-sans">Live &amp; completed match scores</td>
              </tr>
              <tr>
                <td className="p-3 text-cyan-400">/v4/sports/{`{sport}`}/events</td>
                <td className="p-3 text-slate-300">GET</td>
                <td className="p-3 text-emerald-400 font-bold">0 Credits</td>
                <td className="p-3 text-slate-400 font-sans">Fixtures and commence times without odds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
