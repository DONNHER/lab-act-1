<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Revoke all tokens when user status changes to INACTIVE
        if ($user->isDirty('status') && $user->status === 'INACTIVE') {
            $user->tokens()->delete();
        }
    }
}
