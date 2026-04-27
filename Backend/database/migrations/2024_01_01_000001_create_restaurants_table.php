<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('name', 150);
            $table->string('cuisine_type', 100)->nullable();
            $table->string('location', 255)->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->index('name');
        });

        DB::statement(
            "CREATE INDEX idx_restaurants_name_gin
             ON restaurants USING GIN (to_tsvector('english', name))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
