<?php

namespace App\Policies;

use App\Models\Grade;
use App\Models\User;

class GradePolicy
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
    public function view(User $user, Grade $grade): bool
    {
        // Admin and Registrar can view all grades
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can view grades for their offerings
        if ($user->role === 'INSTRUCTOR') {
            return $grade->enrollment->courseOffering->instructor_id === $user->id;
        }

        // Student can view their own published grades
        if ($user->role === 'STUDENT') {
            return $grade->enrollment->student->user_id === $user->id && $grade->status === 'PUBLISHED';
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR' || $user->role === 'INSTRUCTOR';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Grade $grade): bool
    {
        // Admin and Registrar can update all grades
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can update grades for their offerings
        if ($user->role === 'INSTRUCTOR') {
            return $grade->enrollment->courseOffering->instructor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Grade $grade): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }
}
