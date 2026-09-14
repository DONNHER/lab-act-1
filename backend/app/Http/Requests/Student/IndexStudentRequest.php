<?php

namespace App\Http\Requests\Student;

use App\Http\Requests\IndexRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class IndexStudentRequest extends IndexRequest
{
    /**
     * Get the allowed sort columns for students.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['student_number', 'first_name', 'last_name', 'year_level', 'status', 'created_at'];
    }

    /**
     * Get the allowed filter columns for students.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return ['program_id', 'year_level', 'status'];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        // Add specific validation for filter values
        $rules['year_level'] = ['sometimes', 'integer', 'min:1', 'max:6'];
        $rules['status'] = ['sometimes', 'string', Rule::in(['ACTIVE', 'INACTIVE', 'GRADUATED'])];
        $rules['program_id'] = ['sometimes', 'integer', 'exists:programs,id'];

        return $rules;
    }
}
