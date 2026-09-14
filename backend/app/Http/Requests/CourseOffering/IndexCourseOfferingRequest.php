<?php

namespace App\Http\Requests\CourseOffering;

use App\Http\Requests\IndexRequest;

class IndexCourseOfferingRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for course offerings.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['section', 'capacity', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for course offerings.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['course_id', 'academic_term_id', 'instructor_id', 'status'];
    }
}
