<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@pitgo.com'],
            [
                'name' => 'Admin PitGO',
                'phone' => '081234567890',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'salman@example.com'],
            [
                'name' => 'Salman',
                'phone' => '089512345678',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
