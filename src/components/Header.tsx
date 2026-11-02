import React from 'react';
import { Activity, Trophy, Presentation, Cpu, Database, RefreshCw } from 'lucide-react';
import { QuotaInfo } from '../types/odds';

interface HeaderProps {
  activeTab: 'live' | 'simulator' | 'presentation' | 'pipeline';
  setActiveTab: (tab: 'live' | 'simulator' | 'presentation' | 'pipeline') => void;
  quota: QuotaInfo;
  onRefresh: () => void;
  isLoading: boolean;
}

const tabs = [
  { id: 'live', label: 'Live H2H', icon: Activity },
  { id: 'simulator', label: 'Simulator', icon: Trophy },
  { id: 'presentation', label: 'Presenter Mode', icon: Presentation },
  { id: 'pipeline', label: 'Pipeline', icon: Database },
] as const;

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  quota,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Accepted speaker session</span>
            <span className="text-slate-300">·</span>
            <span>Data &amp; AI Community Day Durban: Encore / .NET Conf SA</span>
            <span className="hidden md:inline text-slate-300">·</span>
            <span className="hidden md:inline">Nov 21, 2026 · Park Square, Umhlanga</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span>Uvaan Govender</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">50 min slot</span>
          </div>
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-xl border-b border-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/60">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    .NET Sports Predictor
                  </h1>
                  <span className="hidden sm:inline text-[10px] uppercase font-mono tracking-wider text-cyan-700">
                    Odds API v4
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Vig-stripping · Monte Carlo · Head-to-head form intelligence
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-1 p-1 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                const accent = tab.id === 'presentation' ? 'emerald' : 'cyan';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      active
                        ? accent === 'emerald'
                          ? 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-200/80'
                          : 'bg-cyan-500/12 text-cyan-700 ring-1 ring-cyan-200/80'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-white/80 shadow-sm text-[11px] backdrop-blur-xl">
                <span className="text-slate-500">Quota</span>
                <span className="metric text-emerald-600">{quota.remaining}</span>
                <span className="text-slate-300">/ 500</span>
                {quota.isCached && (
                  <span className="text-[9px] uppercase tracking-wide text-cyan-600 font-semibold">
                    Cached
                  </span>
                )}
              </div>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh live data"
                className="p-2 rounded-xl bg-white/70 border border-white/80 hover:bg-white text-slate-600 transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
