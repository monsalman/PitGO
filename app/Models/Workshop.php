<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Workshop extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Get the bookings for this workshop.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the owner (workshop role user) of this workshop.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the mechanics that belong to this workshop.
     */
    public function mechanics(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'mechanic');
    }

    protected $fillable = [
        'name',
        'address',
        'location',
        'photo',
        'rating',
        'reviews_count',
        'is_open',
        'category',
        'user_id',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviews_count' => 'integer',
        'is_open' => 'boolean',
    ];
}
