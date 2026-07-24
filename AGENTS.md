# PSAU Scholarship - Agent Instructions

## Project Overview
Public read-only dashboard displaying weighted GPA summaries for PSAU scholarship admissions (Class of 2026). **Data sourced live from Google Sheets** — no local fallback, no admin portal, no auth.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS variables for theming) + **Bold Design System**
- `googleapis` for Sheets API, `lucide-react` icons, `recharts` (unused but installed)

## Commands
```bash
npm run dev      # dev server with webpack (not turbopack)
npm run build    # production build
npm run start    # production server
npm run lint     # eslint (next/core-web-vitals + typescript config)
```

## Architecture
- **Server Component** (`src/app/page.tsx`): Renders `<DashboardTabs />` — no `use client`
- **Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): All state, effects, interactivity
- **Tab Views** (`src/components/dashboard/views/`): 
  - `MajorsNationalitiesTab` — Campus → Major → Nationality → Gender
  - `NationalitiesMajorsTab` — Nationality → Campus → Major → Gender (3-level)
  - `NationalitiesTab` — Nationality → Gender (aggregated min/مقياس النزعة/max)
  - `MajorsTab` — Campus → Major → Gender (aggregated, no nationality)
- **UI Primitives** (`src/components/ui/`): SearchableSelect, SortToggle, GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState
- **Hooks** (`src/hooks/useAdmissions.ts`): SWR-like data fetching + timeAgo computation
- **Types** (`src/types/index.ts`): AdmissionRecord, AggregatedRecord, TABS (4 tabs), SortDir, utilities
- **API route** (`src/app/api/admissions/route.ts`):
  - Reads Google Sheets `Summery!A:G` with 5s timeout
  - **Server-side polling**: `setInterval` every 5 minutes updates in-memory cache
  - `GET` always returns cached data instantly (or cold-fetches once on first request)
  - SWR headers: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
  - **No local JSON fallback** — returns 500 if cold start + Sheets unavailable
  - No auth, no write endpoints, no query params to force refresh

## Tabs (4)
| Tab ID | Label | Grouping |
|--------|-------|----------|
| `majors-nationalities` | التخصصات ← الجنسيات | Campus → Major → Nationality → Gender |
| `nationalities-majors` | الجنسيات ← التخصصات | Nationality → Campus → Major → Gender |
| `nationalities` | الجنسيات | Nationality → Gender (aggregated) |
| `majors` | التخصصات | Campus → Major → Gender (aggregated) |

**Gender is always a grouping level** (not just a filter) — "2 separate universities under the same name".

## Critical Conventions
- **RTL Arabic throughout** — `dir="rtl"`, **IBM Plex Sans Arabic** font, all text Arabic
- **Arrows in labels**: use `←` not `→` for logical flow in RTL (see `types/index.ts:31-32`)
- **Marquee animation**: moves rightward for RTL (`translateX(-50%) → 0` in `globals.css:717-718`)
- **Bold Design System** — **Archivo Black** for headings/numbers, **JetBrains Mono** for mono; spacing 4/8/12/16/24/32; radius 4/8/12px; palette: Primary `#0077BC`, Secondary `#009866`, Surface `#111111`/white
- **CSS variables in `globals.css`** — Bold tokens + semantic light/dark mode
- **Modular components** — Components split by concern; barrel exports in `src/components/ui/index.ts`
- **Privacy-first** — API returns only aggregated data (min/avg/max per group); raw scores never exposed
- **Score column order** — Min | مقياس النزعة | Max (formerly: Max | Min | Avg)
- **Avg label** — "المتوسط" renamed to **"مقياس النزعة"**
- **No test framework** — Manual testing only via `npm run dev`

## Environment Variables (`.env.local` - gitignored)
```
GOOGLE_CLIENT_EMAIL=          # Service account email
GOOGLE_PRIVATE_KEY=           # PKCS#8 private key with \n newlines
SPREADSHEET_ID=               # Google Sheet ID (tab must be named "Summery")
```
**Removed:** `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SECRET`

## Google Sheets Setup
- Sheet tab name: **Summery** (typo — code reads `Summery!A:G`)
- Columns A-G: campus, major, nationality, gender, max, avg, min
- Service account needs Editor access

## Build & Deploy Notes
- Vercel recommended; add all env vars in project settings
- Build output: static `/`, dynamic `/api/admissions`
- Revalidate: `/api/admissions` = 300s (ISR via `export const revalidate = 300`)
- **Lint**: `npm run lint` shows pre-existing warnings (setState in effects, Date.now in render, unused imports) — not blocking
- **Build passes** with webpack (`npm run dev`) — turbopack not used
- **Order**: `lint` → `build` for verification

## FilterBar Context-Aware Filters
| Active Tab | Visible Filters |
|------------|-----------------|
| `majors-nationalities` | Campus, Major, Nationality, Gender, Sort |
| `nationalities-majors` | Nationality, Campus, Major, Gender, Sort |
| `nationalities` | Nationality, Gender, Sort |
| `majors` | Campus, Major, Gender, Sort |

## Fonts (layout.tsx)
- `Archivo Black` — display/headings/numbers
- `IBM Plex Sans Arabic` — Arabic body text
- `JetBrains Mono` — monospace

## Recent Fixes (This Session)
- **Column header order** fixed in all 4 tab views to match ScoreCells output: Min | Avg | Max
- **Gender badge runtime error** fixed in `FilterBar.tsx` — `getBadgeStyle` now returns style objects, not class strings
- **Tab labels** now use Arabic font (`font-arabic` class) for consistency
- **Tab arrows** mirrored for RTL: `→` changed to `←` in `types/index.ts`
- **Search icon overlap** fixed — increased input padding in `FilterBar.tsx` (`pr-14`, clear button `left-4`)
- **Footer contrast** improved — switched from `--bg-header` to `--color-surface` with proper text colors
- **Marquee bar** — animation now moves rightward for RTL, 30s duration, seamless loop via content duplication
- **Score column widths** — fixed 80px for Min/Avg/Max columns in `globals.css`

## Known Pre-existing Lint Warnings (Not Blocking)
- `useState` called in `useEffect` (DashboardTabs, SearchableSelect, useAdmissions)
- `Date.now()` used in render (useAdmissions)
- Unused imports in several files
- These exist in the original codebase and are not blocking build