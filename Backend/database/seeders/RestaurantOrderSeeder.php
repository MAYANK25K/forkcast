<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class RestaurantOrderSeeder extends Seeder
{
    private const CHUNK_SIZE = 500;
    private const RESTAURANTS_FILE = 'data/restaurants.json';
    private const ORDERS_FILE = 'data/orders.json';

    public function run(): void
    {
        $this->command->info('🚀 Starting ETL seed...');

        DB::transaction(function () {
            $restaurantMap = $this->seedRestaurants();
            $this->seedOrders($restaurantMap);
        });

        $this->command->info('✅ ETL seed complete.');
    }

    private function seedRestaurants(): array
    {
        $raw = $this->readJson(self::RESTAURANTS_FILE);

        $now   = now()->toDateTimeString();
        $rows  = [];   // sourceId => row array
        $idMap = [];   // sourceId => internal DB id (filled after insert)

        foreach ($raw as $index => $item) {
            $sourceId = (string) $this->requireField($item, 'id', "restaurants[$index]");

            $rows[$sourceId] = [
                'public_id'    => (string) Str::uuid(),
                'name'         => $this->requireField($item, 'name', "restaurants[$index]"),
                'cuisine_type' => $item['cuisine_type'] ?? $item['cuisineType'] ?? null,
                'location'     => $item['location']     ?? $item['address']     ?? null,
                'rating'       => isset($item['rating']) ? $this->clampRating((float) $item['rating']) : 0.00,
                'is_active'    => true,
                'created_at'   => $now,
                'updated_at'   => $now,
            ];
        }

        if (empty($rows)) {
            throw new RuntimeException('restaurants.json produced zero valid records.');
        }

        // Wipe existing data
        DB::table('orders')->delete();
        DB::table('restaurants')->delete();

        // Bulk insert
        foreach (array_chunk(array_values($rows), self::CHUNK_SIZE) as $chunk) {
            DB::table('restaurants')->insert($chunk);
        }

        // Re-fetch inserted rows keyed by public_id so we can match them back
        $inserted = DB::table('restaurants')
            ->select('id', 'public_id')
            ->get()
            ->keyBy('public_id');   // public_id (string) => stdClass {id, public_id}

        // Build sourceId => internal integer PK map
        foreach ($rows as $sourceId => $rowData) {
            $publicId = $rowData['public_id'];
            if (isset($inserted[$publicId])) {
                $idMap[$sourceId] = (int) $inserted[$publicId]->id;
            }
        }

        $this->command->info(sprintf('  ✓ Inserted %d restaurants.', count($rows)));

        return $idMap;
    }

    private function seedOrders(array $restaurantMap): void
    {
        $raw     = $this->readJson(self::ORDERS_FILE);
        $rows    = [];
        $now     = now()->toDateTimeString();
        $skipped = 0;

        foreach ($raw as $index => $item) {
            $context = "orders[$index]";

            $sourceRestaurantId = (string) ($item['restaurant_id'] ?? $item['restaurantId'] ?? null);

            if ($sourceRestaurantId === '') {
                $this->warn("$context: missing restaurant reference — skipping.");
                $skipped++;
                continue;
            }

            $restaurantPk = $restaurantMap[$sourceRestaurantId] ?? null;
            if ($restaurantPk === null) {
                $this->warn("$context: unknown restaurant id '$sourceRestaurantId' — skipping.");
                $skipped++;
                continue;
            }

           $amount = filter_var(
    $item['amount'] ?? $item['order_amount'] ?? $item['total'] ?? null,
    FILTER_VALIDATE_FLOAT
);
            if ($amount === false || $amount < 0) {
                $this->warn("$context: invalid amount — skipping.");
                $skipped++;
                continue;
            }

            $orderedAt = $this->parseTimestamp(
    $item['ordered_at'] ?? $item['order_time'] ?? $item['orderedAt'] ?? $item['created_at'] ?? null,
                $context
            );
            if ($orderedAt === null) {
                $skipped++;
                continue;
            }

            $rows[] = [
                'public_id'     => (string) Str::uuid(),
                'restaurant_id' => $restaurantPk,
                'amount'        => round($amount, 2),
                'ordered_at'    => $orderedAt->toDateTimeString(),
                'order_hour'    => (int) $orderedAt->format('G'),
                'order_date'    => $orderedAt->toDateString(),
                'status'        => $this->normalizeStatus($item['status'] ?? 'completed'),
                'created_at'    => $now,
                'updated_at'    => $now,
            ];
        }

        if (empty($rows)) {
            throw new RuntimeException('orders.json produced zero valid records after validation.');
        }

        foreach (array_chunk($rows, self::CHUNK_SIZE) as $chunk) {
            DB::table('orders')->insert($chunk);
        }

        $this->command->info(sprintf('  ✓ Inserted %d orders. Skipped: %d.', count($rows), $skipped));
    }

    private function readJson(string $relativePath): array
    {
        $fullPath = database_path($relativePath);

        if (! file_exists($fullPath)) {
            throw new RuntimeException("JSON file not found: $fullPath");
        }

        $decoded = json_decode(file_get_contents($fullPath), associative: true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($decoded)) {
            throw new RuntimeException("$relativePath must be a JSON array.");
        }

        return $decoded;
    }

    private function requireField(array $item, string $field, string $context): mixed
    {
        $camel = \Illuminate\Support\Str::camel($field);
        $value = $item[$field] ?? $item[$camel] ?? null;

        if ($value === null || $value === '') {
            throw new RuntimeException("$context: required field '$field' is missing or empty.");
        }

        return $value;
    }

    private function parseTimestamp(mixed $value, string $context): ?Carbon
    {
        if ($value === null) {
            $this->warn("$context: missing timestamp — skipping.");
            return null;
        }

        try {
            if (is_numeric($value)) {
                return Carbon::createFromTimestamp((int) $value);
            }
            return Carbon::parse($value);
        } catch (\Exception $e) {
            $this->warn("$context: unparseable timestamp '$value' — skipping.");
            return null;
        }
    }

    private function clampRating(float $rating): float
    {
        return round(max(0.0, min(5.0, $rating)), 2);
    }

    private function normalizeStatus(string $status): string
    {
        return match (strtolower(trim($status))) {
            'completed', 'complete', 'done', 'paid' => 'completed',
            'pending', 'open'                        => 'pending',
            'cancelled', 'canceled', 'refunded'      => 'cancelled',
            default                                  => 'completed',
        };
    }

    private function warn(string $message): void
    {
        $this->command->warn("  ⚠ $message");
    }
}
