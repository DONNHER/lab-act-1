<?php

namespace App\Http\Requests\CourseOffering;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseOfferingRequest extends FormRequest
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
        $offeringId = $this->route('course_offering')?->id ?? $this->route('id');

        return [
            'course_id' => ['sometimes', 'required', 'exists:courses,id'],
            'academic_term_id' => ['sometimes', 'required', 'exists:academic_terms,id'],
            'instructor_id' => ['sometimes', 'required', 'exists:users,id'],
            'section' => ['sometimes', 'required', 'string', 'max:255'],
            'schedule' => ['nullable', 'string', 'max:255'],
            'room' => ['nullable', 'string', 'max:255'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['sometimes', 'required', 'in:OPEN,CLOSED,CANCELLED'],
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
            'course_id.exists' => 'The selected course does not exist.',
            'academic_term_id.exists' => 'The selected academic term does not exist.',
            'instructor_id.exists' => 'The selected instructor does not exist.',
            'capacity.integer' => 'Capacity must be an integer.',
            'capacity.min' => 'Capacity must be at least 1.',
            'status.in' => 'Status must be OPEN, CLOSED, or CANCELLED.',
        ];
    }
}
