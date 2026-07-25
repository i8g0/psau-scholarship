# PSAU Scholarship — Agent Instructions

CLAUDE.md delegates here via `@AGENTS.md`.

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `googleapis`, `lucide-react`, `recharts`.

## Commands
```
npm run dev        # next dev --webpack (no turbopack)
npm run build      # production build
npm run start      # production server
npm run lint       # eslint (flat config, next/core-web-vitals + typescript)
```
No test framework — manual verification via `npm run dev`.

Verification order: `npm run lint` → `npm run build`. Pre-existing lint warnings (setState in effects, Date.now in render, unused imports) are non-blocking.

## Data Flow
```
Google Sheets (Summery!A:AB) → /api/admissions → 4 pivot tables
```
- **API** (`src/app/api/admissions/route.ts`): Reads `Summery!A:AB`, parses 4 non-contiguous tables. Invalid avgScore (<0 or >100) corrected to `(max+min)/2`. Zero-score rows discarded. No auth, no write.
  - 5s timeout on Google Sheets fetch
  - 5-min background poller + in-memory global cache (Node.js `globalThis`)
  - `export.csv` in repo root = raw sheet snapshot for debugging
- **Hook** (`src/hooks/useAdmissions.ts`): Returns `{ tables, loading, error, lastUpdate, refreshing, fetchData, timeAgo }`.

## Sheet Layout (4 pivot tables side-by-side)
| Range | Cols | Fields |
|-------|------|--------|
| `A:G` (0–6) | 7 | Campus, Major, Nationality, Gender, MAX, AVG, MIN |
| `I:O` (8–14) | 7 | Nationality, Campus, Major, Gender, MAX, AVG, MIN |
| `Q:U` (16–20) | 5 | Nationality, Gender, MAX, AVG, MIN |
| `W:AB` (22–27) | 6 | Campus, Major, Gender, MAX, AVG, MIN |

Empty separator columns at H(7), P(15), V(21). API parses each table with `row.length >= N` guards — if adding a table, count from CSV header.

## Architecture
- **Server Component** (`src/app/page.tsx`): Renders `<DashboardTabs />`
- **Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): State, filters, tab routing, sort toggle
- **Tab Views** (`src/components/dashboard/views/`):
  - `MajorsNationalitiesTab` — Campus→Major→Nationality→Gender (Table1Record)
  - `NationalitiesMajorsTab` — Nationality→Campus→Major→Gender (Table2Record)
  - `NationalitiesTab` — Nationality→Gender (Table3Record)
  - `MajorsTab` — Campus→Major→Gender (Table4Record)
- **Types** (`src/types/index.ts`): `Table{1..4}Record`, `SortDir`, `FilterOpts`, `TABS`; utilities `groupBy`, `sortByScore`, `meanOf`, `normalizeArabic`, `matchesFilters`
- **UI components** (`src/components/ui/`): `AccentCell`, `ScoreCells`, `ScoreCards`, `GenderBadge`, `SearchableSelect`, `SortToggle`, `EmptyState`

## Filter Flow (critical)
- `DashboardTabs` owns all filter state. It computes `filteredData` via `matchesFilters` and **must** pass `filteredData` (not raw `tables.tableN`) to tab views.
- Tab views are pure renderers — they never filter internally. They only receive `data` and `sortDir` props.
- `matchesFilters` checks `campus`, `major`, `nationality`, `gender` fields and does Arabic-normalized text search across all fields.
- Gender values are the literal strings `"ذكر"` / `"أنثى"` (Arabic).

## Grouping & Rendering
Each tab has **two rendering paths**:
- **Default** (`sortDir === "none"`): Hierarchical grouped table + mobile card layout. Groups in **sheet insertion order** (not sorted).
- **Sorted** (`sortDir !== "none"`): Flat numbered list sorted by avgScore.
- `groupBy(data, keyFn)` builds `Map<string, T[]>`, then nested `map()` with `rowSpan` on first row of each group.
- Gender rows sort male-first: `gender === "ذكر" ? 0 : 1`.
- `AccentCell` used per row (no rowSpan on accent cells).

## Critical Conventions
- **RTL Arabic**: `dir="rtl"`, `lang="ar"`, IBM Plex Sans Arabic font, all UI text Arabic
- **Arrows**: use `←` not `→` (RTL logical flow, in `types/index.ts`)
- **Score column order**: Min | مقياس النزعة | Max; avg label is "مقياس النزعة" (not "المتوسط")
- **No raw scores** — API returns only pre-aggregated min/avg/max
- **Dark mode**: class-based (`dark` class on `<html>`), localStorage key `psau-dark-mode`

## Environment (`.env.local` — gitignored)
```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=         # Tab name in sheet: "Summery"
```
Service account needs Editor access on the sheet. Vercel recommended for deploy; add env vars in project settings.
