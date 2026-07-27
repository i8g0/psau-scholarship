# PSAU Scholarship — Agent Instructions

## Stack & Commands

Next.js 16.2 (App Router, webpack), React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `googleapis`, `lucide-react`, `recharts`.

```
npm run dev        # next dev --webpack (no turbopack)
npm run build      # production build
npm run lint       # eslint (flat config, next/core-web-vitals + typescript)
```

Verify: `npm run lint` → `npm run build`. Single lint warning (custom font loading) is non-blocking.

## Data Flow

```
Google Sheets (Summery!A:AB) → /api/admissions → 4 pivot tables
```

- **API** (`src/app/api/admissions/route.ts`): Reads `Summery!A:AB`, parses 4 non-contiguous tables. Invalid avgScore (<0 or >100) corrected to `(max+min)/2`. Zero-score rows discarded. 5s timeout. 5-min background poller + in-memory `globalThis` cache. `revalidate = 300`.
  - GET: fresh cache → return; stale cache → return stale + background refresh; no cache (cold start) → block once and fetch live.
  - Rate limiter: 100 req/min per IP via `x-real-ip` (falls back to `x-forwarded-for`). Returns 429. Stale entries pruned every 60s.
  - CORS: Dev allows configurable origins (`CORS_ORIGINS` env var, comma-separated). Production blocks all cross-origin.
  - Console logging guarded by `process.env.NODE_ENV !== "production"`.
- **CSRF** (`src/app/api/csrf/route.ts`): Double-submit cookie. GET generates token (httpOnly cookie + JSON body). POST validates via `crypto.timingSafeEqual`.
- **Hook** (`src/hooks/useAdmissions.ts`): Returns `{ tables, loading, error, lastUpdate, refreshing, fetchData, timeAgo }`. Console output production-guarded.

## Sheet Layout

| Range | Cols | Fields |
|-------|------|--------|
| `A:G` (0–6) | 7 | Campus, Major, Nationality, Gender, MAX, AVG, MIN |
| `I:O` (8–14) | 7 | Nationality, Campus, Major, Gender, MAX, AVG, MIN |
| `Q:U` (16–20) | 5 | Nationality, Gender, MAX, AVG, MIN |
| `W:AB` (22–27) | 6 | Campus, Major, Gender, MAX, AVG, MIN |

Separators at H(7), P(15), V(21). Each table parsed with `row.length >= N` guard.

## Architecture

- **Server Component** (`src/app/page.tsx`): Renders `<DashboardTabs />`
- **Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): Owns **all** filter state; computes `filteredData` via `matchesFilters`
- **Tab Views** (`src/components/dashboard/views/`): Pure renderers — never filter internally
  - `MajorsNationalitiesTab` — Campus→Major→Nationality→Gender
  - `NationalitiesMajorsTab` — Nationality→Campus→Major→Gender
  - `NationalitiesTab` — Nationality→Gender
  - `MajorsTab` — Campus→Major→Gender
- **UI** (`src/components/ui/`): `SearchableSelect`, `SortToggle`, `ScoreCards`, `GenderBadge`, `AccentCell`, `ScoreCells`, `EmptyState`
- **Types** (`src/types/index.ts`): `Table{1..4}Record`, `SortDir`, `FilterOpts`, `TABS`, utilities (`groupBy`, `sortByScore`, `meanOf`, `normalizeArabic`, `matchesFilters`)

## Grouping & Rendering

Two paths per tab:
- **Default** (`sortDir === "none"`): Hierarchical grouped table + mobile card layout. Groups in sheet insertion order.
- **Sorted** (`sortDir !== "none"`): Flat numbered list sorted by avgScore.
- `groupBy(data, keyFn)` → nested `map()` with `rowSpan` on first row per group.
- `AccentCell` per row (no rowSpan on accent cells). Male rows sort first.

## Critical Conventions

- **RTL Arabic**: `dir="rtl"`, `lang="ar"`, IBM Plex Sans Arabic font. Arrows use `←` not `→`.
- **Score column order**: Min \| مقياس النزعة \| Max. Avg label is "مقياس النزعة" (intentional).
- **Dark mode**: Class-based (`dark` class on `<html>`), toggled in `DashboardTabs.tsx`, `localStorage` key `psau-dark-mode`. Inline script in `layout.tsx` runs before hydration to prevent flash. Viewport metadata (`width=device-width, initial-scale=1`) exported from `layout.tsx` — required for mobile rendering.
- **Gender values**: Literal strings `"ذكر"` / `"أنثى"` (Arabic).
- **Card accent stripe**: Per-record mini-card = `className="mobile-card mb-2"` + `style={{ borderRight: "3px solid var(--male-accent|female-accent)" }}`.

## Theme / Design Tokens (`src/app/globals.css`)

Two-mode CSS custom-property system (not Tailwind theme colors):
- `:root` = light mode (white cards, emerald `--olive-*`, warm `--beige-*`)
- `.dark` = dark mode (navy glassmorphism + neon emerald/cyan/gold)

`tailwind.config.ts` is **vestigial** — Tailwind v4 (`@tailwindcss/postcss`) ignores it. All tokens live in `globals.css`.

**Gotcha**: `backdrop-filter` creates a new stacking context. Can trap a child's `z-index` below a sibling that also has `backdrop-filter`. Fix: add `relative z-[some-level]` to the containing card.

### ⚠️ `var(--color-*)` — mostly undefined
Only `--color-danger` is defined. Use `--olive-*`, `--bg-*`, `--text-*`, `--chip-active-*`, `--stat-*` tokens instead. No remaining usages in the codebase.

### Known CSS regressions to guard
- **`.input-field-search`**: Must have `padding-right: 56px; padding-left: 40px` (RTL). Dropped once before, causing search icon/text overlap in `FilterBar.tsx`.
- **Score column widths**: `.table-container td.score-low/.score-avg/.score-high` must keep `width: 80px; min-width: 80px; white-space: nowrap;`. Removed twice during refactors.
- **Dropdown text truncation**: `truncate` in a flex child (`.dropdown-item` has `display: flex`) requires `min-w-0` on the text span — otherwise `truncate` silently does nothing and content overflows. The dropdown uses `right-0` (not `left-0 right-0`) and has `max-width: calc(100vw - 32px); overflow-x: auto`. If you change dropdown width behavior, test on both mobile and desktop.
- **Smart dropdown direction**: `SearchableSelect.tsx` and `SortToggle.tsx` auto-flip upward when space below is insufficient (`getBoundingClientRect()`). Don't remove `dropUp` logic.

## Known Open Issues

- `ScoreCards.tsx`: Tint backgrounds swapped — "الأدنى" card has green-ish BG (should be red-ish), "الأعلى" card has red-ish BG (should be green-ish).

## Modals

Two client-side modals with same overlay pattern (`fixed inset-0 z-[100]`, `var(--bg-overlay)`, `card-elevated`):
- **DisclaimerModal** (`showDisclaimer`, shown on every visit, dismissed for session only — no localStorage).
- **NazaaModal** (`showNazaaModal`, triggered by header button "ما هو مقياس النزعة؟").

Body scroll lock in `DashboardTabs.tsx` uses `position: fixed` + `top: -scrollY` (not `overflow: hidden`) — `overflow: hidden` suppresses touch events on Android Chromium for elements inside fixed overlays.

## Header Mobile Layout

Desktop (`hidden sm:flex`) and mobile (`sm:hidden flex flex-col`) are two separate DOM trees in the same component. Mobile puts refresh+dark mode icons on the title line, and subtitle+نزعة button on line 2. The نزعة button text is always visible (never hidden behind an icon).

## Environment (`.env.local` — gitignored)

```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=
CORS_ORIGINS=           # Optional: comma-separated origins for dev CORS
ALLOWED_DEV_ORIGINS=    # Optional: comma-separated IPs for next dev (e.g. 192.168.100.8)
```

Service account needs Editor access on the sheet. Deploy on Vercel; add env vars in project settings.

## next.config.ts Quirks

- `allowedDevOrigins` reads from `ALLOWED_DEV_ORIGINS` env var (comma-separated). Required when accessing `next dev` from LAN IPs.
- Security headers block all cross-origin access in production. No CORS on API routes in prod.
- CSP uses `'unsafe-inline'` + `'unsafe-eval'` (required by Next.js App Router RSC + webpack). Do NOT add a hash to `script-src` — hashes and `'unsafe-inline'` are mutually exclusive per CSP Level 2, and Next.js cannot work without `'unsafe-inline'`.

## Security

- No authentication on `/api/admissions` — public read-only. Rate-limited to 100 req/min per IP.
- No CSRF on GET endpoints.
- `dangerouslySetInnerHTML` in `layout.tsx` for pre-hydration dark mode — intentional, unavoidable.
