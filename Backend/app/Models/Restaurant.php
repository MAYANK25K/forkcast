<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Restaurant extends Model
{
    protected $fillable = [
        'public_id', 'name', 'cuisine_type', 'location', 'rating', 'is_active',
    ];

    protected $casts = [
        'rating'    => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // FIX: Removed 'id' from $hidden — the integer PK must remain accessible
    // for Eloquent joins (leaderboard, analytics). RestaurantResource exposes
    // public_id as 'id' in API responses so the integer id is never leaked.
    protected $hidden = [];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Restaurant $model) {
            if (empty($model->public_id)) {
                $model->public_id = (string) Str::uuid();
            }
        });
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'restaurant_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        // BUG FIX 1 — original used to_tsvector() which is PostgreSQL-only and
        // crashes on SQLite (the default DB: config/database.php defaults to sqlite).
        //
        // BUG FIX 2 — searching "S" returned Pasta Palace and Tandoori Treats because
        // '%S%' matches the letter anywhere in the string:
        //   "Pa-S-ta Palace"  → matches (s at position 3)
        //   "Sushi Bay"       → matches (S at start)
        //   "Tandoori Treat-S" → matches (s at end)
        //
        // The user expects starts-with behaviour (typing "S" should only show "Sushi Bay").
        // Fix: use 'term%' (no leading wildcard) so only names that begin with the
        // search term are returned. Works on SQLite, PostgreSQL, and MySQL.
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            // ILIKE = case-insensitive LIKE on PostgreSQL
            return $query->where('name', 'ILIKE', $term . '%');
        }

        // SQLite and MySQL: LIKE is case-insensitive for ASCII by default
        return $query->where('name', 'LIKE', $term . '%');
    }

    public function scopeSortBy(Builder $query, ?string $column, string $direction = 'asc'): Builder
    {
        $allowed = ['name', 'rating', 'cuisine_type', 'created_at'];
        $column  = in_array($column, $allowed, true) ? $column : 'name';
        $dir     = strtolower($direction) === 'desc' ? 'desc' : 'asc';
        return $query->orderBy($column, $dir);
    }
}
