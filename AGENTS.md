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
  - 5-min background poller (`setInterval` on module load) + in-memory global cache (Node.js `globalThis`), `revalidate = 300`
  - `GET` has 3 paths: fresh cache → return; stale cache → return stale + fire-and-forget background refresh; no cache (cold start) → block once and fetch live
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
- **Dark mode**: class-based (`dark` class on `<html>`), toggled in `DashboardTabs.tsx`, localStorage key `psau-dark-mode`. Applied both on toggle and read back on mount to avoid a flash.
- **Nested/detail card pattern**: the correct look for a per-record mini-card (name + `GenderBadge` + `ScoreCards`) is `className="mobile-card mb-2"` with `style={{ borderRight: "3px solid var(--male-accent|female-accent)" }}` — a slim accent stripe, not a full colored background fill. Reference implementation: `MajorsNationalitiesTab.tsx` (تاب "التخصصات ← الجنسيات"). The other 3 tab views must match this exactly; they've drifted before (full-fill gender backgrounds, or `background: var(--bg-input)` overrides) and gotten fixed back to this pattern.

## Theme / Design Tokens (`src/app/globals.css`)
Two-mode CSS custom-property system, **not** Tailwind theme colors:
- `:root` = light mode (white cards, olive/emerald `--olive-*` scale, warm `--beige-*` scale) — the default.
- `.dark` = dark mode (navy glassmorphism + neon emerald/cyan/gold), applied via the `dark` class on `<html>`.
- Semantic tokens components should use: `--bg-body/--bg-card/--bg-header/--bg-input`, `--text-primary/--text-secondary/--text-muted/--text-accent`, `--male-accent/--female-accent/--male-text/--female-text`, `--score-low/--score-avg/--score-high`, `--chip-active-bg/--chip-active-border/--chip-active-text`, `--border-default`.
- `backdrop-filter: blur()` is used on `.card`, `.table-container`, `.mobile-card`, `.dropdown-menu` for the glass effect. **Gotcha**: `backdrop-filter` creates a new CSS stacking context, which can trap a child's `z-index` below a *later sibling* that also has `backdrop-filter` (this broke the sort dropdown once — fixed by adding `relative z-20` to the containing card, not by raising the dropdown's own `z-index`). If a popover/dropdown gets visually clipped by a sibling card, suspect this first.

### ⚠️ `var(--color-*)` tokens are undefined — do not use them
`tailwind.config.ts` defines a `primary/secondary/surface/text/border/danger/warning/success/male/female` Tailwind color palette that is **not** wired to any CSS custom property. Some inline styles reference `var(--color-primary)`, `var(--color-secondary)`, `var(--color-warning)`, `var(--color-surface)`, `var(--color-text)`, `var(--color-border)` directly — these variables don't exist anywhere in `globals.css`, so the browser silently falls through to `unset`/transparent (no console error). This has caused several "invisible button/badge" bugs. Always use the real `--olive-*` / `--bg-*` / `--text-*` / `--chip-active-*` tokens above instead. `var(--color-danger)` is the one exception that *is* defined and safe to use.
- Known remaining `var(--color-*)` usages to clean up when touched: `FilterBar.tsx` (filter chips, clear buttons), `Footer.tsx` (background/border/text), `StatsBar.tsx` (3 stat card colors).

## Known Open Issues (verified, as of writing)
- `Header.tsx`: "LIVE" badge still renders red + English text; should be green "بث مباشر" with `badge-glow-emerald` per the rest of the Arabic UI.
- `ScoreCards.tsx`: the tint backgrounds are swapped — "الأدنى" (min/worst) card has a green-ish background (`rgba(5,150,105,0.08)`) while its text uses `--score-low` (red), and "الأعلى" (max/best) card has a red-ish background (`rgba(220,38,38,0.06)`) while its text uses `--score-high` (green). Background and text intent don't match.

## Environment (`.env.local` — gitignored)
```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=         # Tab name in sheet: "Summery"
```
Service account needs Editor access on the sheet. Vercel recommended for deploy; add env vars in project settings.
