<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->public_id,
            'name'         => $this->name,
            'cuisine_type' => $this->cuisine_type,
            'location'     => $this->location,
            'rating'       => (float) $this->rating,
            'is_active'    => $this->is_active,
            'created_at'   => $this->created_at?->toIso8601String(),
        ];
    }
}
