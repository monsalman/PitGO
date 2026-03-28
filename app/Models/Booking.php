<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'workshop_id',
        'vehicle_type',
        'vehicle_brand',
        'vehicle_year',
        'problem_category',
        'problem_description',
        'user_location',
        'user_address',
        'mechanic_id',
        'mechanic_location',
        'estimated_cost_min',
        'estimated_cost_max',
        'final_cost',
        'status',
        'notes',
    ];

    protected $casts = [
        'estimated_cost_min' => 'integer',
        'estimated_cost_max' => 'integer',
        'final_cost' => 'integer',
    ];

    /**
     * Get the user who made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workshop that was booked.
     */
    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }

    /**
     * Get the mechanic assigned to the booking.
     */
    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }
}
