<?php

namespace App\Http\Requests\AcademicTerm;

use App\Http\Requests\IndexRequest;

class IndexAcademicTermRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for academic terms.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['academic_year', 'semester', 'start_date', 'end_date', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for academic terms.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['status'];
    }
}
