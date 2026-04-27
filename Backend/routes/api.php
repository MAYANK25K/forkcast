<?php

use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\OrderAnalyticsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('restaurants', [RestaurantController::class, 'index']);
    Route::get('restaurants/{publicId}', [RestaurantController::class, 'show']);
    Route::get('restaurants/{publicId}/analytics', [OrderAnalyticsController::class, 'show']);
    Route::get('analytics/leaderboard', [OrderAnalyticsController::class, 'leaderboard']);
    Route::get('analytics/summary',     [OrderAnalyticsController::class, 'summary']);
});
