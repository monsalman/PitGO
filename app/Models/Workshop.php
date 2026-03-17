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
        'is_open',
    ];

    protected $casts = [
        'rating' => 'float',
        'is_open' => 'boolean',
    ];
}
