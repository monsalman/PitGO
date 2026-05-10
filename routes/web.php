<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);
Route::get('/api/users', [AuthController::class, 'index']);
Route::get('/api/mechanics', [AuthController::class, 'mechanics']);
Route::post('/api/users', [AuthController::class, 'store']);
Route::put('/api/users/{id}', [AuthController::class, 'update']);
Route::delete('/api/users/{id}', [AuthController::class, 'destroy']);

use App\Http\Controllers\WorkshopController;
Route::get('/api/workshops', [WorkshopController::class, 'index']);
Route::get('/api/workshops/search', [WorkshopController::class, 'search']);
Route::post('/api/workshops', [WorkshopController::class, 'store']);
Route::put('/api/workshops/{workshop}', [WorkshopController::class, 'update']);
Route::delete('/api/workshops/{workshop}', [WorkshopController::class, 'destroy']);
Route::get('/api/geocode', [WorkshopController::class, 'geocodeApi']);
Route::get('/api/reverse-geocode', [WorkshopController::class, 'reverseGeocodeApi']);

use App\Http\Controllers\BookingController;
Route::post('/api/bookings', [BookingController::class, 'store']);
Route::get('/api/bookings/{id}', [BookingController::class, 'show']);

Route::middleware('auth')->group(function () {
    Route::get('/api/bookings', [BookingController::class, 'index']);
    Route::put('/api/bookings/{id}/accept', [BookingController::class, 'accept']);
    Route::put('/api/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::put('/api/bookings/{id}/mechanic-location', [BookingController::class, 'updateMechanicLocation']);
    Route::put('/api/bookings/{id}/estimate', [BookingController::class, 'updateEstimate']);
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
