<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_offering_id',
        'enrollment_date',
        'status',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'status' => 'string',
    ];

    /**
     * Get the student that the enrollment belongs to.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the course offering that the enrollment belongs to.
     */
    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class);
    }

    /**
     * Get the grade for the enrollment.
     */
    public function grade(): HasOne
    {
        return $this->hasOne(Grade::class);
    }
}
