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

        // Create Workshop in Cirebon
        $workshop = Workshop::create([
            'id' => Str::uuid(),
            'name' => 'Cirebon Motor Service',
            'address' => 'Jl. Kartini No. 12, Kejaksan, Kota Cirebon, Jawa Barat',
            'location' => '-6.7214,108.5583', // Example coordinates for Cirebon
            'photo' => 'https://res.cloudinary.com/duqgjefwh/image/upload/v1774685726/workshops/nelt44msr9cy6ofnj7hi.webp',
            'rating' => 4.8,
            'reviews_count' => 120,
            'category' => 'semua',
            'is_open' => true,
            'user_id' => $owner->id,
        ]);

        // Assign the mechanic account to this workshop
        $mechanic = User::where('email', 'mechanic@pitgo.com')->first();
        if ($mechanic) {
            $mechanic->update([
                'workshop_id' => $workshop->id
            ]);
        }
        
        // Optionally update the owner to have workshop_id too if needed by the app logic
        $owner->update([
            'workshop_id' => $workshop->id
        ]);
    }
}
