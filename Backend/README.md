# Forkcast — Backend

The Laravel 13 REST API powering Forkcast. Provides restaurant data and analytics endpoints consumed by the Next.js frontend.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Architecture — Request Lifecycle](#architecture--request-lifecycle)
5. [Models](#models)
6. [Services](#services)
7. [Resources (API Responses)](#resources-api-responses)
8. [Request Validation](#request-validation)
9. [CORS](#cors)
10. [Environment Variables](#environment-variables)
11. [Available Artisan Commands](#available-artisan-commands)
12. [Local Setup](#local-setup)


---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Laravel | 13 | PHP framework — routing, Eloquent ORM, request validation |
| PHP | 8.3+ | Language |
| SQLite | (built-in) | Default database — zero setup for local development |
| PostgreSQL | optional | Recommended for production |
| Composer | 2+ | PHP package manager |

---

## Database Schema

### `restaurants`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | Auto-increment primary key (internal only, never exposed via API) |
| `public_id` | uuid | Unique public identifier — used in all API URLs |
| `name` | varchar(150) | Restaurant name |
| `cuisine_type` | varchar(100) | e.g. "Japanese", "Italian" |
| `location` | varchar(255) | City name |
| `rating` | decimal(3,2) | 0.00–5.00 |
| `is_active` | boolean | Soft on/off switch — only active restaurants are returned by the API |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Indexes:** `name` (btree), `is_active` (btree)

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | Auto-increment primary key |
| `public_id` | uuid | Unique public identifier |
| `restaurant_id` | bigint | Foreign key → `restaurants.id` (cascade delete) |
| `amount` | decimal(10,2) | Order total in USD |
| `ordered_at` | timestamptz | Full timestamp with timezone |
| `order_hour` | tinyint | 0–23 — extracted from `ordered_at` for fast hour-filter queries |
| `order_date` | date | Date portion of `ordered_at` — for fast daily grouping queries |
| `status` | varchar(50) | Default `completed` — only completed orders are included in analytics |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Indexes:** `(restaurant_id, order_date)`, `(amount)`, `(restaurant_id, order_date, amount)`, `(restaurant_id, order_hour)`, `(order_date, amount)`, `(ordered_at)`

The `order_hour` and `order_date` columns are denormalised from `ordered_at` intentionally — filtering and grouping by these values is the core analytics workload and the dedicated indexes make it significantly faster than extracting from a timestamp at query time.

---

## API Reference

All routes are prefixed with `/api/v1`.

### `GET /api/v1/restaurants`

List all active restaurants. Supports search, sort, and pagination.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Starts-with match on restaurant name |
| `sort_by` | string | `name` | `name` \| `rating` \| `cuisine_type` \| `created_at` |
| `direction` | string | `asc` | `asc` \| `desc` |
| `per_page` | int | `15` | Results per page (max 50) |
| `page` | int | `1` | Page number |

**Response:**
```json
{
  "data": [
    {
      "id": "bf0865be-d7ee-4b8b-84be-f1b93582aed9",
      "name": "Sushi Bay",
      "cuisine_type": "Japanese",
      "location": "Mumbai",
      "rating": "4.80",
      "is_active": true
    }
  ],
  "meta": {
    "total": 4,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

### `GET /api/v1/restaurants/{publicId}`

Single restaurant by UUID.

**Response:**
```json
{
  "data": {
    "id": "bf0865be-d7ee-4b8b-84be-f1b93582aed9",
    "name": "Sushi Bay",
    "cuisine_type": "Japanese",
    "location": "Mumbai",
    "rating": "4.80",
    "is_active": true
  }
}
```

---

### `GET /api/v1/restaurants/{publicId}/analytics`

Full analytics payload for a single restaurant. Accepts all filter params.

**Query parameters (all optional):**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `date_from` | date | `2024-01-01` | Include orders from this date |
| `date_to` | date | `2024-03-31` | Include orders up to this date |
| `amount_min` | numeric | `10` | Minimum order amount |
| `amount_max` | numeric | `500` | Maximum order amount |
| `hour_from` | int 0–23 | `9` | Earliest order hour |
| `hour_to` | int 0–23 | `21` | Latest order hour |

**Response:**
```json
{
  "data": {
    "restaurant": {
      "id": "bf0865be-...",
      "name": "Sushi Bay",
      "cuisine_type": "Japanese",
      "location": "Mumbai",
      "rating": "4.80",
      "is_active": true
    },
    "summary": {
      "total_orders": 58,
      "total_revenue": "33989.00",
      "avg_order_value": "586.02"
    },
    "daily_metrics": [
      {
        "date": "2024-01-03",
        "order_count": 3,
        "revenue": "1823.50",
        "avg_order_value": "607.83"
      }
    ],
    "peak_hours": [
      {
        "date": "2024-01-03",
        "peak_hour": 19,
        "order_count": 2
      }
    ],
    "filters_applied": {
      "date_from": null,
      "date_to": null,
      "amount_min": null,
      "amount_max": null,
      "hour_from": null,
      "hour_to": null
    }
  }
}
```

---

### `GET /api/v1/analytics/leaderboard`

Top N restaurants ranked by total revenue.

**Query parameters:** All filter params above, plus:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | `3` | Number of restaurants to return (max 10) |

**Response:**
```json
{
  "data": [
    {
      "id": "bf0865be-...",
      "name": "Sushi Bay",
      "cuisine_type": "Japanese",
      "location": "Mumbai",
      "rating": "4.80",
      "total_orders": 58,
      "total_revenue": "33989.00",
      "avg_order_value": "586.02",
      "rank": 1
    }
  ],
  "meta": {
    "limit": 3,
    "filters": {}
  }
}
```

---

### `GET /api/v1/analytics/summary`

Global KPIs across all restaurants.

**Query parameters:** All filter params.

**Response:**
```json
{
  "data": {
    "total_orders": 200,
    "active_restaurants": 4,
    "total_revenue": "117315.00",
    "avg_order_value": "586.58"
  },
  "meta": {
    "filters": {}
  }
}
```

---

## Architecture — Request Lifecycle

```
HTTP Request
    │
    ▼
routes/api.php          ← Route definition + prefix /api/v1
    │
    ▼
FormRequest             ← Input validation (AnalyticsRequest / RestaurantIndexRequest)
(auto-rejected 422)
    │
    ▼
Controller              ← Thin: resolves the Restaurant model, calls the Service
    │
    ▼
AnalyticsService        ← All SQL logic lives here (no raw queries in controllers)
    │
    ▼
JsonResource            ← Shapes the response: field names, types, nesting
    │
    ▼
JSON Response
```

This separation means:
- Controllers stay under ~50 lines
- All complex SQL is in one testable class (`AnalyticsService`)
- Response shape is decoupled from the data model

---

## Models

### `Restaurant`

```php
// Key scopes
scopeActive($query)                   // WHERE is_active = 1
scopeSearch($query, $term)            // WHERE name LIKE 'term%'  (starts-with)
scopeSortBy($query, $column, $dir)    // ORDER BY allowed column
```

`$hidden = []` — the integer `id` is never exposed via the API (all API URLs use `public_id`), but it must remain accessible in PHP for Eloquent joins.

`RestaurantResource` maps `public_id` → `id` in the JSON response so the frontend always works with UUIDs.

### `Order`

Plain Eloquent model. No scopes — all analytics filtering is done in `AnalyticsService::baseQuery()` using the query builder directly, which is more efficient for aggregate queries than going through Eloquent relations.

---

## Services

### `AnalyticsService`

All analytics SQL is centralised here. Key methods:

**`baseQuery(filters, restaurantId?)`**
Returns a query builder pre-filtered by all active filters. Every other method starts from this base, ensuring filters are applied consistently everywhere.

**`getDailyMetrics(restaurantId, filters)`**
Groups completed orders by `order_date` and returns `order_count`, `revenue`, and `avg_order_value` per day.

**`getSummaryMetrics(restaurantId, filters)`**
Single-row aggregate: `total_orders`, `total_revenue`, `avg_order_value`.

**`getPeakHourPerDay(restaurantId, filters)`**
Finds the hour with the most orders for each date. Uses a subquery self-join (not `RANK() OVER()` window functions) so it works on both SQLite and PostgreSQL.

**`getLeaderboard(filters, limit)`**
Joins `orders` to `restaurants`, groups by restaurant, orders by `total_revenue` DESC.

**`getGlobalSummary(filters)`**
Cross-restaurant aggregate. Uses `COUNT(id)` directly (no cast) so it works on SQLite, PostgreSQL, and MySQL.

---

## Resources (API Responses)

| Resource | Input | Output shape |
|----------|-------|-------------|
| `RestaurantResource` | `Restaurant` model | `{ id: public_id, name, cuisine_type, location, rating, is_active }` |
| `RestaurantCollection` | Paginated `Restaurant` collection | `{ data: [...], meta: { total, per_page, ... } }` |
| `AnalyticsSummaryResource` | Associative array from controller | Full analytics payload (see API reference) |
| `DailyMetricResource` | Row from `getDailyMetrics` | `{ date, order_count, revenue, avg_order_value }` |
| `LeaderboardResource` | Row from `getLeaderboard` | `{ id, name, ..., total_orders, total_revenue, avg_order_value, rank }` |

---

## Request Validation

### `AnalyticsRequest`

Validates the shared filter parameters used by all analytics endpoints:

```php
'date_from'  => 'nullable|date',
'date_to'    => 'nullable|date|after_or_equal:date_from',
'amount_min' => 'nullable|numeric|min:0',
'amount_max' => 'nullable|numeric|min:0|gte:amount_min',
'hour_from'  => 'nullable|integer|between:0,23',
'hour_to'    => 'nullable|integer|between:0,23',
```

The `filters()` method returns a clean array with `null` for missing values, so `AnalyticsService::baseQuery()` can safely check `!== null` without isset calls.

### `RestaurantIndexRequest`

Validates the catalog list parameters:

```php
'search'    => 'nullable|string|max:100',
'sort_by'   => 'nullable|in:name,rating,cuisine_type,created_at',
'direction' => 'nullable|in:asc,desc',
'per_page'  => 'nullable|integer|between:1,50',
```

---

## CORS

**File:** `config/cors.php`

```php
'allowed_origins' => ['*'],   // change this for production!
```

For production, replace `'*'` with your actual Vercel URL:

```php
'allowed_origins' => [
    'https://your-app.vercel.app',
],
```

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `APP_NAME` | `Laravel` | ✅ | Application name |
| `APP_ENV` | `local` | ✅ | `local` or `production` |
| `APP_KEY` | — | ✅ | 32-char encryption key — generate with `php artisan key:generate` |
| `APP_DEBUG` | `true` | ✅ | Set `false` in production |
| `APP_URL` | `http://localhost` | ✅ | Full URL of the backend |
| `DB_CONNECTION` | `sqlite` | ✅ | `sqlite` \| `pgsql` \| `mysql` |
| `DB_HOST` | `127.0.0.1` | pgsql/mysql | Database host |
| `DB_PORT` | `3306` | pgsql/mysql | Database port |
| `DB_DATABASE` | — | pgsql/mysql | Database name |
| `DB_USERNAME` | — | pgsql/mysql | Database user |
| `DB_PASSWORD` | — | pgsql/mysql | Database password |

---

## Available Artisan Commands

```bash
php artisan serve                     # Start dev server (http://localhost:8000)
php artisan migrate                   # Run all pending migrations
php artisan migrate:fresh             # Drop all tables and re-run migrations
php artisan db:seed                   # Seed restaurants + orders
php artisan migrate:fresh --seed      # Fresh DB + seed in one command
php artisan key:generate              # Generate APP_KEY
php artisan route:list                # Print all registered routes
php artisan config:cache              # Cache config (run in production)
php artisan route:cache               # Cache routes (run in production)
```

---

## Local Setup

**Prerequisites:** PHP 8.3+, Composer 2+

```bash
# 1. Navigate into the backend folder
cd backend

# 2. Install PHP dependencies
composer install

# 3. Create the environment file
cp .env.example .env

# 4. Generate the application key
php artisan key:generate

# 5. Run database migrations (creates database.sqlite automatically)
php artisan migrate

# 6. Seed sample data (4 restaurants, ~200 orders)
php artisan db:seed

# 7. Start the development server
php artisan serve
```

The API is now available at `http://localhost:8000`.

**Verify it's working:**
```bash
curl http://localhost:8000/api/v1/analytics/summary
```

Expected response:
```json
{"data":{"total_orders":200,"active_restaurants":4,"total_revenue":"117315.00","avg_order_value":"586.58"},"meta":{"filters":[]}}
```


