# .NET Sports Predictor — White Glassmorphic UI, Head-to-Head Form Analytics & Durban Presenter Mode

Transform the .NET Sports Predictor platform into a clean, luminous white glassmorphic interface with frosted acrylic surfaces, integrated Head-to-Head (H2H) historical matchup trends & team form analytics, and an interactive 50-minute conference presenter console with timer controls and speaker cue cards for Data & AI Community Day Durban.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed based on your design and feature choices:
> - **Visual Direction**: Clean white frosted glass design with subtle hairline borders, soft layered shadows (`backdrop-blur-xl bg-white/70`), crisp dark slate typography, and emerald/cyan focal accents.
> - **Functional Feature Priority**: Head-to-Head (H2H) historical matchup trends, 5-game recent form guides (W/D/L badges), and historical goal/point differentials embedded into match cards and modal views.
> - **Conference Mode Enhancement**: Interactive Presenter Mode featuring a live 50-minute countdown timer with pause/reset, phase markers (Intro, Data, Math, .NET Architecture, Demo, Q&A), and expandable speaker notes tailored for your Durban talk.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a modern, high-precision sports prediction and market analytics platform that ingests live bookmaker lines via The Odds API v4, strips betting house vigorish to determine true underlying probabilities, simulates outcomes across 10,000+ Monte Carlo runs, and displays comprehensive head-to-head historical form records. It also provides an interactive 50-minute live presentation mode for conference speakers.
- **Target Audience / Persona**: 
  1. *Uvaan Govender (Speaker)* presenting "Developing A .NET Sports Predictor" on November 21, 2026 at Data & AI Community Day Durban / .NET Conf SA (Richfield College Umhlanga).
  2. *Software Engineers, Data Scientists, and .NET Developers* exploring sports modeling, Monte Carlo simulation in C#, and resilient external API pipelines.
- **Key Value**: Replaces the dark terminal aesthetic with a bright, professional white glassmorphic design system; equips match predictions with empirical head-to-head historical form evidence; and empowers the speaker with a stage-ready 50-minute presentation interface.

---

### 2. User Experience & Visual Design

#### Visual Identity & White Glassmorphic Theme Tokens
- **Canvas**: Clean neutral canvas with soft gradient ambient radial wash (`#F8FAFC` to `#F1F5F9`) with faint crystalline cyan/blue backlight glows.
- **Glassmorphic Surfaces**:
  - Primary Cards: `bg-white/75 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
  - Active Elements & Hover: `bg-white/95 border-cyan-200/80 shadow-[0_12px_36px_rgb(14,165,233,0.08)]`
  - Inner Contrast Well: `bg-slate-50/80 border border-slate-200/60`
  - Elevated Popups / Modals: `bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_24px_50px_rgba(15,23,42,0.12)]`
- **Typography & Scale**:
  - Display / Headings: `Plus Jakarta Sans` / `Outfit` (Bold, clean, human geometry)
  - Body & Labels: `Plus Jakarta Sans` / `DM Sans` (13px–15px, dark slate `#0F172A` text, `#475569` secondary text)
  - Metrics & Odds: `font-mono tabular-nums font-semibold` (`#0284C7` cyan, `#16A34A` emerald, `#E11D48` rose)
- **Zero-Pill Discipline**: Metadata displayed as unboxed typographic strings separated by clean interpuncts (`Arsenal vs Chelsea · Premier League · 18:30 SAST`).

#### Key User Flows & Views
1. **Live Odds & H2H Feed (`/`)**:
   - Top Bar: Event identity, live Odds API quota tracker (remaining / used), and segmented view switcher.
   - Sport Filter Rail: Glass pill buttons for Football (EPL), Cricket Tests, NBA, Rugby, and NFL.
   - Match Cards: White glass containers displaying team crests/badges, commence countdown, consensus moneyline odds, and a new **5-Match Form Ribbon** (`W-W-D-L-W`) with Head-to-Head win ratios.
2. **Deep Match Prediction & H2H Modal**:
   - Visual consensus probability bar (True Home % vs Draw % vs Away %).
   - **Head-to-Head Historical Matrix**: Last 5 direct encounters between the teams with dates, scores, and home/away splits.
   - Monte Carlo simulation run (10,000 iterations) with Poisson scoreline probability distribution.
   - +EV Value Bet alerts identifying bookmaker pricing discrepancies with Kelly Criterion stake percentages.
3. **Presenter Mode (50-Minute Durban Session)**:
   - Floating header with elapsed & remaining time indicators (`50:00` countdown timer with start/pause/reset).
   - Slide selector with 7 curated conference topics.
   - Slide canvas with diagrams, formula explanations, and C# code snippets.
   - **Speaker Notes Drawer**: Stage prompts, talking points, audience engagement cues, and time checkpoints.
4. **Interactive Match Playground & Simulator**:
   - Clean white glass sliders to tweak home advantage (+0% to +15%), team attack/defense ratings, and Monte Carlo iterations.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: White Glassmorphism vs. Dark Mode Switch**:
  - *Chosen Approach*: Implement a primary white, light frosted glassmorphic design system as the default interface aesthetic while keeping CSS clean and modular.
  - *Why*: High-contrast light backgrounds project with significantly higher clarity on stage projectors in conference lecture halls (such as Richfield College Umhlanga) compared to low-contrast dark themes.
- **Decision 2: Head-to-Head (H2H) Data Strategy**:
  - *Chosen Approach*: Pair live The Odds API event data with an in-memory historical match records and form analytics store covering major team matchups (EPL, Rugby, Cricket, NBA), backed by algorithmic form-weight adjustment in the prediction engine.
  - *Why*: The Odds API v4 live endpoint provides upcoming odds and active scores; enriching this with recent form and H2H statistics provides meaningful context without consuming excess API quota.
- **Decision 3: Speaker Mode Timer & Notes Integration**:
  - *Chosen Approach*: Build a full presenter control bar into the conference tab with interactive countdown timer, slide-linked speaker notes, and key takeaways for Durban attendees.
  - *Why*: The session was strictly revised from 60 minutes down to 50 minutes as noted in the Sessionize confirmation; a built-in timer helps Uvaan pace his live presentation precisely.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite React SPA Frontend                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Live Odds & H2H  │  │ Prediction Modal │  │ 50-Min Presenter Deck│  │
│  │ Glass Cards      │  │ Monte Carlo View │  │ Timer + Notes Drawer │  │
│  └─────────┬────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
│            │                    │                       │              │
│            └────────────────────┼───────────────────────┘              │
│                                 ▼                                      │
│                      src/services/api.ts Client                        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ JSON HTTP (/api/*)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend (Node.js)                       │
│  ┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ /api/odds/*          │  │ /api/predict/*  │  │ /api/conference/* │  │
│  │ Proxy + 5m TTL Cache │  │ Monte Carlo + EV│  │ Slides & Notes API│  │
│  └──────────┬───────────┘  └────────┬────────┘  └───────────────────┘  │
│             │                       │                                  │
│             ▼                       ▼                                  │
│  ┌──────────────────────┐  ┌─────────────────┐                         │
│  │ The Odds API v4      │  │ H2H Form Engine │                         │
│  │ (api.the-odds-api)   │  │ Poisson & Elo   │                         │
│  └──────────────────────┘  └─────────────────┘                         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Component & State Structure
- `src/index.css`: White glassmorphic utility classes (`.glass-panel`, `.glass-card`, `.glass-modal`, backdrop filters, and custom scrollbars).
- `src/types/odds.ts`: Extended with `HeadToHeadRecord` (`previousMatches`, `homeForm`, `awayForm`, `h2hSummary`).
- `src/components/Header.tsx`: White frosted top navigation bar with 50-minute session badge and live quota counter.
- `src/components/LiveOddsExplorer.tsx`: White glass cards with team form badges (`W/D/L`) and direct odds comparison.
- `src/components/PredictionModal.tsx`: Comprehensive prediction view with H2H encounter timeline, +EV alerts, and 10,000-run Monte Carlo distribution.
- `src/components/ConferencePresentation.tsx`: Presenter deck with interactive 50-minute stopwatch timer, slide checkpoints, and expandable speaker notes.
- `server.ts`: Enriched prediction endpoint calculating form-weighted probabilities and delivering H2H statistics.

---

### Verification & Testing Plan
1. **Visual Verification**: Verify clean white glassmorphic styling, translucent card layering, shadow depth, and contrast legibility.
2. **Form & H2H Verification**: Test clicking fixtures to inspect head-to-head statistics and verify that form factors correctly influence simulated probabilities.
3. **Presenter Mode Testing**: Verify that the 50-minute countdown timer starts, pauses, resets, and navigates through all 7 slides with speaker notes.
4. **Build & Lint Verification**: Run `compile_applet` and `lint_applet` to confirm clean compilation.
