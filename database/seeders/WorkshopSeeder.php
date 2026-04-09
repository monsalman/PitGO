<?php

namespace Database\Seeders;

use App\Models\User;
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
        // Get the workshop owner account
        $owner = User::where('email', 'workshop@pitgo.com')->first();

        if (!$owner) return;

        $workshopsData = [
            [
                'name' => 'PitStop Kemang',
                'address' => 'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan, Jakarta Selatan',
                'location' => '-6.2730,106.8150',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.9,
                'reviews_count' => 256,
                'category' => 'semua',
                'is_open' => true,
            ],
            [
                'name' => 'Kemang Auto Care',
                'address' => 'Jl. Kemang Selatan VIII No. 12, Jakarta Selatan',
                'location' => '-6.2815,106.8123',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.7,
                'reviews_count' => 128,
                'category' => 'mobil',
                'is_open' => true,
            ],
            [
                'name' => 'Bangka Motor Specialist',
                'address' => 'Jl. Bangka Raya No. 10, Pela Mampang, Jakarta Selatan',
                'location' => '-6.2580,106.8185',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.5,
                'reviews_count' => 89,
                'category' => 'motor',
                'is_open' => true,
            ],
            [
                'name' => 'Antasari Performance',
                'address' => 'Jl. Pangeran Antasari No. 22, Cilandak, Jakarta Selatan',
                'location' => '-6.2855,106.8050',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.8,
                'reviews_count' => 150,
                'category' => 'semua',
                'is_open' => true,
            ],
            [
                'name' => 'Dharmawangsa Premium Garage',
                'address' => 'Jl. Dharmawangsa VI No. 5, Kebayoran Baru, Jakarta Selatan',
                'location' => '-6.2530,106.8010',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.9,
                'reviews_count' => 320,
                'category' => 'mobil',
                'is_open' => true,
            ],
            [
                'name' => 'Cirebon Motor Service',
                'address' => 'Jl. Kartini No. 12, Kejaksan, Kota Cirebon, Jawa Barat',
                'location' => '-6.7214,108.5583',
                'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
                'rating' => 4.8,
                'reviews_count' => 120,
                'category' => 'semua',
                'is_open' => true,
            ],
        ];

        foreach ($workshopsData as $index => $data) {
            $workshop = Workshop::create(array_merge($data, [
                'id' => Str::uuid(),
                'user_id' => $owner->id, // Assigning all to the same owner for now
            ]));

            // Assign the first workshop to the mechanic and owner for sample association
            if ($index === 0) {
                $mechanic = User::where('email', 'mechanic@pitgo.com')->first();
                if ($mechanic) {
                    $mechanic->update(['workshop_id' => $workshop->id]);
                }
                $owner->update(['workshop_id' => $workshop->id]);
            }
        }
    }
}
