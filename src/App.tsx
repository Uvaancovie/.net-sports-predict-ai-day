import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BentoFeatures } from './components/BentoFeatures';
import { PricingSection } from './components/PricingSection';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOddsExplorer } from './components/LiveOddsExplorer';
import { PredictionModal } from './components/PredictionModal';
import { SimulatorPlayground } from './components/SimulatorPlayground';
import { ConferencePresentation } from './components/ConferencePresentation';
import { ApiPipelineViewer } from './components/ApiPipelineViewer';
import { api } from './services/api';
import { Sport, OddsEvent, PredictionResult, QuotaInfo } from './types/odds';
import { PlanTier, BillingInterval, SubscriptionRecord } from './types/subscription';
import { Sparkles, Trophy, Presentation, Database, ShieldCheck, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'simulator' | 'presentation' | 'pipeline'>('live');
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('upcoming');
  const [activeRegion, setActiveRegion] = useState<string>('uk,us');
  const [quota, setQuota] = useState<QuotaInfo>({
    remaining: 500,
    used: 0,
    lastCost: 0,
    isCached: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  const [activeEvent, setActiveEvent] = useState<OddsEvent | null>(null);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier>('pro');
  const [checkoutInterval, setCheckoutInterval] = useState<BillingInterval>('monthly');

  // Active subscription persistence
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(() => {
    try {
      const saved = localStorage.getItem('uvaan_bet_predict_sub');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Initial data loading
  useEffect(() => {
    loadSports();
    loadEvents(selectedSport, activeRegion);
  }, []);

  const loadSports = async () => {
    try {
      const data = await api.getSports();
      if (data && Array.isArray(data.sports)) {
        setSports(data.sports);
      }
      if (data?.quota) setQuota(data.quota);
    } catch (err: any) {
      console.warn('Notice loading sports:', err?.message || err);
    }
  };

  const loadEvents = async (sportKey: string, region = activeRegion) => {
    setIsLoading(true);
    try {
      const data = await api.getUpcomingOdds(sportKey, region);
      if (data && Array.isArray(data.events)) {
        setEvents(data.events);
      }
      if (data?.quota) setQuota(data.quota);
    } catch (err: any) {
      console.warn('Notice loading events:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSport = (sportKey: string) => {
    setSelectedSport(sportKey);
    loadEvents(sportKey, activeRegion);
  };

  const handleChangeRegion = (region: string) => {
    setActiveRegion(region);
    loadEvents(selectedSport, region);
  };

  const handleRefresh = () => {
    loadEvents(selectedSport, activeRegion);
  };

  const handleRunPrediction = async (event: OddsEvent) => {
    try {
      setActiveEvent(event);
      const prediction = await api.predictMatch(event);
      setActivePrediction(prediction);
    } catch (err) {
      console.error('Failed to run prediction:', err);
    }
  };

  const handleReSimulate = async (options: { homeAdvantage: number; iterations: number }) => {
    if (!activeEvent) return;
    try {
      const prediction = await api.predictMatch(activeEvent, options);
      setActivePrediction(prediction);
    } catch (err) {
      console.error('Failed to re-simulate:', err);
    }
  };

  const handleOpenCheckout = (planId: PlanTier = 'pro', interval: BillingInterval = 'monthly') => {
    setCheckoutPlan(planId);
    setCheckoutInterval(interval);
    setIsCheckoutOpen(true);
  };

  const handleSubscriptionSuccess = (sub: SubscriptionRecord) => {
    setActiveSubscription(sub);
    try {
      localStorage.setItem('uvaan_bet_predict_sub', JSON.stringify(sub));
    } catch (err) {
      console.warn('Could not save subscription to localStorage', err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find a featured event for the Hero card
  const featuredEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col font-sans overflow-x-hidden bg-[#f8fafc]">
      {/* Background radial ambient lights */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-48 left-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-200/25 blur-3xl -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/3 right-[-10%] h-[560px] w-[560px] rounded-full bg-emerald-200/20 blur-3xl -z-10"
      />

      {/* Top 1-Row 3-Zones Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        quota={quota}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        onOpenCheckout={handleOpenCheckout}
        activeSubscription={activeSubscription}
        onViewSubscription={() => setIsCheckoutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* If user explicitly selected Presenter Mode tab */}
        {activeTab === 'presentation' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Durban 2026 Presentation Console
                </h2>
                <p className="text-xs text-slate-500">
                  50-Minute Session · Data &amp; AI Community Day Durban · Park Square, Umhlanga
                </p>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
              >
                Back to SaaS Landing
              </button>
            </div>
            <ConferencePresentation />
          </div>
        ) : activeTab === 'simulator' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Custom Match Simulation Sandbox
                </h2>
                <p className="text-xs text-slate-500">
                  Adjust home advantage, team attack ratings &amp; Monte Carlo iterations
                </p>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
              >
                Back to SaaS Landing
              </button>
            </div>
            <SimulatorPlayground />
          </div>
        ) : activeTab === 'pipeline' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  The Odds API v4 Telemetry &amp; Proxy Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time quota management, HTTP response caching &amp; latency tracking
                </p>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
              >
                Back to SaaS Landing
              </button>
            </div>
            <ApiPipelineViewer quota={quota} onRefreshQuota={handleRefresh} />
          </div>
        ) : (
          /* Default Unified SaaS Landing Experience */
          <div>
            {/* 1. Hero Section with Live Interactive Preview Card */}
            <HeroSection
              onOpenCheckout={handleOpenCheckout}
              onExploreMatches={() => scrollToSection('predictor')}
              onRunFeaturedPrediction={handleRunPrediction}
              featuredEvent={featuredEvent}
            />

            {/* 2. Embedded Live Odds & H2H Form Explorer */}
            <section id="predictor" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Market Feeds</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Live Odds &amp; Head-to-Head Analytics
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Filter by sport, inspect bookmaker lines across premier sportsbooks, and click any fixture to run a
                  10,000-iteration Monte Carlo simulation.
                </p>
              </div>

              <LiveOddsExplorer
                sports={sports}
                events={events}
                selectedSport={selectedSport}
                onSelectSport={handleSelectSport}
                onRunPrediction={handleRunPrediction}
                isLoading={isLoading}
                activeRegion={activeRegion}
                onChangeRegion={handleChangeRegion}
              />
            </section>

            {/* 3. Mechanism-to-Outcome Bento Features */}
            <BentoFeatures />

            {/* 4. SaaS Pricing Matrix in South African Rand (ZAR) */}
            <PricingSection
              onSelectPlan={handleOpenCheckout}
              activePlanId={activeSubscription?.planId}
            />

            {/* 5. Durban Conference Presentation & Sandbox Showcase */}
            <section id="deck" className="py-16 bg-gradient-to-b from-white/40 to-slate-100/60 border-t border-slate-200/70">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Durban 2026 Session</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    50-Minute Conference Presenter Mode
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Designed for Uvaan's speaking session at Data &amp; AI Community Day Durban / .NET Conf SA
                    (Richfield College Umhlanga, Nov 21, 2026).
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('presentation')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
                    >
                      <Presentation className="w-4 h-4 text-emerald-400" />
                      <span>Open Full Presenter Console with Timer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Compact preview of presentation deck */}
                <div className="glass-panel rounded-3xl p-6 border border-white/80 shadow-md">
                  <ConferencePresentation />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Deep Match Prediction & Simulation Modal */}
      <PredictionModal
        prediction={activePrediction}
        event={activeEvent}
        onClose={() => {
          setActivePrediction(null);
          setActiveEvent(null);
        }}
        onReSimulate={handleReSimulate}
      />

      {/* Interactive ZAR Payment & License Checkout Drawer */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlanId={checkoutPlan}
        initialInterval={checkoutInterval}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      {/* Footer */}
      <footer className="relative border-t border-slate-200/80 bg-white/70 backdrop-blur-xl py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                UBP
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">Uvaan's Bet Predict</div>
                <div className="text-[11px] text-slate-400">Quantitative .NET 9 Sports Intelligence · South Africa</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium text-slate-600">
              <a href="#predictor" onClick={() => scrollToSection('predictor')} className="hover:text-slate-900 transition-colors">
                Live Predictor
              </a>
              <a href="#features" onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#pricing" onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 transition-colors">
                Pricing (ZAR)
              </a>
              <button onClick={() => setActiveTab('presentation')} className="hover:text-slate-900 transition-colors">
                Durban Presentation
              </button>
              <button onClick={() => setActiveTab('simulator')} className="hover:text-slate-900 transition-colors">
                Sandbox
              </button>
              <a
                href="/docs/index.html"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-700 hover:text-cyan-800 font-semibold"
              >
                API Reference
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              <span>© 2026 Uvaan's Bet Predict · Speaker: Uvaan Govender</span>
              <span className="mx-2">·</span>
              <span>Data &amp; AI Community Day Durban: Encore / .NET Conf SA</span>
            </div>
            <div className="text-center sm:text-right">
              <span>18+ Only · Responsible Gambling Programme: 0800 006 008</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
