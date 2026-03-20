<?php

namespace Database\Seeders;

use App\Models\Workshop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WorkshopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workshops = [
            [
                'name' => 'Bengkel Depok Jaya',
                'address' => 'Jl. Margonda Raya No.12, Depok',
                'location' => '-6.3912,106.8324',
                'rating' => 4.8,
                'reviews_count' => 56,
                'is_open' => true,
                'photo' => 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=400',
                'category' => 'mobil'
            ],
            [
                'name' => 'Auto Service Beji',
                'address' => 'Jl. Ridwan Rais No.45, Beji, Depok',
                'location' => '-6.3689,106.8245',
                'rating' => 4.5,
                'reviews_count' => 32,
                'is_open' => true,
                'photo' => 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=400',
                'category' => 'motor'
            ],
            [
                'name' => 'Mekanik Depok II',
                'address' => 'Jl. Proklamasi No.88, Sukmajaya, Depok',
                'location' => '-6.3855,106.8488',
                'rating' => 4.2,
                'reviews_count' => 12,
                'is_open' => false,
                'photo' => 'https://images.unsplash.com/photo-1487754180451-c456f719c141?auto=format&fit=crop&q=80&w=400',
                'category' => 'semua'
            ],
            [
                'name' => 'Cimanggis Auto Care',
                'address' => 'Jl. Raya Bogor KM 30, Cimanggis, Depok',
                'location' => '-6.3621,106.8654',
                'rating' => 4.9,
                'reviews_count' => 89,
                'is_open' => true,
                'photo' => 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=400',
                'category' => 'mobil'
            ],
            [
                'name' => 'PitGO Partner Sawangan',
                'address' => 'Jl. Raya Sawangan No.101, Sawangan, Depok',
                'location' => '-6.3956,106.7823',
                'rating' => 4.7,
                'reviews_count' => 44,
                'is_open' => true,
                'photo' => 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=400',
                'category' => 'semua'
            ],
        ];

        foreach ($workshops as $ws) {
            Workshop::updateOrCreate(
                ['name' => $ws['name']],
                [
                    'address' => $ws['address'],
                    'location' => $ws['location'],
                    'rating' => $ws['rating'],
                    'reviews_count' => $ws['reviews_count'],
                    'is_open' => $ws['is_open'],
                    'photo' => $ws['photo'],
                    'category' => $ws['category']
                ]
            );
        }
    }
}
