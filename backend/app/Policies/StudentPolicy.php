<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR' || $user->role === 'INSTRUCTOR';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Student $student): bool
    {
        // Admin and Registrar can view all students
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can view students enrolled in their offerings
        if ($user->role === 'INSTRUCTOR') {
            return $student->enrollments()
                ->whereHas('courseOffering', function ($query) use ($user) {
                    $query->where('instructor_id', $user->id);
                })
                ->exists();
        }

        // Student can only view their own profile
        if ($user->role === 'STUDENT') {
            return $student->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Student $student): bool
    {
        // Admin and Registrar can update all students
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Student can update their own profile (limited fields)
        if ($user->role === 'STUDENT') {
            return $student->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Student $student): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }
}
