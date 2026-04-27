<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'restaurant'    => new RestaurantResource($this->resource['restaurant']),
            'summary'       => [
                'total_orders'    => (int)   $this->resource['summary']->total_orders,
                'total_revenue'   => (float) $this->resource['summary']->total_revenue,
                'avg_order_value' => (float) $this->resource['summary']->avg_order_value,
            ],
            'daily_metrics' => DailyMetricResource::collection(collect($this->resource['daily_metrics'])),
            'peak_hours'    => collect($this->resource['peak_hours'])->map(fn ($row) => [
                'date'        => $row->date,
                'peak_hour'   => (int) $row->peak_hour,
                'order_count' => (int) $row->order_count,
            ])->values(),
            'filters_applied' => $this->resource['filters'],
        ];
    }
}
