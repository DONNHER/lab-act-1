<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_code',
        'title',
        'units',
        'description',
        'status',
    ];

    protected $casts = [
        'units' => 'decimal:2',
        'status' => 'string',
    ];

    /**
     * Get the course offerings for the course.
     */
    public function courseOfferings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
    }
}
