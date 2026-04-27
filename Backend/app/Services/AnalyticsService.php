<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    private function baseQuery(array $filters, ?int $restaurantId = null): \Illuminate\Database\Query\Builder
    {
        $query = DB::table('orders')->where('status', 'completed');

        if ($restaurantId !== null)        $query->where('restaurant_id', $restaurantId);
        if (!empty($filters['date_from'])) $query->where('order_date', '>=', $filters['date_from']);
        if (!empty($filters['date_to']))   $query->where('order_date', '<=', $filters['date_to']);
        if ($filters['amount_min'] !== null) $query->where('amount', '>=', $filters['amount_min']);
        if ($filters['amount_max'] !== null) $query->where('amount', '<=', $filters['amount_max']);
        if ($filters['hour_from'] !== null)  $query->where('order_hour', '>=', $filters['hour_from']);
        if ($filters['hour_to'] !== null)    $query->where('order_hour', '<=', $filters['hour_to']);

        return $query;
    }

    public function getDailyMetrics(int $restaurantId, array $filters): Collection
    {
        return $this->baseQuery($filters, $restaurantId)
            ->select([
                'order_date AS date',
                DB::raw('COUNT(id) AS order_count'),
                DB::raw('ROUND(SUM(amount), 2) AS revenue'),
                DB::raw('ROUND(AVG(amount), 2) AS avg_order_value'),
            ])
            ->groupBy('order_date')
            ->orderBy('order_date')
            ->get();
    }

    public function getSummaryMetrics(int $restaurantId, array $filters): object
    {
        $row = $this->baseQuery($filters, $restaurantId)
            ->select([
                DB::raw('COUNT(id) AS total_orders'),
                DB::raw('ROUND(SUM(amount), 2) AS total_revenue'),
                DB::raw('ROUND(AVG(amount), 2) AS avg_order_value'),
            ])
            ->first();

        return $row ?? (object) ['total_orders' => 0, 'total_revenue' => 0.00, 'avg_order_value' => 0.00];
    }

    public function getPeakHourPerDay(int $restaurantId, array $filters): Collection
    {
        // BUG FIX: The original used a raw CTE with RANK() OVER() — a window function
        // that is PostgreSQL-only and crashes on SQLite (which is the actual DB in use,
        // since config/database.php defaults to sqlite and database.sqlite exists).
        //
        // Replaced with pure Laravel query builder:
        //   Step 1 — count orders per (date, hour)
        //   Step 2 — find the max count per date
        //   Step 3 — join back to get the hour(s) that hit the max
        //   Step 4 — deduplicate ties by taking the first
        // This works identically on SQLite, PostgreSQL, and MySQL.

        $applyFilters = function ($q) use ($restaurantId, $filters) {
            $q->where('status', 'completed')
              ->where('restaurant_id', $restaurantId);
            if (!empty($filters['date_from']))    $q->where('order_date', '>=', $filters['date_from']);
            if (!empty($filters['date_to']))      $q->where('order_date', '<=', $filters['date_to']);
            if ($filters['amount_min'] !== null)  $q->where('amount', '>=', $filters['amount_min']);
            if ($filters['amount_max'] !== null)  $q->where('amount', '<=', $filters['amount_max']);
            if ($filters['hour_from'] !== null)   $q->where('order_hour', '>=', $filters['hour_from']);
            if ($filters['hour_to'] !== null)     $q->where('order_hour', '<=', $filters['hour_to']);
        };

        // Step 1: hourly counts
        $hourlySub = DB::table('orders')
            ->tap($applyFilters)
            ->select([
                'order_date',
                'order_hour',
                DB::raw('COUNT(id) AS order_count'),
            ])
            ->groupBy('order_date', 'order_hour');

        // Step 2: max count per date
        $maxSub = DB::table(DB::raw("({$hourlySub->toSql()}) AS h1"))
            ->mergeBindings($hourlySub)
            ->select(['order_date', DB::raw('MAX(order_count) AS max_count')])
            ->groupBy('order_date');

        // Step 3 + 4: join and deduplicate
        return DB::table(DB::raw("({$hourlySub->toSql()}) AS h2"))
            ->mergeBindings($hourlySub)
            ->joinSub($maxSub, 'm', function ($join) {
                $join->on('h2.order_date', '=', 'm.order_date')
                     ->on('h2.order_count', '=', 'm.max_count');
            })
            ->select([
                'h2.order_date AS date',
                'h2.order_hour AS peak_hour',
                'h2.order_count',
            ])
            ->orderBy('h2.order_date')
            ->get()
            ->unique('date')
            ->values();
    }

    public function getLeaderboard(array $filters, int $limit = 3): Collection
    {
        return $this->baseQuery($filters)
            ->join('restaurants', 'restaurants.id', '=', 'orders.restaurant_id')
            ->select([
                'restaurants.public_id',
                'restaurants.name',
                'restaurants.cuisine_type',
                'restaurants.location',
                'restaurants.rating',
                DB::raw('COUNT(orders.id) AS total_orders'),
                DB::raw('ROUND(SUM(orders.amount), 2) AS total_revenue'),
                DB::raw('ROUND(AVG(orders.amount), 2) AS avg_order_value'),
            ])
            ->groupBy([
                'restaurants.id',
                'restaurants.public_id',
                'restaurants.name',
                'restaurants.cuisine_type',
                'restaurants.location',
                'restaurants.rating',
            ])
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(function ($row, $index) {
                $row->rank = $index + 1;
                return $row;
            });
    }

    public function getGlobalSummary(array $filters): object
    {
        // BUG FIX: `CAST(COUNT(id) AS SIGNED)` is MySQL-only syntax.
        // It throws a syntax error on both SQLite and PostgreSQL, causing a 500
        // on the Overview page and making all 4 KPI cards blank.
        // Fix: COUNT() already returns an integer in every DB — no cast needed.
        $row = $this->baseQuery($filters)
            ->select([
                DB::raw('COUNT(id) AS total_orders'),
                DB::raw('COUNT(DISTINCT orders.restaurant_id) AS active_restaurants'),
                DB::raw('ROUND(SUM(amount), 2) AS total_revenue'),
                DB::raw('ROUND(AVG(orders.amount), 2) AS avg_order_value'),
            ])
            ->first();

        return $row ?? (object) [
            'total_orders'       => 0,
            'active_restaurants' => 0,
            'total_revenue'      => 0.00,
            'avg_order_value'    => 0.00,
        ];
    }
}
