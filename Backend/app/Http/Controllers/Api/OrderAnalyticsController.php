<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnalyticsRequest;
use App\Http\Resources\AnalyticsSummaryResource;
use App\Http\Resources\LeaderboardResource;
use App\Models\Restaurant;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class OrderAnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    /**
     * BUG FIX: The original return type was `JsonResponse` but the method returned
     * `new AnalyticsSummaryResource(...)` which is a `JsonResource`, NOT a `JsonResponse`.
     * PHP 8 strict return-type enforcement threw a fatal TypeError on every request:
     *   "Return value must be of type JsonResponse, AnalyticsSummaryResource returned"
     * This was the root cause of the 500 error on every restaurant dashboard page.
     *
     * Fix: Change the return type to `JsonResource` which is what we actually return.
     * JsonResource implements Responsable so Laravel converts it to a proper HTTP response.
     */
    public function show(AnalyticsRequest $request, string $publicId): JsonResource
    {
        $restaurant = Restaurant::where(Str::isUuid($publicId) ? 'public_id' : 'id', $publicId)
            ->where('is_active', true)
            ->firstOrFail();

        $filters = $request->filters();
        $id      = $restaurant->id;

        $payload = [
            'restaurant'    => $restaurant,
            'summary'       => $this->analytics->getSummaryMetrics($id, $filters),
            'daily_metrics' => $this->analytics->getDailyMetrics($id, $filters),
            'peak_hours'    => $this->analytics->getPeakHourPerDay($id, $filters),
            'filters'       => $filters,
        ];

        return new AnalyticsSummaryResource($payload);
    }

    public function leaderboard(AnalyticsRequest $request): JsonResponse
    {
        $limit       = min((int) $request->input('limit', 3), 10);
        $leaderboard = $this->analytics->getLeaderboard($request->filters(), $limit);

        return response()->json([
            'data' => LeaderboardResource::collection($leaderboard),
            'meta' => ['limit' => $limit, 'filters' => $request->filters()],
        ]);
    }

    public function summary(AnalyticsRequest $request): JsonResponse
    {
        $summary = $this->analytics->getGlobalSummary($request->filters());

        return response()->json([
            'data' => [
                'total_orders'       => (int)   $summary->total_orders,
                'active_restaurants' => (int)   $summary->active_restaurants,
                'total_revenue'      => (float) $summary->total_revenue,
                'avg_order_value'    => (float) $summary->avg_order_value,
            ],
            'meta' => ['filters' => $request->filters()],
        ]);
    }
}
