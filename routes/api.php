<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

// Health check endpoint for monitoring/load balancers
Route::get('/health', function () {
    try {
        // Test database connection
        DB::connection()->getPdo();
        
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => 'ok',
            ],
        ];
        
        return response()->json($health, 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'message' => $e->getMessage(),
            'timestamp' => now()->toIso8601String(),
        ], 503);
    }
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
