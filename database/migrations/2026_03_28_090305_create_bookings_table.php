<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('workshop_id')->constrained()->onDelete('cascade');
            $table->enum('vehicle_type', ['motor', 'mobil']);
            $table->string('vehicle_brand');
            $table->string('vehicle_year')->nullable();
            $table->string('problem_category');
            $table->text('problem_description')->nullable();
            $table->string('user_location'); // lat,lng
            $table->text('user_address');
            $table->foreignUuid('mechanic_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('mechanic_location')->nullable(); // lat,lng
            $table->integer('estimated_cost_min')->nullable();
            $table->integer('estimated_cost_max')->nullable();
            $table->integer('final_cost')->nullable();
            $table->enum('status', [
                'pending', 
                'accepted', 
                'on_the_way', 
                'arrived', 
                'in_progress', 
                'completed', 
                'cancelled'
            ])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
