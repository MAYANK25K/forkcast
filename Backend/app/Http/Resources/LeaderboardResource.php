<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'rank'            => (int)   $this->rank,
            'id'              => $this->public_id,
            'name'            => $this->name,
            'cuisine_type'    => $this->cuisine_type,
            'location'        => $this->location,
            'rating'          => (float) $this->rating,
            'total_orders'    => (int)   $this->total_orders,
            'total_revenue'   => (float) $this->total_revenue,
            'avg_order_value' => (float) $this->avg_order_value,
        ];
    }
}
