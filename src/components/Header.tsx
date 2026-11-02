import React from 'react';
import { Activity, Trophy, Presentation, Cpu, Database, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { QuotaInfo } from '../types/odds';

interface HeaderProps {
  activeTab: 'live' | 'simulator' | 'presentation' | 'pipeline';
  setActiveTab: (tab: 'live' | 'simulator' | 'presentation' | 'pipeline') => void;
  quota: QuotaInfo;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  quota,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* Conference Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-2 text-xs font-medium text-white shadow-inner flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="font-bold uppercase tracking-wider">Accepted Speaker Session</span>
          <span className="hidden sm:inline text-white/80">|</span>
          <span className="font-semibold">Data & AI Community Day Durban: Encore / .NET Conf SA</span>
          <span className="hidden md:inline text-white/80">• Nov 21, 2026 @ Park Square, Umhlanga</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-mono">Speaker: Uvaan</span>
          <span className="bg-black/30 px-2 py-0.5 rounded text-[11px] font-mono">50 Min Slot</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">.NET Sports Predictor</h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                  Odds API v4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Live Odds Intelligence, Vig-Stripping & Monte Carlo Simulation Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'live'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Odds & Predictions</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Match Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'presentation'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="font-semibold text-emerald-300">Durban Deck (50m)</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">API Pipeline</span>
            </button>
          </nav>

          {/* Odds API Quota & Refresh Counter */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Odds API Quota:</span>
              <span className="font-mono font-semibold text-emerald-400">{quota.remaining}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-mono">500</span>
              {quota.isCached && (
                <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                  Cached
                </span>
              )}
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh live data"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
