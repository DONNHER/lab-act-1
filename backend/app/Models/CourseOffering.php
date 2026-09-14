<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseOffering extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'academic_term_id',
        'instructor_id',
        'section',
        'schedule',
        'room',
        'capacity',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'status' => 'string',
    ];

    /**
     * Get the course that the offering belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the academic term that the offering belongs to.
     */
    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    /**
     * Get the instructor for the offering.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the enrollments for the offering.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
