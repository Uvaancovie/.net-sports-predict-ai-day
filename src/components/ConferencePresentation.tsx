import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Code2,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Database,
  Shield,
  ArrowRight,
  Play,
} from 'lucide-react';

export const ConferencePresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: '01 / 07 • Welcome & Overview',
      title: 'Developing A .NET Sports Predictor',
      subtitle: 'From Live Odds API Ingestion to Monte Carlo Match Probabilities in C#',
      badge: 'Data & AI Community Day Durban: Encore • .NET Conf SA',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase">Speaker</span>
              <div className="text-sm font-bold text-white">Uvaan Govender</div>
              <div className="text-slate-400">Software Engineer &amp; .NET Enthusiast</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase">Venue &amp; Date</span>
              <div className="text-sm font-bold text-white">Park Square, Umhlanga</div>
              <div className="text-slate-400">Richfield College • Nov 21, 2026</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase">Session Slot</span>
              <div className="text-sm font-bold text-emerald-400">50 Minutes</div>
              <div className="text-slate-400">Architecture + Math + Live Demo</div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Session Roadmap</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <div>
                  <strong className="text-white block">The Problem Space</strong>
                  <span>Why bookmaker odds are market consensus signals, not true probabilities.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <div>
                  <strong className="text-white block">The Odds API v4 Ingestion</strong>
                  <span>Resilient HTTP pipelines, rate limits, and market schemas.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <div>
                  <strong className="text-white block">Mathematics &amp; Vig Stripping</strong>
                  <span>Shin's method, margin removal, Poisson distribution, and Monte Carlo.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                <div>
                  <strong className="text-white block">C# &amp; .NET 10 Implementation</strong>
                  <span>Clean architecture, IHttpClientFactory, Polly, and ML.NET pipelines.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      tag: '02 / 07 • The Problem Space',
      title: 'Sports Odds vs True Probability',
      subtitle: 'Understanding the Bookmaker Edge and Market Pricing Efficiency',
      badge: 'Data Science & Market Dynamics',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Bookmaker Reality (The "Overround")</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bookmakers don't gamble; they broker liquidity with a built-in tax (vigorish / juice).
              </p>
              <div className="bg-slate-900 p-3 rounded-xl font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                <div>Team A: 1.85 (Implied: 54.05%)</div>
                <div>Team B: 2.10 (Implied: 47.62%)</div>
                <div className="text-rose-400 pt-1 font-bold">Total Implied: 101.67% (1.67% Vig Fee)</div>
              </div>
              <p className="text-xs text-slate-400">
                In football 3-way markets, the overround frequently hits 106% - 110%. Our predictor MUST strip this fee to uncover the true underlying distribution.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Our Prediction Strategy</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                By ingesting multi-bookmaker odds (DraftKings, FanDuel, BetMGM, Betfair), we aggregate a global consensus market signal:
              </p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>Wisdom of the Crowds:</strong> Consensus odds reflect billions of dollars in public and sharp betting info.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>Vig Removal:</strong> Normalize probabilities: P_true = P_raw / Sum(P_raw).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span><strong>+EV Arbitrage:</strong> Detect when an individual bookmaker's price deviates from our fair true model!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      tag: '03 / 07 • The Odds API Integration',
      title: 'Real-Time Odds API Pipeline',
      subtitle: 'Designing a Resilient Ingestion Worker with Quota Awareness',
      badge: 'The Odds API v4 Architecture',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-mono">1. /sports</span>
              <div className="font-bold text-white">Active Leagues (0 credits)</div>
              <div className="text-slate-400">Cached for 1 hour; returns in-season sport keys.</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-mono">2. /odds (upcoming)</span>
              <div className="font-bold text-white">Upcoming &amp; Live Matches</div>
              <div className="text-slate-400">1 credit per region/market; cached for 5 mins.</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-mono">3. Headers Telemetry</span>
              <div className="font-bold text-emerald-400">x-requests-remaining</div>
              <div className="text-slate-400">Dynamic circuit breaker stops calls when quota &lt; 10.</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-2 font-mono flex items-center justify-between">
              <span>C# Ingestion Client Pattern (The Odds API v4)</span>
              <span className="text-cyan-400">.NET 10 / C# 13</span>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-4 rounded-xl overflow-x-auto border border-slate-800/80 leading-relaxed">
{`public class OddsApiClient(HttpClient client, IMemoryCache cache, ILogger<OddsApiClient> logger) 
{
    public async Task<List<OddsEvent>> GetUpcomingOddsAsync(string sport = "upcoming") 
    {
        return await cache.GetOrCreateAsync($"odds_{sport}", async entry => {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var response = await client.GetAsync($"/v4/sports/{sport}/odds/?regions=uk,us&markets=h2h&apiKey={_apiKey}");
            response.EnsureSuccessStatusCode();

            // Track Quota Telemetry from Response Headers
            if (response.Headers.TryGetValues("x-requests-remaining", out var vals))
                logger.LogInformation("Quota Remaining: {Remaining}", vals.FirstOrDefault());

            return await response.Content.ReadFromJsonAsync<List<OddsEvent>>() ?? [];
        });
    }
}`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      tag: '04 / 07 • Mathematical Modeling',
      title: 'Stripping Vigorish & The Poisson Distribution',
      subtitle: 'Formulas and Algorithms Used Under the Hood',
      badge: 'Probability Engineering',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">1. Vig Normalization</h4>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-white">
                P_true(i) = (1 / Odds_i) / Σ (1 / Odds_j)
              </div>
              <p className="text-xs text-slate-400">
                By dividing each outcome's raw implied probability by the total overround sum, the bookmaker margin is eliminated, yielding an unbiased fair probability distribution that sums to exactly 1.0 (100%).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Poisson Goal Expectancy</h4>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-white">
                P(k; λ) = (λ^k · e^-λ) / k!
              </div>
              <p className="text-xs text-slate-400">
                Where λ represents the team's expected goals/scoring rate. We simulate joint probabilities for all score combinations (e.g., 2-1, 1-0, 0-0) to model exact scorelines and totals.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">3. Expected Value (+EV) Equation</span>
              <span className="text-emerald-400 font-mono font-semibold">Edge Detector</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
              EV% = [ P_true · (Decimal_Odds) - 1 ] × 100
            </div>
            <p className="text-xs text-slate-400">
              Whenever EV% &gt; 0, the bookmaker is offering odds higher than the statistical likelihood of the outcome occurring. This forms the foundation of positive expected value sports trading.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      tag: '05 / 07 • Monte Carlo Engine',
      title: '10,000 Match Monte Carlo Simulation',
      subtitle: 'Simulating Variance, Outliers, and Confidence Intervals',
      badge: 'High-Throughput Simulation in C#',
      content: (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-2 font-mono flex items-center justify-between">
              <span>Parallel Monte Carlo Simulation Loop in C#</span>
              <span className="text-cyan-400">Parallel.For / SIMD</span>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-4 rounded-xl overflow-x-auto border border-slate-800/80 leading-relaxed">
{`public MonteCarloResult RunSimulation(double homeProb, double awayProb, int iterations = 10000)
{
    int homeWins = 0, awayWins = 0, draws = 0;
    
    // High performance multi-threaded simulation
    Parallel.For(0, iterations, () => (h: 0, a: 0, d: 0), (i, state, local) => 
    {
        var roll = Random.Shared.NextDouble();
        if (roll < homeProb) local.h++;
        else if (roll < homeProb + awayProb) local.a++;
        else local.d++;
        return local;
    },
    local => {
        Interlocked.Add(ref homeWins, local.h);
        Interlocked.Add(ref awayWins, local.a);
        Interlocked.Add(ref draws, local.d);
    });

    return new MonteCarloResult(iterations, homeWins, awayWins, draws);
}`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">High Speed</span>
              <span>10,000 simulations complete in under 5 milliseconds on modern .NET runtimes.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Variance Modeling</span>
              <span>Captures long-tail upsets, blowout risks, and draw frequencies.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Kelly Stake Sizing</span>
              <span>Calculates optimal capital allocation based on model confidence.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      tag: '06 / 07 • .NET 10 System Architecture',
      title: 'Full System Architecture',
      subtitle: 'Clean Architecture with Worker Services, Minimal APIs & Resilient Pipelines',
      badge: '.NET Conf Community Edition SA',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">End-to-End Prediction Architecture</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <Database className="w-5 h-5 text-cyan-400 mx-auto" />
                <div className="font-bold text-white">The Odds API</div>
                <div className="text-[10px] text-slate-400">Live JSON Feed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <Cpu className="w-5 h-5 text-blue-400 mx-auto" />
                <div className="font-bold text-white">.NET Worker Service</div>
                <div className="text-[10px] text-slate-400">Polly + MemoryCache</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <Layers className="w-5 h-5 text-emerald-400 mx-auto" />
                <div className="font-bold text-white">Prediction Engine</div>
                <div className="text-[10px] text-slate-400">Monte Carlo + Vig Removal</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <Terminal className="w-5 h-5 text-purple-400 mx-auto" />
                <div className="font-bold text-white">Minimal API &amp; UI</div>
                <div className="text-[10px] text-slate-400">Live Dashboard &amp; Stream</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-white block">Key Takeaways for Attendees in Durban:</span>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Treating live market odds as structured signals rather than simple betting numbers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Building resilient, quota-efficient background ingestion services with C# and Polly.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Applying Monte Carlo and Poisson modeling directly within scalable .NET Microservices.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      tag: '07 / 07 • Live Demo & Conclusion',
      title: 'Live Stage Demo & Audience Q&A',
      subtitle: 'Testing Live Fixtures Across Football, Cricket, and Rugby in Durban',
      badge: 'November 21, 2026 • Park Square, Umhlanga',
      content: (
        <div className="space-y-5 text-center py-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/25">
            <Presentation className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Ready for Data &amp; AI Community Day Durban!
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Switch back to the <strong className="text-cyan-400">Live Odds &amp; Predictions</strong> tab to run live calculations against current active bookmaker markets!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Session Details Confirmed</span>
            </div>
            <div className="text-slate-400">
              <div>• Date: Saturday, November 21, 2026</div>
              <div>• Time: 08:00 AM registration (50-minute slot)</div>
              <div>• Venue: Richfield College Umhlanga Campus, Park Square, Umhlanga, Durban</div>
              <div>• Elevator: Block C to the first floor</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Slide Navigation Bar */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-emerald-400">{slide.tag}</div>
            <div className="text-xs text-slate-400">Conference Presentation Deck (50-min slot)</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 transition-colors font-semibold"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              {slide.badge}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">{slide.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{slide.subtitle}</p>
          </div>
        </div>

        {/* Slide Body */}
        <div>{slide.content}</div>
      </div>

      {/* Slide Thumbnails / Quick Jump */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
              currentSlide === idx
                ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            0{idx + 1}. {s.title.split(':')[0].substring(0, 18)}...
          </button>
        ))}
      </div>
    </div>
  );
};
