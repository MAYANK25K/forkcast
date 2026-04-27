<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'public_id', 'restaurant_id', 'amount', 'ordered_at',
        'order_hour', 'order_date', 'status',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'ordered_at' => 'datetime',
        'order_date' => 'date',
        'order_hour' => 'integer',
    ];

    protected $hidden = ['id', 'restaurant_id'];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Order $model) {
            if (empty($model->public_id)) {
                $model->public_id = (string) Str::uuid();
            }
        });
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id');
    }

    public function scopeForRestaurants(Builder $query, int|array $ids): Builder
    {
        return $query->whereIn('restaurant_id', (array) $ids);
    }

    public function scopeDateBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) $query->where('order_date', '>=', $from);
        if ($to)   $query->where('order_date', '<=', $to);
        return $query;
    }

    public function scopeAmountBetween(Builder $query, ?float $min, ?float $max): Builder
    {
        if ($min !== null) $query->where('amount', '>=', $min);
        if ($max !== null) $query->where('amount', '<=', $max);
        return $query;
    }

    public function scopeHourBetween(Builder $query, ?int $from, ?int $to): Builder
    {
        if ($from !== null) $query->where('order_hour', '>=', $from);
        if ($to !== null)   $query->where('order_hour', '<=', $to);
        return $query;
    }
}
