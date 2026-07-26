# PSAU Scholarship — Agent Instructions

## Stack & Commands

Next.js 16.2 (App Router), React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `googleapis`, `lucide-react`, `recharts`.

```
npm run dev        # next dev --webpack (no turbopack)
npm run build      # production build
npm run start      # production server
npm run lint       # eslint (flat config, next/core-web-vitals + typescript)
```

Verify: `npm run lint` → `npm run build`. Single lint warning (custom font loading) is non-blocking.

## Data Flow

```
Google Sheets (Summery!A:AB) → /api/admissions → 4 pivot tables
```

- **API** (`src/app/api/admissions/route.ts`): Reads `Summery!A:AB`, parses 4 non-contiguous tables. Invalid avgScore (<0 or >100) corrected to `(max+min)/2`. Zero-score rows discarded. 5s timeout on fetch. 5-min background poller (`setInterval` on module load) + in-memory `globalThis` cache. `revalidate = 300`.
  - GET has 3 paths: fresh cache → return; stale cache → return stale + background refresh; no cache (cold start) → block once and fetch live.
  - In-memory rate limiter: 100 req/min per IP via `x-real-ip` (falls back to `x-forwarded-for`). Returns 429 beyond limit. Stale IP entries pruned every 60s.
  - CORS: Development mode allows configurable origins (`CORS_ORIGINS` env var, comma-separated). Production blocks all cross-origin requests.
  - Health: `GET /api/admissions` is public read-only. `OPTIONS` preflight returns CORS headers.
  - Console logging guarded by `process.env.NODE_ENV !== "production"`.
  - Credential validation: specific error per missing env var.
- **CSRF** (`src/app/api/csrf/route.ts`): Double-submit cookie pattern. `GET` generates a token (set as httpOnly cookie + JSON body). `POST` validates token against cookie using `crypto.timingSafeEqual`.
- **Hook** (`src/hooks/useAdmissions.ts`): Returns `{ tables, loading, error, lastUpdate, refreshing, fetchData, timeAgo }`. All console output production-guarded.

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
- **Client Orchestrator** (`src/components/dashboard/DashboardTabs.tsx`): Owns **all** filter state; computes `filteredData` via `matchesFilters` and passes it to tab views.
- **Tab Views** (`src/components/dashboard/views/`): Pure renderers — never filter internally.
  - `MajorsNationalitiesTab` — Campus→Major→Nationality→Gender
  - `NationalitiesMajorsTab` — Nationality→Campus→Major→Gender
  - `NationalitiesTab` — Nationality→Gender
  - `MajorsTab` — Campus→Major→Gender
- **UI** (`src/components/ui/`): `AccentCell`, `ScoreCells`, `ScoreCards`, `GenderBadge`, `SearchableSelect`, `SortToggle`, `EmptyState`
- **Types** (`src/types/index.ts`): `Table{1..4}Record`, `SortDir`, `FilterOpts`, `TABS`, utilities (`groupBy`, `sortByScore`, `meanOf`, `normalizeArabic`, `matchesFilters`)

## Grouping & Rendering

Two paths per tab:
- **Default** (`sortDir === "none"`): Hierarchical grouped table + mobile card layout. Groups in sheet insertion order.
- **Sorted** (`sortDir !== "none"`): Flat numbered list sorted by avgScore.
- `groupBy(data, keyFn)` → nested `map()` with `rowSpan` on first row per group.
- `AccentCell` per row (no rowSpan on accent cells). Male rows sort first.

## Critical Conventions

- **RTL Arabic**: `dir="rtl"`, `lang="ar"`, IBM Plex Sans Arabic font. Arrows use `←` not `→`.
- **Score column order**: Min | مقياس النزعة | Max. Avg label is "مقياس النزعة" (intentional, not "المتوسط").
- **Dark mode**: Class-based (`dark` class on `<html>`), toggled in `DashboardTabs.tsx`, `localStorage` key `psau-dark-mode`. Applied on toggle + read back on mount to avoid flash. Inline script in `layout.tsx:51-55` runs before hydration to prevent flash for returning users.
- **Gender values**: Literal strings `"ذكر"` / `"أنثى"` (Arabic).
- **Card accent stripe**: Per-record mini-card = `className="mobile-card mb-2"` + `style={{ borderRight: "3px solid var(--male-accent|female-accent)" }}`. Not a full background fill.

## Theme / Design Tokens (`src/app/globals.css`)

Two-mode CSS custom-property system (not Tailwind theme colors):
- `:root` = light mode (white cards, emerald `--olive-*` scale, warm `--beige-*` scale)
- `.dark` = dark mode (navy glassmorphism + neon emerald/cyan/gold)

Components should use: `--bg-body/card/header/input`, `--text-primary/secondary/muted/accent`, `--male/female-accent/text`, `--score-low/avg/high`, `--chip-active-bg/border/text`, `--border-default`, `--stat-emerald/cyan/gold`.

`tailwind.config.ts` exists but is **vestigial** — Tailwind v4 (`@tailwindcss/postcss`) ignores it. All design tokens live in `globals.css` CSS custom properties.

**Gotcha**: `backdrop-filter` creates a new stacking context. Can trap a child's `z-index` below a sibling that also has `backdrop-filter`. Fix: add `relative z-[some-level]` to the containing card, not by raising the dropdown's own `z-index`.

### ⚠️ `var(--color-*)` tokens — mostly undefined
`var(--color-primary/secondary/warning/surface/text/border)` are **not defined** in `globals.css` — they silently fall through to `unset`/transparent. Only `--color-danger` is defined (global). Use the real `--olive-*` / `--bg-*` / `--text-*` / `--chip-active-*` / `--stat-*` tokens instead.
No remaining usages in the codebase.

### Known regressions to guard
- **`.input-field-search`**: Must provide `padding-right: 56px; padding-left: 40px` (RTL). Class was dropped once during a CSS refactor, causing search icon/text overlap in `FilterBar.tsx`.
- **Smart dropdown direction**: `SearchableSelect.tsx` and `SortToggle.tsx` auto-flip the dropdown upward when space below is insufficient (uses `getBoundingClientRect()`). Don't remove the `dropUp` logic.
- **Score column widths**: `.table-container td.score-low/.score-avg/.score-high` must keep `width: 80px; min-width: 80px; white-space: nowrap;`. Removed twice during CSS refactors (commits `9a57fbf`, `8ef06c9`), causing uneven gaps between Min/Avg/Max columns.

## Known Open Issues

- `Header.tsx`: "LIVE" badge is red + English; should be green "بث مباشر" with `badge-glow-emerald`.
- `ScoreCards.tsx`: Tint backgrounds swapped — "الأدنى" card has green-ish BG (should be red-ish), "الأعلى" card has red-ish BG (should be green-ish).

## Modals

Two client-side modals with same overlay pattern (`fixed inset-0 z-[100]`, `var(--bg-overlay)`, `card-elevated`, `animate-fade-in-scale`):
- **DisclaimerModal** (`showDisclaimer`, shown on every visit, dismissed for session only — no localStorage).
- **NazaaModal** (`showNazaaModal`, triggered by header button "ما هو مقياس النزعة؟").

Both managed in `DashboardTabs.tsx` with body scroll lock while open.

## Environment (`.env.local` — gitignored)

```
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=     # PKCS#8 with literal \n newlines
SPREADSHEET_ID=
CORS_ORIGINS=           # Optional: comma-separated origins for dev CORS (e.g. http://localhost:5173)
```

Service account needs Editor access on the sheet. Deploy on Vercel; add env vars in project settings.

## Security

### Intentional Design Decisions

- **No authentication on `/api/admissions`** — Public read-only dashboard by design. Rate-limited to 100 req/min per IP.
- **PDFs in `public/`** — Admission score PDFs are publicly shared materials with no PII.
- **No CSRF on GET** — Only GET endpoints exist for data; no state-changing operations.
- **`dangerouslySetInnerHTML` in `layout.tsx`** — Required for pre-hydration dark mode. CSP hash `sha256-e3C6Vof1o/mVaA6sGKlpqVnYpbtaLlThaNbu9s54LwI=` matches the exact script, so `'unsafe-inline'` is not needed for scripts.

### Security Headers (via `next.config.ts`)

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | See `next.config.ts` — script-src uses hash, style-src keeps `'unsafe-inline'` for CSS custom properties |

### Accepted Residual Risks

- **`brace-expansion` (dev-only, 3 CVEs)**: ReDoS vulnerabilities in eslint toolchain. Not exploitable at runtime — only triggered by eslint config patterns (not user input).
- **`sharp` via `next` (4 CVEs)**: libvips CVEs in image processing library. Requires Next.js 16.3+ upgrade (not yet released).
- **`.env.local` on disk**: Contains live Google service account key. Gitignored, but must never be committed or shared. Use Vercel Environment Variables in production.

### Removed Vulnerabilities (fixed in this session)

| Package | Vuln | Fix |
|---------|------|-----|
| `postcss` | XSS + path traversal (3 CVEs) | Override to 8.5.23 |
| `js-yaml` | YAML quadratic CPU (1 CVE) | Override to 4.3.0 |
| Rate limiter | Spoofable `x-forwarded-for` | Added `x-real-ip` fallback |
| CSP | `'unsafe-inline'` in style-src | Kept — required for inline style attributes with CSS custom properties |
| API logging | Guarded in production | Already done server-side; client hook now also guarded |
| CORS | Missing for dev | Added with `CORS_ORIGINS` env var + OPTIONS handler |
