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
        User::create([
            'name' => 'Admin PitGO',
            'email' => 'admin@pitgo.com',
            'phone' => '081234567890',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);
    }
}
