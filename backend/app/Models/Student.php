<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_number',
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'address',
        'birth_date',
        'program_id',
        'year_level',
        'status',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'year_level' => 'integer',
        'status' => 'string',
    ];

    /**
     * Get the program that the student belongs to.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the user account linked to the student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the enrollments for the student.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
