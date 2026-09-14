<?php

namespace App\Http\Requests\Grade;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'exists:enrollments,id', 'unique:grades,enrollment_id'],
            'midterm_grade' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'final_grade' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'remarks' => ['nullable', 'string'],
            'status' => ['required', 'in:DRAFT,PUBLISHED'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'enrollment_id.required' => 'Enrollment is required.',
            'enrollment_id.exists' => 'The selected enrollment does not exist.',
            'enrollment_id.unique' => 'A grade already exists for this enrollment.',
            'midterm_grade.numeric' => 'Midterm grade must be a number.',
            'midterm_grade.min' => 'Midterm grade must be at least 0.',
            'midterm_grade.max' => 'Midterm grade must not exceed 100.',
            'final_grade.numeric' => 'Final grade must be a number.',
            'final_grade.min' => 'Final grade must be at least 0.',
            'final_grade.max' => 'Final grade must not exceed 100.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be DRAFT or PUBLISHED.',
        ];
    }
}
