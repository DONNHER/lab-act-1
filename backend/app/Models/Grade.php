<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'midterm_grade',
        'final_grade',
        'remarks',
        'status',
    ];

    protected $casts = [
        'midterm_grade' => 'decimal:2',
        'final_grade' => 'decimal:2',
        'status' => 'string',
    ];

    /**
     * Get the enrollment that the grade belongs to.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}
