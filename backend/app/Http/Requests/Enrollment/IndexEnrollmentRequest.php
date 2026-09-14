<?php

namespace App\Http\Requests\Enrollment;

use App\Http\Requests\IndexRequest;

class IndexEnrollmentRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for enrollments.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['enrollment_date', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for enrollments.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['student_id', 'course_offering_id', 'status'];
    }
}
