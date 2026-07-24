# PSAU Scholarship - Agent Instructions

## Project Overview
Public read-only dashboard displaying weighted GPA summaries for PSAU scholarship admissions (Class of 2026). **Data sourced live from Google Sheets** — no local fallback, no admin portal, no auth.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS variables for theming)
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
- **Tab Views** (`src/components/dashboard/views/`): CampusTab, NationalityTab, MinimumTab, NoNationalityTab
- **UI Primitives** (`src/components/ui/`): SearchableSelect, SortToggle, GenderBadge, AccentCell, ScoreCells, ScoreCards, EmptyState
- **Hooks** (`src/hooks/useAdmissions.ts`): SWR-like data fetching + timeAgo computation
- **Types** (`src/types/index.ts`): AdmissionRecord, AggregatedRecord, TABS, SortDir, utilities (sortGroups, sortByScore, meanOf, aggregateRecords, fmt, normalizeArabic, matchesFilters, countBy)
- **API route** (`src/app/api/admissions/route.ts`):
  - Reads Google Sheets `Summery!A:G` with 5s timeout
  - **Server-side polling**: `setInterval` every 5 minutes updates in-memory cache
  - `GET` always returns cached data instantly (or cold-fetches once on first request)
  - SWR headers: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
  - **No local JSON fallback** — returns 500 if cold start + Sheets unavailable
  - No auth, no write endpoints, no query params to force refresh

## Critical Conventions
- **RTL Arabic throughout** — `dir="rtl"`, Tajawal font, all text Arabic
- **CSS variables in `globals.css`** — Olive/beige palette, semantic tokens for light/dark mode
- **Modular components** — Components split by concern; barrel exports in `src/components/ui/index.ts`
- **Privacy-first** — API returns only aggregated data (min/avg/max per group); raw scores never exposed
- **No test framework** — Manual testing only via `npm run dev`

## Environment Variables (`.env.local` - gitignored)
```
GOOGLE_CLIENT_EMAIL=          # Service account email
GOOGLE_PRIVATE_KEY=           # PKCS#8 private key with \n newlines
SPREADSHEET_ID=               # Google Sheet ID (tab must be named "Summery")
```
**Removed (no longer needed):** `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SECRET`

## Google Sheets Setup
- Sheet tab name: **Summery** (note typo — code reads `Summery!A:G`)
- Columns A-G: campus, major, nationality, gender, max, avg, min
- Service account needs Editor access to the sheet

## Build & Deploy Notes
- Vercel recommended; add all env vars in project settings
- Build output: static `/`, dynamic `/api/admissions`
- Revalidate: `/api/admissions` = 300s (ISR via `export const revalidate = 300`)
- **Lint**: `npm run lint` shows pre-existing warnings (unused vars in DashboardTabs, SearchableSelect, SortToggle, FilterBar, Footer, StatsBar, CampusTab) — not blocking

## What Changed (Migration Summary)
| Before | After |
|--------|-------|
| Admin panel + auth | ❌ Removed |
| Local `scores-26.json` fallback | ❌ Removed |
| Client polling + SWR | Server polling + SWR |
| `/api/scores`, `/api/auth`, `/api/sync-sheet`, `/api/form-webhook` | ❌ All deleted |
| `xlsx` dependency | ❌ Removed |
| Single-file `page.tsx` (1850 lines) | Modular component tree (14 files) |
| `Math.random()` in render | `useId()` |
| `Date.now()` in render | Moved to `useAdmissions` hook with 30s tick |
| `<img>` elements | `next/image` with `unoptimized` |
| Client `fetch()` in page | `useAdmissions` hook + `DashboardTabs` client component |