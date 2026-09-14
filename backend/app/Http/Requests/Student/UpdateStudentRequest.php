<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
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
        $studentId = $this->route('student')?->id ?? $this->route('id');

        return [
            'student_number' => ['sometimes', 'required', 'string', 'max:255', 'unique:students,student_number,'.$studentId],
            'user_id' => ['nullable', 'exists:users,id', 'unique:students,user_id,'.$studentId],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'program_id' => ['sometimes', 'required', 'exists:programs,id'],
            'year_level' => ['sometimes', 'required', 'integer', 'min:1', 'max:6'],
            'status' => ['sometimes', 'required', 'in:ACTIVE,INACTIVE,GRADUATED'],
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
            'student_number.unique' => 'The student number has already been taken.',
            'user_id.exists' => 'The selected user does not exist.',
            'user_id.unique' => 'This user is already linked to a student profile.',
            'email.email' => 'Email must be a valid email address.',
            'birth_date.before' => 'Birth date must be in the past.',
            'program_id.exists' => 'The selected program does not exist.',
            'year_level.integer' => 'Year level must be an integer.',
            'year_level.min' => 'Year level must be at least 1.',
            'year_level.max' => 'Year level must not exceed 6.',
            'status.in' => 'Status must be ACTIVE, INACTIVE, or GRADUATED.',
        ];
    }
}
