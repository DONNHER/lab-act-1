<?php

namespace App\Http\Requests\Course;

use App\Http\Requests\IndexRequest;

class IndexCourseRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for courses.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['course_code', 'title', 'units', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for courses.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['status'];
    }
}
