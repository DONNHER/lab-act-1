<?php

namespace App\Http\Requests\Enrollment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEnrollmentRequest extends FormRequest
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
        $enrollmentId = $this->route('enrollment')?->id ?? $this->route('id');

        return [
            'student_id' => ['sometimes', 'required', 'exists:students,id'],
            'course_offering_id' => ['sometimes', 'required', 'exists:course_offerings,id'],
            'enrollment_date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', 'in:ENROLLED,DROPPED,COMPLETED'],
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
            'student_id.exists' => 'The selected student does not exist.',
            'course_offering_id.exists' => 'The selected course offering does not exist.',
            'status.in' => 'Status must be ENROLLED, DROPPED, or COMPLETED.',
        ];
    }
}
