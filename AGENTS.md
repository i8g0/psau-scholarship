# PSAU Scholarship — Agent Instructions

## Stack & Commands

Next.js 16.2 (App Router, webpack), React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `googleapis`, `lucide-react`.

```
npm run dev        # next dev --webpack (no turbopack)
npm run build      # production build
npm run lint       # eslint (flat config, next/core-web-vitals + typescript)
```

Verify: `npm run lint` → `npm run build`. Single lint warning (custom font loading) is non-blocking.

`postcss` pinned to `8.5.23` via `overrides` in `package.json`. `recharts` is a vestigial dep (never imported).

## Data Flow

```
Google Sheets (Summery!A:AB) → /api/admissions → 4 pivot tables
```

**API** (`src/app/api/admissions/route.ts`): Reads `Summery!A:AB`, parses 4 non-contiguous tables at index ranges 0–6, 8–14, 16–20, 22–27. Invalid avgScore (<0 or >100) corrected to `(max+min)/2`. Zero-score rows (`max===0 && avg===0 && min===0`) discarded. 5s timeout. 5-min background poller + `globalThis` in-memory cache. `revalidate = 300`.
- GET: fresh cache → return; stale cache → return stale + background refresh; no cache (cold start) → block and fetch live.
- Rate limiter: 100 req/min per IP via `x-real-ip` (falls back to `x-forwarded-for`). Returns 429. Stale entries pruned every 60s.
- CORS: Dev allows `CORS_ORIGINS` (comma-separated env var). Production blocks all cross-origin.
- Console logging guarded by `process.env.NODE_ENV !== "production"`.
- `dns.setDefaultResultOrder("ipv4first")` at top of file — required on Windows to avoid IPv6 DNS delays.

**CSRF** (`src/app/api/csrf/route.ts`): Cookie-based CSRF token. GET generates httpOnly cookie + JSON token. POST validates via `crypto.timingSafeEqual`.

**Hook** (`src/hooks/useAdmissions.ts`): Returns `{ tables, loading, error, lastUpdate, refreshing, fetchData, timeAgo }`. Console output production-guarded.

## Sheet Layout

| Range | Cols | Fields |
|-------|------|--------|
| `A:G` (0–6) | 7 | Campus, Major, Nationality, Gender, MAX, AVG, MIN |
| `I:O` (8–14) | 7 | Nationality, Campus, Major, Gender, MAX, AVG, MIN |
| `Q:U` (16–20) | 5 | Nationality, Gender, MAX, AVG, MIN |
| `W:AB` (22–27) | 6 | Campus, Major, Gender, MAX, AVG, MIN |

Separators at H(7), P(15), V(21). Each parser checks `row.length >= N` (7/15/21/28).

## Architecture

**Server Component** (`src/app/page.tsx`): Renders `<DashboardTabs />`.

**Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): Owns ALL filter state (search, campus, major, nationality, gender). Computes `filteredData` via `matchesFilters`. Critical point threshold hardcoded at line ~233.

**Tab Views** (`src/components/dashboard/views/`): Pure renderers — no filtering.
- `MajorsNationalitiesTab` — Campus→Major→Nationality→Gender
- `NationalitiesMajorsTab` — Nationality→Campus→Major→Gender
- `NationalitiesTab` — Nationality→Gender
- `MajorsTab` — Campus→Major→Gender

**Other dashboard components**: `FilterBar.tsx` (conditional filters per active tab), `StatsBar.tsx`, `Footer.tsx` (hides `MarqueeBar.tsx` via `IntersectionObserver`).

**UI** (`src/components/ui/`): `SearchableSelect`, `SortToggle`, `ScoreCards`, `GenderBadge`, `AccentCell`, `ScoreCells`, `EmptyState`.

**Types** (`src/types/index.ts`): `Table{1..4}Record`, `SortDir`, `FilterOpts`, `TABS`, utilities (`groupBy`, `sortByScore`, `meanOf`, `normalizeArabic`, `matchesFilters`).

## Rendering

Two paths per tab:
- **Default** (`sortDir === "none"`): Hierarchical grouped table + mobile card layout. Groups in sheet insertion order via `groupBy` with `Map`. `rowSpan` on first row per group; `AccentCell` per row (no rowSpan). Male rows sort first.
- **Sorted** (`sortDir !== "none"`): Flat numbered list sorted by `avgScore`.

## Critical Conventions

- **RTL Arabic**: `dir="rtl"`, `lang="ar"`, IBM Plex Sans Arabic via `<link>`. Arrows use `←` not `→`.
- **Score column order**: Min \| مقياس النزعة \| Max. Avg label is "مقياس النزعة" (intentional).
- **Dark mode**: Class-based (`dark` class on `<html>`), toggled in `DashboardTabs.tsx`, `localStorage` key `psau-dark-mode`. Inline script in `layout.tsx` runs before hydration to prevent flash. Viewport metadata exported from `layout.tsx`.
- **Gender values**: Literal strings `"ذكر"` / `"أنثى"`.
- **Card accent stripe**: Per-record mini-card = `className="mobile-card mb-2"` + `style={{ borderRight: "3px solid var(--male-accent|female-accent)" }}`.

## Theme & CSS

Two-mode CSS custom-property system (not Tailwind theme colors) in `globals.css`:
- `:root` = light mode (white cards, emerald `--olive-*`, warm `--beige-*`)
- `.dark` = dark mode (navy glassmorphism + neon emerald/cyan/gold)

`tailwind.config.ts` is **vestigial** — Tailwind v4 (`@tailwindcss/postcss`) ignores it. All tokens live in `globals.css`.

**`var(--color-*)`**: Only `--color-danger` is defined. Use `--olive-*`, `--bg-*`, `--text-*`, `--chip-active-*`, `--stat-*` tokens instead. Note: `FilterBar.tsx` still uses `var(--color-danger)` in 2 places (lines ~142, ~276) — should be migrated.

**Gotchas**:
- `backdrop-filter` creates a new stacking context. Can trap a child's `z-index` below a sibling with `backdrop-filter`. Fix: add `relative z-[some-level]` to the container.
- `.input-field-search`: Must have `padding-right: 56px; padding-left: 40px` (RTL). Drops easily.
- Score columns: `.score-low/.score-avg/.score-high` need `width: 80px; min-width: 80px; white-space: nowrap`.
- Dropdown truncation: `truncate` in a flex child requires `min-w-0` on the text span. Dropdowns use `right-0` and `max-width: calc(100vw - 32px); overflow-x: auto`.
- Smart dropdown direction: `SearchableSelect` and `SortToggle` auto-flip upward when space below is insufficient (`getBoundingClientRect()`). Don't remove `dropUp` logic.

## Modals

Two client-side modals with same overlay pattern (`fixed inset-0 z-[100]`, `var(--bg-overlay)`, `card-elevated`):
- **DisclaimerModal** (shown every session, no localStorage). Has a form link section with URL from `NEXT_PUBLIC_DISCLAIMER_FORM_URL` (falls back to `https://forms.gle/nvRGFGxC611WHja1A`).
- **NazaaModal** (triggered by header button "ما هو مقياس النزعة؟").

Body scroll lock uses `position: fixed` + `top: -scrollY` (not `overflow: hidden` — suppresses touch events on Android).

## Header Mobile Layout

Desktop (`hidden sm:flex`) and mobile (`sm:hidden flex flex-col`) are separate DOM trees in `Header.tsx`. Mobile: refresh+dark mode icons on title line, subtitle+نزعة button on line 2. The نزعة button text is always visible.

## Known Open Issues

- `ScoreCards.tsx`: Tint backgrounds swapped — "الأدنى" card has green-ish BG (should be red-ish), "الأعلى" card has red-ish BG (should be green-ish).

## Environment (`.env.local` — gitignored)

```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=
CORS_ORIGINS=           # Optional: comma-separated for dev CORS
ALLOWED_DEV_ORIGINS=    # Optional: comma-separated IPs for `next dev` LAN. MISSING from .env.example.
NEXT_PUBLIC_DISCLAIMER_FORM_URL=  # Optional, defaults to forms.gle link in DisclaimerModal
```

Service account needs Editor access on the sheet. Deploy on Vercel; add env vars in project settings.

## next.config.ts Quirks

- `allowedDevOrigins` reads from `ALLOWED_DEV_ORIGINS` env var. Required when accessing `next dev` from LAN IPs.
- Security headers block all cross-origin in production. No CORS on API routes in prod.
- CSP uses `'unsafe-inline'` + `'unsafe-eval'` (required by Next.js App Router RSC + webpack). Do NOT add a hash to `script-src` — hashes and `'unsafe-inline'` are mutually exclusive per CSP Level 2.

## Security

- No auth on `/api/admissions` — public read-only, rate-limited 100 req/min per IP.
- No CSRF on GET endpoints.
- `dangerouslySetInnerHTML` in `layout.tsx` for pre-hydration dark mode — intentional, unavoidable.
