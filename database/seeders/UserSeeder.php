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
        // Admin Account
        User::create([
            'name' => 'Admin PitGO',
            'email' => 'admin@pitgo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '081234567890',
        ]);

        // Regular User Account
        User::create([
            'name' => 'John Doe',
            'email' => 'user@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '081234567891',
        ]);

        // Workshop Owner Account
        User::create([
            'name' => 'Budi Workshop',
            'email' => 'workshop@pitgo.com',
            'password' => Hash::make('password'),
            'role' => 'workshop',
            'phone' => '081234567892',
        ]);

        // Mechanic Account
        User::create([
            'name' => 'Agus Mekanik',
            'email' => 'mechanic@pitgo.com',
            'password' => Hash::make('password'),
            'role' => 'mechanic',
            'phone' => '081234567893',
        ]);
    }
}
