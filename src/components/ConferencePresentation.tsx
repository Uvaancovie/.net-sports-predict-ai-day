import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  Clock,
  CheckCircle2,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Database,
  Play,
  Pause,
  RotateCcw,
  StickyNote,
  History,
  MapPin,
  Calendar,
} from 'lucide-react';

const SESSION_SECONDS = 50 * 60;

const phases = [
  { id: 'intro', label: 'Intro', start: 0, end: 300 },
  { id: 'data', label: 'Data', start: 300, end: 720 },
  { id: 'math', label: 'Math', start: 720, end: 1320 },
  { id: 'architecture', label: 'Architecture', start: 1320, end: 1920 },
  { id: 'demo', label: 'Demo', start: 1920, end: 2700 },
  { id: 'qa', label: 'Q&A', start: 2700, end: SESSION_SECONDS },
];

const formatClock = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const rangeFor = (phaseId: string) => {
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return '00:00 – 05:00';
  return `${formatClock(phase.start)} – ${formatClock(phase.end)}`;
};

export const ConferencePresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const elapsed = SESSION_SECONDS - remaining;
  const activePhase = phases.find(p => elapsed >= p.start && elapsed < p.end) ?? phases[phases.length - 1];
  const minutesLeft = remaining / 60;

  const slides = useMemo(
    () => [
      {
        id: 1,
        phaseId: 'intro',
        tag: '01 / 07 · Welcome',
        title: 'Developing A .NET Sports Predictor',
        subtitle: 'From live odds ingestion to Monte Carlo match probabilities in C#',
        badge: 'Data & AI Community Day Durban: Encore · .NET Conf SA',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="inner-well p-4 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Speaker</span>
                <div className="text-sm font-bold text-slate-900">Uvaan Govender</div>
                <div className="text-slate-500">Software engineer &amp; .NET enthusiast</div>
              </div>
              <div className="inner-well p-4 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Venue &amp; date</span>
                <div className="text-sm font-bold text-slate-900">Park Square, Umhlanga</div>
                <div className="text-slate-500">Richfield College · Nov 21, 2026</div>
              </div>
              <div className="inner-well p-4 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Session slot</span>
                <div className="text-sm font-bold text-emerald-600">50 minutes</div>
                <div className="text-slate-500">Architecture + math + live demo</div>
              </div>
            </div>

            <div className="inner-well p-6 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Session roadmap</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                {[
                  ['The problem space', 'Bookmaker odds are consensus signals, not true probabilities.'],
                  ['The Odds API v4', 'Resilient HTTP pipelines, rate limits, market schemas.'],
                  ['Mathematics', 'Vig stripping, Poisson scorelines, 10,000-run Monte Carlo.'],
                  ['C# & .NET 10', 'Minimal APIs, caching tiers, quota-aware resilience.'],
                ].map(([title, body], idx) => (
                  <div key={title} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-white/80">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-slate-900 block">{title}</strong>
                      <span>{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
        notes: [
          'Open with the session promise: by the end, the audience will see live odds turned into a probability model and a staking recommendation.',
          'Introduce yourself briefly, then point out that the dashboard is already running live behind this deck.',
          'Set expectations: 50 minutes, one live demo, questions at the end.',
          'Call out the QR/links on the closing slide for the repo and slides.',
        ],
      },
      {
        id: 2,
        phaseId: 'data',
        tag: '02 / 07 · Data source',
        title: 'Real-time odds from The Odds API v4',
        subtitle: '40+ bookmakers, three market types, one quota budget',
        badge: 'The Odds API v4',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                ['/sports', 'Active leagues · 0 credits', 'Cached for an hour. Returns the in-season sport keys.'],
                ['/odds', 'Fixtures + markets · 1–2 credits', 'One credit per region/market. Cache aggressively.'],
                ['Headers', 'x-requests-remaining', 'Quota telemetry drives the circuit breaker.'],
              ].map(([label, title, body]) => (
                <div key={label} className="inner-well p-4 rounded-xl space-y-1">
                  <span className="text-slate-400 metric">{label}</span>
                  <div className="font-bold text-slate-900">{title}</div>
                  <div className="text-slate-500">{body}</div>
                </div>
              ))}
            </div>

            <div className="inner-well p-4 rounded-2xl">
              <div className="text-[11px] text-slate-500 mb-2 metric flex items-center justify-between">
                <span>Quota-aware ingestion client</span>
                <span className="text-cyan-700">.NET 10 / C# 13</span>
              </div>
              <pre className="text-[11px] metric text-slate-100 bg-slate-900/95 p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
{`public class OddsApiClient(HttpClient client, IMemoryCache cache)
{
    public async Task<List<OddsEvent>> GetUpcomingAsync(string sport = "upcoming")
    {
        return await cache.GetOrCreateAsync($"odds_{sport}", async entry => {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var response = await client.GetAsync($"/v4/sports/{sport}/odds/");
            response.EnsureSuccessStatusCode();
            TrackQuota(response.Headers); // x-requests-remaining
            return await response.Content.ReadFromJsonAsync<List<OddsEvent>>() ?? [];
        });
    }
}`}
              </pre>
            </div>
          </div>
        ),
        notes: [
          'Explain the credit model: sports list is free, event odds cost credits per region and market.',
          'Stress that a demo which refreshes on every keystroke can burn a free tier in minutes.',
          'Show how response headers feed the quota dashboard on screen.',
          'Bridge to the caching tier: memory, disk, demo fallback, live call.',
        ],
      },
      {
        id: 3,
        phaseId: 'data',
        tag: '03 / 07 · The problem',
        title: 'Bookmaker odds vs true probability',
        subtitle: 'Understanding the overround and why vig stripping matters',
        badge: 'Data science & market dynamics',
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="inner-well p-5 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">The overround</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bookmakers broker liquidity with a built-in margin. Decimal odds imply probabilities that sum to
                more than 100%.
              </p>
              <div className="bg-white/70 p-3 rounded-xl metric text-xs text-slate-600 space-y-1 border border-white/80">
                <div>Team A 1.85 → 54.05%</div>
                <div>Team B 2.10 → 47.62%</div>
                <div className="text-rose-600 pt-1 font-bold">Total 101.67% (1.67% vig)</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Three-way football markets often reach 106–110%. The predictor must remove that fee.
              </p>
            </div>

            <div className="inner-well p-5 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Our approach</span>
              <ul className="text-xs text-slate-600 space-y-2">
                {[
                  ['Wisdom of crowds', 'Consensus odds reflect billions in public and sharp information.'],
                  ['Vig removal', 'Normalise: P_true = P_raw / Σ P_raw.'],
                  ['+EV detection', 'Compare each bookmaker price against the fair model.'],
                  ['Head-to-head form', 'Recent results and direct history nudge the model.'],
                ].map(([title, body]) => (
                  <li key={title} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                    <span><strong>{title}:</strong> {body}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
        notes: [
          'Walk through the 1.85 / 2.10 example slowly; the math lands well with a live audience.',
          'Ask the room: why would a bookmaker ever price a market at exactly 100%?',
          'Explain that form weighting is deliberately small so market consensus still dominates.',
          'Time check: aim to be on the math slide by the 12-minute mark.',
        ],
      },
      {
        id: 4,
        phaseId: 'math',
        tag: '04 / 07 · Mathematics',
        title: 'Stripping vigorish & the Poisson distribution',
        subtitle: 'The formulas that turn prices into probabilities',
        badge: 'Probability engineering',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="inner-well p-5 rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">1 · Vig normalisation</h4>
                <div className="bg-white/70 p-3 rounded-xl border border-white/80 metric text-xs text-slate-900">
                  P_true(i) = (1 / Odds_i) / Σ (1 / Odds_j)
                </div>
                <p className="text-xs text-slate-500">
                  Dividing by the overround removes the bookmaker margin and yields a distribution summing to 1.0.
                </p>
              </div>

              <div className="inner-well p-5 rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">2 · Poisson goal expectancy</h4>
                <div className="bg-white/70 p-3 rounded-xl border border-white/80 metric text-xs text-slate-900">
                  P(k; λ) = (λ^k · e^-λ) / k!
                </div>
                <p className="text-xs text-slate-500">
                  λ is the expected scoring rate. Joint sampling produces exact scorelines such as 2–1, 1–0, 0–0.
                </p>
              </div>
            </div>

            <div className="inner-well p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">3 · Expected value</span>
                <span className="text-emerald-600 metric font-semibold">Edge detector</span>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-white/80 metric text-xs text-emerald-700">
                EV% = [ P_true · DecimalOdds − 1 ] × 100
              </div>
              <p className="text-xs text-slate-500">
                Positive EV means the bookmaker offers more than the statistical likelihood. Quarter-Kelly sizing
                converts the edge into a stake.
              </p>
            </div>
          </div>
        ),
        notes: [
          'Keep the formulas on screen but explain them verbally; no one needs to copy them.',
          'Demonstrate that the three true probabilities add to 100% in the live dashboard.',
          'Emphasise that the model is only as good as the market consensus it ingests.',
          'Flag the responsible-gambling disclaimer: positive EV does not remove variance.',
        ],
      },
      {
        id: 5,
        phaseId: 'math',
        tag: '05 / 07 · Simulation',
        title: '10,000-match Monte Carlo simulation',
        subtitle: 'Variance, outliers and confidence intervals in milliseconds',
        badge: 'High-throughput simulation in C#',
        content: (
          <div className="space-y-4">
            <div className="inner-well p-4 rounded-2xl">
              <div className="text-[11px] text-slate-500 mb-2 metric flex items-center justify-between">
                <span>Vector-friendly simulation loop</span>
                <span className="text-cyan-700">Parallel.For / SIMD</span>
              </div>
              <pre className="text-[11px] metric text-slate-100 bg-slate-900/95 p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
{`public MonteCarloResult Run(double homeProb, double awayProb, int iterations = 10_000)
{
    int home = 0, away = 0, draw = 0;
    Parallel.For(0, iterations, _ =>
    {
        var roll = Random.Shared.NextDouble();
        if (roll < homeProb) Interlocked.Increment(ref home);
        else if (roll < homeProb + awayProb) Interlocked.Increment(ref away);
        else Interlocked.Increment(ref draw);
    });
    return new(iterations, home, away, draw);
}`}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              {[
                ['Speed', '10,000 runs complete in under five milliseconds on modern .NET.'],
                ['Variance', 'Captures long-tail upsets, blowout risks and draw frequency.'],
                ['Sizing', 'Kelly Criterion translates confidence into a capital allocation.'],
              ].map(([title, body]) => (
                <div key={title} className="inner-well p-3 rounded-xl">
                  <span className="text-cyan-700 font-bold block mb-1">{title}</span>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </div>
        ),
        notes: [
          'Point out that the live modal shows the top five scorelines from the simulation.',
          'Explain the difference between expected goals and simulated scorelines.',
          'Mention head-to-head form and home advantage as the two small adjustments on top of market pricing.',
          'If time is tight, skip the code block and jump straight to the demo.',
        ],
      },
      {
        id: 6,
        phaseId: 'architecture',
        tag: '06 / 07 · Architecture',
        title: '.NET 10 system architecture',
        subtitle: 'Minimal APIs, caching tiers, resilient ingestion',
        badge: '.NET Conf Community Edition SA',
        content: (
          <div className="space-y-4">
            <div className="inner-well p-5 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">End-to-end prediction pipeline</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { icon: Database, tone: 'text-cyan-700', title: 'The Odds API', body: 'Live JSON feed' },
                  { icon: Cpu, tone: 'text-sky-600', title: '.NET API', body: 'Cache + breaker' },
                  { icon: Layers, tone: 'text-emerald-600', title: 'Prediction engine', body: 'Vig strip + Monte Carlo' },
                  { icon: Terminal, tone: 'text-slate-700', title: 'React UI', body: 'H2H + live dashboard' },
                ].map(({ icon: Icon, tone, title, body }) => (
                  <div key={title} className="p-3 rounded-xl bg-white/70 border border-white/80 text-center space-y-1">
                    <Icon className={`w-5 h-5 mx-auto ${tone}`} />
                    <div className="font-bold text-slate-900">{title}</div>
                    <div className="text-[10px] text-slate-500">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                ['Tiered cache', 'Memory → disk → demo data → live. A restart never re-burns credits.'],
                ['Circuit breaker', 'Quota floor plus 429 backoff disables live calls automatically.'],
                ['Deterministic H2H', 'A seeded generator produces identical form records on every reload.'],
              ].map(([title, body]) => (
                <div key={title} className="inner-well p-4 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">{title}</span>
                  <span className="text-slate-500">{body}</span>
                </div>
              ))}
            </div>

            <div className="inner-well p-4 rounded-2xl text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-900 block">Key takeaways for Durban attendees</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>Treat market odds as structured signals, not simple betting numbers.</li>
                <li>Build quota-aware ingestion with caching and graceful degradation.</li>
                <li>Apply Monte Carlo and Poisson modelling directly inside .NET services.</li>
              </ul>
            </div>
          </div>
        ),
        notes: [
          'This is the architecture slide: slow down and trace one request end to end.',
          'Highlight the credit-saver tiering as the practical lesson for anyone using a free API.',
          'Mention the deterministic H2H generator keeps the demo reliable on stage Wi-Fi.',
          'Transition: "Let us run this live on current fixtures."',
        ],
      },
      {
        id: 7,
        phaseId: 'qa',
        tag: '07 / 07 · Demo & Q&A',
        title: 'Live stage demo & audience Q&A',
        subtitle: 'Testing live fixtures across football, cricket and rugby',
        badge: 'November 21, 2026 · Park Square, Umhlanga',
        content: (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/25 ring-1 ring-white/60">
              <Presentation className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Ready for Data &amp; AI Community Day Durban
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Switch to <strong className="text-cyan-700">Live H2H</strong> to run predictions on current
                bookmaker markets.
              </p>
            </div>

            <div className="inner-well p-4 rounded-2xl max-w-md mx-auto text-xs text-left space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Session details</span>
              </div>
              <div className="text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Saturday, November 21, 2026</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 50-minute slot after 08:00 registration</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Richfield College Umhlanga, Park Square</div>
                <div className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Repo and slides shared during Q&amp;A</div>
              </div>
            </div>
          </div>
        ),
        notes: [
          'Open the Live H2H tab and click the first fixture while the room settles.',
          'Walk through the form ribbon, H2H timeline, then the Monte Carlo and +EV panels.',
          'Ask for a team or odds from the audience and run a custom simulation live.',
          'Leave 5 full minutes for questions; point to the repo link on screen.',
        ],
      },
    ],
    []
  );

  const slide = slides[currentSlide];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] metric font-semibold text-emerald-700">{slide.tag}</div>
              <div className="text-[11px] text-slate-500">Presenter console · 50-minute Durban session</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotesOpen(open => !open)}
              className={`px-3 py-2 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                notesOpen
                  ? 'bg-emerald-500/10 border-emerald-200/80 text-emerald-700'
                  : 'bg-white/70 border-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speaker notes</span>
            </button>
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl bg-white/70 border border-white/80 hover:bg-white text-slate-600 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/70">
          <div className="flex items-baseline gap-3">
            <div className="metric text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatClock(remaining)}
            </div>
            <div className="text-[11px] text-slate-500">
              <div className="metric">elapsed {formatClock(elapsed)}</div>
              <div>{minutesLeft > 10 ? 'on pace' : minutesLeft > 3 ? 'wrap up' : 'closing'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {phases.map(phase => {
              const active = activePhase.id === phase.id;
              const done = elapsed >= phase.end;
              return (
                <span
                  key={phase.id}
                  className={`text-[10px] px-2 py-1 rounded-lg border whitespace-nowrap ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-700 border-cyan-200/80 font-semibold'
                      : done
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-100'
                      : 'bg-white/60 text-slate-400 border-white/70'
                  }`}
                >
                  {phase.label}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(run => !run)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                running
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running ? 'Pause' : remaining === SESSION_SECONDS ? 'Start timer' : 'Resume'}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setRemaining(SESSION_SECONDS);
              }}
              className="p-2 rounded-xl bg-white/70 border border-white/80 hover:bg-white text-slate-600 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(elapsed / SESSION_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      {notesOpen && (
        <div className="glass-panel rounded-3xl p-5 space-y-2 border-l-2 border-l-emerald-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Stage notes · {slide.title}
            </h4>
            <span className="text-[10px] metric text-slate-400">target {rangeFor(slide.phaseId)}</span>
          </div>
          <ul className="space-y-1.5">
            {slide.notes.map((note, idx) => (
              <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass-modal rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/70 pb-4 space-y-1.5">
          <span className="text-[10px] metric uppercase text-emerald-700 font-semibold">{slide.badge}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{slide.title}</h2>
          <p className="text-[11px] text-slate-500">{slide.subtitle}</p>
        </div>

        <div>{slide.content}</div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`px-3 py-1.5 rounded-xl text-[11px] metric transition-all whitespace-nowrap border ${
              currentSlide === idx
                ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-md shadow-cyan-600/20'
                : 'bg-white/70 border-white/80 text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {String(idx + 1).padStart(2, '0')} · {s.title.split(':')[0].slice(0, 20)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
        <Sparkles className="w-3 h-3" />
        <span>Presenter console is local-only; the timer is not persisted between reloads.</span>
      </div>
    </div>
  );
};
