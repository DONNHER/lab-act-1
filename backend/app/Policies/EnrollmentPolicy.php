<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR' || $user->role === 'INSTRUCTOR' || $user->role === 'STUDENT';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Enrollment $enrollment): bool
    {
        // Load relationships if not already loaded
        $enrollment->loadMissing('courseOffering', 'student.user');

        // Admin and Registrar can view all enrollments
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can view enrollments in their offerings
        if ($user->role === 'INSTRUCTOR') {
            return $enrollment->courseOffering && $enrollment->courseOffering->instructor_id === $user->id;
        }

        // Student can view their own enrollments
        if ($user->role === 'STUDENT') {
            return $enrollment->student && $enrollment->student->user_id === $user->id;
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
    public function update(User $user, Enrollment $enrollment): bool
    {
        // Load relationships if not already loaded
        $enrollment->loadMissing('courseOffering', 'student.user');

        // Admin and Registrar can update all enrollments
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can update enrollments in their offerings (status changes)
        if ($user->role === 'INSTRUCTOR') {
            return $enrollment->courseOffering && $enrollment->courseOffering->instructor_id === $user->id;
        }

        // Student can drop their own enrollment
        if ($user->role === 'STUDENT') {
            return $enrollment->student && $enrollment->student->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Enrollment $enrollment): bool
    {
        // Load relationships if not already loaded
        $enrollment->loadMissing('courseOffering', 'student.user');

        // Admin and Registrar can drop any enrollment
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Student can drop their own enrollment
        if ($user->role === 'STUDENT') {
            return $enrollment->student && $enrollment->student->user_id === $user->id;
        }

        return false;
    }
}
