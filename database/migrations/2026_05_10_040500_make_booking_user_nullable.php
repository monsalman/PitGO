<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE bookings SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL");
        DB::statement('ALTER TABLE bookings ALTER COLUMN user_id SET NOT NULL');
    }
};
