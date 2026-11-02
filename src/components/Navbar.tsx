import React, { useState } from 'react';
import {
  Activity,
  Trophy,
  Presentation,
  Database,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { QuotaInfo } from '../types/odds';
import { PlanTier, SubscriptionRecord } from '../types/subscription';

interface NavbarProps {
  activeTab: 'live' | 'simulator' | 'presentation' | 'pipeline';
  setActiveTab: (tab: 'live' | 'simulator' | 'presentation' | 'pipeline') => void;
  quota: QuotaInfo;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCheckout: (planId?: PlanTier) => void;
  activeSubscription: SubscriptionRecord | null;
  onViewSubscription: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  quota,
  onRefresh,
  isLoading,
  onOpenCheckout,
  activeSubscription,
  onViewSubscription,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string, tab?: 'live' | 'simulator' | 'presentation' | 'pipeline') => {
    if (tab) {
      setActiveTab(tab);
    }
    setMobileMenuOpen(false);

    if (sectionId.startsWith('#')) {
      const el = document.querySelector(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl transition-all">
      {/* Top micro-bar: Speaker & Conference credential */}
      <div className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800">Accepted speaker session</span>
            <span className="text-slate-300">·</span>
            <span>Data &amp; AI Community Day Durban / .NET Conf SA</span>
            <span className="hidden md:inline text-slate-300">·</span>
            <span className="hidden md:inline">Nov 21, 2026 · Park Square, Umhlanga</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Uvaan Govender</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              50 min talk
            </span>
          </div>
        </div>
      </div>

      {/* Main 1-Row, 3-Zones Top Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Zone 1: Wordmark & Brand Identity */}
            <div className="flex items-center gap-3">
              <a
                href="#hero"
                onClick={e => {
                  e.preventDefault();
                  handleNavClick('#hero', 'live');
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 ring-1 ring-white/80 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-sans">
                      Uvaan's Bet Predict
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/80">
                      ZAR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                    Quantitative .NET 9 Sports Intelligence
                  </p>
                </div>
              </a>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-inner">
              <button
                onClick={() => handleNavClick('#predictor', 'live')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'live'
                    ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-600" />
                <span>Live Predictor</span>
              </button>

              <button
                onClick={() => handleNavClick('#features')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Features</span>
              </button>

              <button
                onClick={() => handleNavClick('#pricing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pricing (ZAR)</span>
              </button>

              <button
                onClick={() => handleNavClick('#deck', 'presentation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'presentation'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Presentation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Durban Deck</span>
              </button>

              <button
                onClick={() => handleNavClick('#simulator', 'simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Sandbox</span>
              </button>

              <button
                onClick={() => handleNavClick('#pipeline', 'pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-sky-600" />
                <span>API</span>
              </button>
            </nav>

            {/* Zone 3: Primary Actions & Quota Badge */}
            <div className="flex items-center gap-2.5">
              {/* Quota Telemetry Pill */}
              <div
                title="The Odds API v4 monthly quota status"
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm text-[11px]"
              >
                <span className="text-slate-500">API Quota</span>
                <span className="font-mono font-bold text-emerald-600 tabular-nums">{quota.remaining}</span>
                <span className="text-slate-300">/ 500</span>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Refresh odds and telemetry"
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
                </button>
              </div>

              {/* Subscription Status or Upgrade CTA */}
              {activeSubscription ? (
                <button
                  onClick={onViewSubscription}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-300 shadow-sm hover:bg-emerald-500/15 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono uppercase">{activeSubscription.planName}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCheckout('free')}
                    className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 shadow-sm transition-all"
                  >
                    Start Free
                  </button>
                  <button
                    onClick={() => onOpenCheckout('pro')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-[0.99]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Pro · R249</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleNavClick('#predictor', 'live')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <Activity className="w-4 h-4 text-cyan-600" /> Live Predictor
            </button>
            <button
              onClick={() => handleNavClick('#features')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <Layers className="w-4 h-4 text-slate-600" /> Features
            </button>
            <button
              onClick={() => handleNavClick('#pricing')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" /> Pricing (ZAR)
            </button>
            <button
              onClick={() => handleNavClick('#deck', 'presentation')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <Presentation className="w-4 h-4 text-emerald-600" /> Durban Deck
            </button>
            <button
              onClick={() => handleNavClick('#simulator', 'simulator')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <Trophy className="w-4 h-4 text-amber-500" /> Sandbox
            </button>
            <button
              onClick={() => handleNavClick('#pipeline', 'pipeline')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800"
            >
              <Database className="w-4 h-4 text-sky-600" /> API Quota
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCheckout('pro');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 text-center shadow-md shadow-cyan-600/20"
            >
              Upgrade to Pro (R249 / month)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
