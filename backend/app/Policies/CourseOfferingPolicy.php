<?php

namespace App\Policies;

use App\Models\CourseOffering;
use App\Models\User;

class CourseOfferingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CourseOffering $courseOffering): bool
    {
        // Admin and Registrar can view all offerings
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can view their own offerings
        if ($user->role === 'INSTRUCTOR') {
            return $courseOffering->instructor_id === $user->id;
        }

        // Student can view offerings they're enrolled in
        if ($user->role === 'STUDENT') {
            return $courseOffering->enrollments()
                ->where('student_id', $user->student?->id)
                ->exists();
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
    public function update(User $user, CourseOffering $courseOffering): bool
    {
        // Admin and Registrar can update all offerings
        if ($user->role === 'ADMIN' || $user->role === 'REGISTRAR') {
            return true;
        }

        // Instructor can update their own offerings (limited)
        if ($user->role === 'INSTRUCTOR') {
            return $courseOffering->instructor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CourseOffering $courseOffering): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }
}
