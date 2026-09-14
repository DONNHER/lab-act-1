<?php

namespace App\Http\Requests\Grade;

use App\Http\Requests\IndexRequest;

class IndexGradeRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for grades.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['midterm_grade', 'final_grade', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for grades.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['enrollment_id', 'status'];
    }
}
