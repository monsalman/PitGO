<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);
Route::get('/api/users', [AuthController::class, 'index']);
Route::post('/api/users', [AuthController::class, 'store']);
Route::put('/api/users/{id}', [AuthController::class, 'update']);
Route::delete('/api/users/{id}', [AuthController::class, 'destroy']);

use App\Http\Controllers\WorkshopController;
Route::get('/api/workshops', [WorkshopController::class, 'index']);
Route::post('/api/workshops', [WorkshopController::class, 'store']);
Route::put('/api/workshops/{workshop}', [WorkshopController::class, 'update']);
Route::delete('/api/workshops/{workshop}', [WorkshopController::class, 'destroy']);
Route::get('/api/geocode', [WorkshopController::class, 'geocodeApi']);
Route::get('/api/reverse-geocode', [WorkshopController::class, 'reverseGeocodeApi']);

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
