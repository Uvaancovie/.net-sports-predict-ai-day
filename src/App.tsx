import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LiveOddsExplorer } from './components/LiveOddsExplorer';
import { PredictionModal } from './components/PredictionModal';
import { SimulatorPlayground } from './components/SimulatorPlayground';
import { ConferencePresentation } from './components/ConferencePresentation';
import { ApiPipelineViewer } from './components/ApiPipelineViewer';
import { api } from './services/api';
import { Sport, OddsEvent, PredictionResult, QuotaInfo } from './types/odds';

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

  // Initial load
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        quota={quota}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'live' && (
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
        )}

        {activeTab === 'simulator' && <SimulatorPlayground />}

        {activeTab === 'presentation' && <ConferencePresentation />}

        {activeTab === 'pipeline' && (
          <ApiPipelineViewer quota={quota} onRefreshQuota={handleRefresh} />
        )}
      </main>

      {/* Prediction Modal */}
      <PredictionModal
        prediction={activePrediction}
        event={activeEvent}
        onClose={() => {
          setActivePrediction(null);
          setActiveEvent(null);
        }}
        onReSimulate={handleReSimulate}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Developing A .NET Sports Predictor</span>
            <span>•</span>
            <span>Speaker: Uvaan Govender</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Data &amp; AI Community Day Durban: Encore / .NET Conf SA • Nov 21, 2026</span>
            <a
              href="/docs/index.html"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Booking API Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
