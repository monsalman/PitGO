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

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
