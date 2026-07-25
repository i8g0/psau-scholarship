# PSAU Scholarship — Agent Instructions

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS variables) + Bold Design System
- `googleapis` for Sheets API, `lucide-react` icons

## Commands
```bash
npm run dev        # dev server, requires --webpack flag (no turbopack)
npm run build      # production build (lint → build for verification)
npm run start      # production server
npm run lint       # eslint (next/core-web-vitals + typescript)
```

## Data Flow
```
Google Sheets (Summery!A:AB) → API (server-side, cached) → 4 tab components
```
- **API** (`src/app/api/admissions/route.ts`): Reads `Summery!A:AB` with **5s timeout**. Server-side `setInterval` every 5min refreshes in-memory cache. `GET` returns cached data instantly (cold-fetches once on first request). SWR headers: `s-maxage=300, stale-while-revalidate=600`. **No local fallback** — 500 if cold start + Sheets fail. No auth, no write.
- **Hook** (`src/hooks/useAdmissions.ts`): Returns `{ tables, loading, error, lastUpdate, refreshing, fetchData, timeAgo }`. `tables` is `{ table1, table2, table3, table4 }`.

## Google Sheet Layout (4 pivot tables side‑by‑side)
| Range | Cols | Fields |
|-------|------|--------|
| `A:G` (0–6) | 7 | Branch, Major, Nationality, Gender, MAX, AVG, MIN |
| `I:O` (8–14) | 7 | Nationality, Branch, Major, Gender, MAX, AVG, MIN |
| `Q:U` (16–20) | 5 | Nationality, Gender, MAX, AVG, MIN |
| `W:AB` (22–27) | 6 | Branch, Major, Gender, MAX, AVG, MIN |

**CRITICAL**: Empty separator columns at H (7), P (15), V (21). If adding a new table, count columns from `export.csv` header — the ranges are **not** contiguous. API parses each table individually with `row.length >= N` guards.

## Architecture
- **Server Component** (`src/app/page.tsx`): Renders `<DashboardTabs />` — no `use client`
- **Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): All state, effects, filters, tab routing. Routes `table1`/`table2`/`table3`/`table4` to respective tab.
- **Tab Views** (`src/components/dashboard/views/`):
  - `MajorsNationalitiesTab` — Campus → Major → Nationality → Gender (uses Table1Record)
  - `NationalitiesMajorsTab` — Nationality → Campus → Major → Gender (uses Table2Record)
  - `NationalitiesTab` — Nationality → Gender (uses Table3Record)
  - `MajorsTab` — Campus → Major → Gender (uses Table4Record)
- **UI Primitives** (`src/components/ui/`): SearchableSelect, SortToggle, GenderBadge, AccentCell (supports `rowSpan`), ScoreCells, ScoreCards, EmptyState
- **Types** (`src/types/index.ts`): `Table{1..4}Record`, `TablesData`, `SortDir`, `FilterOpts`, `TABS` (4 tabs), utilities (`groupBy`, `sortByScore`, `sortGroups`, `meanOf`, `normalizeArabic`, `matchesFilters`)

## Grouping (Rowspan Pattern)
Each tab component has **two rendering paths**:
- **Sorted** (`sortDir !== "none"`): Flat numbered list — every field repeated per row
- **Default** (`sortDir === "none"`): Hierarchical with `rowSpan` — parent names shown once

Implementation pattern (in each tab's `useMemo`):
1. `groupBy(data, keyFn)` builds a `Map<string, T[]>`
2. Sort groups by `meanOf(avgScores)` descending
3. Nested `map()` with `rowSpan` on the first row of each group

Gender rows sort male-first (`gender === "ذكر" ? 0 : 1`).

## Critical Conventions
- **RTL Arabic throughout**: `dir="rtl"`, `lang="ar"`, IBM Plex Sans Arabic font, all UI text Arabic
- **Arrows in labels**: use `←` not `→` (RTL logical flow, in `types/index.ts`)
- **Marquee animation**: moves rightward (`translateX(-50%) → 0` in `globals.css`)
- **Score column order**: Min | مقياس النزعة | Max
- **Avg label**: "مقياس النزعة" (not "المتوسط")
- **Privacy**: API returns only pre-aggregated min/avg/max — no raw scores
- **No test framework** — manual verification via `npm run dev`

## Data Quality (API)
- Invalid `avgScore` (< 0 or > 100) is corrected to `(maxScore + minScore) / 2` with a warning logged
- Zero-score rows (max=0, avg=0, min=0) are discarded
- The sheet is the source of truth — no client-side aggregation or recalculation

## Build & Deploy
- Vercel recommended; add all env vars in project settings
- Build output: static `/`, dynamic `/api/admissions`
- Verification order: `npm run lint` → `npm run build`
- Pre-existing lint warnings (setState in effects, Date.now in render, unused imports) are not blocking

## Environment (`.env.local` — gitignored)
```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=         # Tab name in sheet: "Summery"
```
Service account needs Editor access.
