<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantIndexRequest;
use App\Http\Resources\RestaurantCollection;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class RestaurantController extends Controller
{
    public function index(RestaurantIndexRequest $request): RestaurantCollection
    {
        $restaurants = Restaurant::query()
            ->active()
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->search($request->input('search'));
            })
            ->when($request->filled('sort_by'), function ($query) use ($request) {
                $query->sortBy($request->input('sort_by'), $request->input('direction', 'asc'));
            })
            ->paginate($request->input('per_page', 20));

        return new RestaurantCollection($restaurants);
    }

    public function show(string $publicId): JsonResponse
    {
        // FIXED: Strictly query public_id if it's a UUID, otherwise query id.
        $restaurant = Restaurant::where(Str::isUuid($publicId) ? 'public_id' : 'id', $publicId)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json(['data' => new RestaurantResource($restaurant)]);
    }
}
