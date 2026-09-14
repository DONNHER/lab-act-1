<?php

namespace App\Http\Requests\User;

use App\Http\Requests\IndexRequest;

class IndexUserRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for users.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['name', 'email', 'role', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for users.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['role', 'status'];
    }
}
