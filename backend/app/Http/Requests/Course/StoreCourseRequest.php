<?php

namespace App\Http\Requests\Course;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
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
            'course_code' => ['required', 'string', 'max:255', 'unique:courses,course_code'],
            'title' => ['required', 'string', 'max:255'],
            'units' => ['required', 'numeric', 'min:0.01', 'max:99.99'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
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
            'course_code.required' => 'Course code is required.',
            'course_code.unique' => 'The course code has already been taken.',
            'title.required' => 'Course title is required.',
            'units.required' => 'Units is required.',
            'units.numeric' => 'Units must be a number.',
            'units.min' => 'Units must be at least 0.01.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ];
    }
}
