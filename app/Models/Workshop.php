<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workshop extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'address',
        'location',
        'photo',
        'rating',
        'reviews_count',
        'is_open',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviews_count' => 'integer',
        'is_open' => 'boolean',
    ];
}
