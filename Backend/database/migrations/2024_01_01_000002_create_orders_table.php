<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('restaurant_id')
                  ->constrained('restaurants')
                  ->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->timestampTz('ordered_at');
            $table->tinyInteger('order_hour')->unsigned();
            $table->date('order_date');
            $table->string('status', 50)->default('completed');
            $table->timestamps();
        });

        DB::statement('CREATE INDEX idx_orders_restaurant_date ON orders (restaurant_id, order_date)');
        DB::statement('CREATE INDEX idx_orders_amount ON orders (amount)');
        DB::statement('CREATE INDEX idx_orders_restaurant_date_amount ON orders (restaurant_id, order_date, amount)');
        DB::statement('CREATE INDEX idx_orders_hour ON orders (restaurant_id, order_hour)');
        DB::statement('CREATE INDEX idx_orders_date_amount ON orders (order_date, amount)');
        DB::statement('CREATE INDEX idx_orders_ordered_at ON orders (ordered_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
