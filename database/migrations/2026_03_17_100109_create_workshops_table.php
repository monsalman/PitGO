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
        Schema::create('workshops', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('address');
            $table->string('location')->nullable();
            $table->string('photo')->nullable();
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->integer('reviews_count')->default(0);
            $table->string('category')->default('semua'); // mobil, motor, semua
            $table->boolean('is_open')->default(true);
            $table->uuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // Add foreign key constraint to users table for workshop_id
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'workshop_id')) {
                $table->foreign('workshop_id')->references('id')->on('workshops')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'workshop_id')) {
                $table->dropForeign(['workshop_id']);
            }
        });
        Schema::dropIfExists('workshops');
    }
};
