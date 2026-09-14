<?php

namespace App\Policies;

use App\Models\Program;
use App\Models\User;

class ProgramPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Program $program): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
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
    public function update(User $user, Program $program): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Program $program): bool
    {
        return $user->role === 'ADMIN' || $user->role === 'REGISTRAR';
    }
}
