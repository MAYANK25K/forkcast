# Forkcast — Frontend

The Next.js 16 frontend for Forkcast. A responsive analytics dashboard that consumes the Forkcast Laravel API and presents restaurant performance data through charts, KPI cards, and filterable tables.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Pages & Routing](#pages--routing)
3. [Components](#components)
4. [Data Fetching & Hooks](#data-fetching--hooks)
5. [API Client](#api-client)
6. [Responsive Design](#responsive-design)
7. [Environment Variables](#environment-variables)
8. [Available Scripts](#available-scripts)
9. [Local Setup](#local-setup)

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.2.4 | Framework — App Router, Server Components, Turbopack |
| React | 19.2.4 | UI library |
| Tailwind CSS | v4 | Utility-first styling |
| TanStack Query | v5 | Server state management, caching, background refetch |
| Axios | latest | HTTP client — centralised API instance |
| Recharts | latest | Composable chart library (line, bar, area) |
| shadcn/ui | latest | Accessible component primitives |
| Radix UI | latest | Headless UI for popover, select, etc. |
| Lucide React | latest | Icon library |
| date-fns | latest | Date formatting for chart axes and tooltips |
| clsx | latest | Conditional className utility |

---

## Pages & Routing

### `/` — Overview

**File:** `src/app/page.js`

The home page. Shows the global state of all restaurants.

- Fetches global KPIs via `useGlobalSummary` → `GET /api/v1/analytics/summary`
- Renders 4 `KpiCard` components: Total Revenue, Total Orders, Avg Order Value, Active Venues
- Below the KPIs: a `Leaderboard` (top 3 by revenue) alongside a `RestaurantGrid` (all venues, searchable)
- On desktop both panels are side-by-side. On tablet and mobile they stack vertically.

### `/restaurants` — Restaurant Catalog

**File:** `src/app/restaurants/page.js`

Full searchable and sortable list of all restaurants.

- Uses `RestaurantGrid` which internally calls `useRestaurants` → `GET /api/v1/restaurants`
- Supports text search (starts-with matching), sort by name/rating/cuisine, asc/desc toggle
- Grid view (card layout) and list view (compact rows)
- Active filter chips show applied filters; each chip has an × to clear it

### `/restaurants/[id]` — Restaurant Dashboard

**File:** `src/app/restaurants/[id]/page.js`

Deep-dive analytics for a single venue. `[id]` is the restaurant's `public_id` UUID.

- `GlobalDashboard` component fetches everything via `useAnalytics(publicId)` → `GET /api/v1/restaurants/:id/analytics`
- Shows a restaurant info strip (name, cuisine, location, rating)
- `GlobalFilters` collapsible panel — filters are passed down to the analytics hook
- 3 KPI cards: Total Revenue, Total Orders, Avg Order Value
- 4 charts laid out in a responsive grid:
  - **Daily Orders** — bar chart, orders per day
  - **Daily Revenue** — area chart, revenue per day
  - **AOV Trend** — dashed line chart, avg order value over time
  - **Peak Hour** — bar chart, orders by hour of day (0–23)

### `/leaderboard` — Revenue Leaderboard

**File:** `src/app/leaderboard/page.js`

Top 10 restaurants ranked by total revenue, with full filter support.

- Fetches via `useLeaderboard(filters, 10)` → `GET /api/v1/analytics/leaderboard`
- `GlobalFilters` at the top — all filter changes trigger a re-fetch
- Table layout: rank badge, restaurant name/cuisine/location/rating, orders, avg order, revenue
- Top 3 rows have teal/grey/orange colour-coding
- Each row links to that restaurant's dashboard
- Responsive: orders and avg-order columns hide on mobile, revenue always visible

---

## Components

### `Sidebar.jsx`

Three-mode responsive navigation:

| Breakpoint | Behaviour |
|-----------|-----------|
| `< 640px` (mobile) | Hidden entirely. Navigation handled by the bottom tab bar. |
| `640–767px` (tablet) | 56px icon-rail. Labels hidden with `w-0 overflow-hidden`. Toggle button expands to 220px. |
| `768px+` (desktop) | Full 220px sidebar, always expanded, no toggle. |

The bottom tab bar is a separate `<nav>` element visible only below 640px with `sm:hidden`. It renders Overview, Restaurants, and Leaderboard as icon + label tabs with an active-state dot indicator.

### `KpiCard.jsx`

Single metric tile. Props: `label`, `value`, `sub`, `icon`, `accent` (teal gradient variant).

The value uses `text-2xl sm:text-3xl` with `break-all` so currency values like `$117,315` never overflow at any card width.

### `RestaurantCard.jsx`

Used in both grid mode and list mode via the `listView` prop.

**Grid mode:** `flex-col` layout. Bottom section is vertically stacked (rating row then CTA row) — this is deliberate to prevent overlap at narrow widths (< 380px). Padding reduced from `p-5` to `p-3`.

**List mode:** Single horizontal row with avatar, name, location, hidden rating (xs+), hidden cuisine badge (md+), and always-visible chevron.

### `RestaurantGrid.jsx`

Wraps `RestaurantCard` with search, sort, and view-toggle controls. Grid columns:
- `< 380px`: 1 column (prevents broken cards on 320px phones)
- `380–639px`: 2 columns
- `640px+`: 3 columns

The `animation` shorthand vs `animationDelay` longhand conflict (React console warning) is resolved by using only longhand animation properties in the `style` object.

### `GlobalDashboard.jsx`

Orchestrates the per-restaurant analytics page. Handles loading, error, and data states independently.

Error state shows a styled card with the exact failing URL and a Retry button.

Charts use `ResponsiveContainer width="100%"` from Recharts so they fill their grid cells at any screen size.

### `GlobalFilters.jsx`

Collapsible filter panel with:
- Date range (from / to) — date inputs
- Order amount range (min / max) — number inputs
- Order hour range (from / to) — select dropdowns (0–23)
- Apply Filters button — fires `onApply(filters)` callback
- Clear button — fires `onClear()` callback

Filters are not applied on change — only on button click, to avoid rapid API re-fetches while the user is typing.

---

## Data Fetching & Hooks

All hooks use **TanStack Query v5** with a shared `QueryClient`. Queries are keyed by `[endpoint, filters]` so filter changes invalidate the right cache entries automatically.

### `useGlobalSummary(filters)`

```js
// Calls: GET /api/v1/analytics/summary?...filters
// Returns: { data: { total_orders, total_revenue, avg_order_value, active_restaurants } }
```

### `useLeaderboard(filters, limit)`

```js
// Calls: GET /api/v1/analytics/leaderboard?limit=N&...filters
// Returns: { data: [{ public_id, name, cuisine_type, total_orders, total_revenue, avg_order_value, rank }] }
```

### `useRestaurants(params)`

```js
// Calls: GET /api/v1/restaurants?search=X&sort_by=name&direction=asc&per_page=20
// Returns: { data: [...restaurants], meta: { total, per_page, current_page } }
```

### `useAnalytics(publicId, filters)`

```js
// Calls: GET /api/v1/restaurants/:publicId/analytics?...filters
// Returns: {
//   data: {
//     restaurant:    { id, name, cuisine_type, location, rating, is_active },
//     summary:       { total_orders, total_revenue, avg_order_value },
//     daily_metrics: [{ date, order_count, revenue, avg_order_value }],
//     peak_hours:    [{ date, peak_hour, order_count }]
//   }
// }
```

---

## API Client

**File:** `src/lib/api.js`

```js
import axios from 'axios'
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})
export default api
```

All hooks import this instance. The base URL is set via `NEXT_PUBLIC_API_URL` in `.env.local`.

> **Important:** All `api.get()` calls use a **leading slash** (e.g. `api.get('/analytics/summary')`). Without the leading slash, Axios resolves relative to the last segment of the baseURL and produces an incorrect URL.

---

## Responsive Design

Three breakpoint tiers:

| Tier | Width | Layout |
|------|-------|--------|
| Mobile | `< 640px` | No sidebar. Bottom tab bar. 1-col card grid (< 380px), 2-col (380–639px). |
| Tablet | `640–767px` | 56px icon-rail sidebar. Content offset by `3.5rem`. |
| Desktop | `768px+` | Full 220px sidebar. Content offset by `220px`. |

CSS custom properties in `globals.css`:
```css
--sidebar-w:    220px;   /* desktop full sidebar */
--sidebar-w-sm: 3.5rem;  /* tablet icon-rail */
--tab-bar-h:    4.5rem;  /* mobile bottom tab bar height */
```

The `.page-shell` utility class applies the correct `margin-left` and `padding-bottom` at each breakpoint and is applied to the content wrapper in every page.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Full base URL of the Laravel API including `/api/v1` |

**Local:** `http://localhost:8000/api/v1`
**Production:** `https://your-backend.railway.app/api/v1`

Create `.env.local` from the example:
```bash
cp .env.local.example .env.local
```

---

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server (requires npm run build first)
npm run lint     # ESLint
```

---

## Local Setup

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Navigate into the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.local.example .env.local

# 4. Set the API URL (edit the file you just created)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend must be running at `http://localhost:8000` for data to load. See `backend/README.md`.

---

