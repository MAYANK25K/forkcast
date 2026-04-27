<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailyMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'date'            => $this->date,
            'order_count'     => (int)   $this->order_count,
            'revenue'         => (float) $this->revenue,
            'avg_order_value' => (float) $this->avg_order_value,
        ];
    }
}
