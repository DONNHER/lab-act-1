<?php

namespace App\Http\Requests\Program;

use App\Http\Requests\IndexRequest;

class IndexProgramRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for programs.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['code', 'name', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for programs.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['status'];
    }
}
