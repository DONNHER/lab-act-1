<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Curriculum extends Model
{
    protected $table = 'curriculum';

    protected $fillable = [
        'program_id',
        'course_id',
        'year_level',
        'semester',
        'category',
        'prerequisites',
        'units',
    ];

    protected $casts = [
        'prerequisites' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
