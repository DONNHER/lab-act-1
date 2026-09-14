<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
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
            'student_number' => ['required', 'string', 'max:255', 'unique:students,student_number'],
            'user_id' => ['nullable', 'exists:users,id', 'unique:students,user_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'program_id' => ['required', 'exists:programs,id'],
            'year_level' => ['required', 'integer', 'min:1', 'max:6'],
            'status' => ['required', 'in:ACTIVE,INACTIVE,GRADUATED'],
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
            'student_number.required' => 'Student number is required.',
            'student_number.unique' => 'The student number has already been taken.',
            'user_id.exists' => 'The selected user does not exist.',
            'user_id.unique' => 'This user is already linked to a student profile.',
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'email.email' => 'Email must be a valid email address.',
            'birth_date.before' => 'Birth date must be in the past.',
            'program_id.required' => 'Program is required.',
            'program_id.exists' => 'The selected program does not exist.',
            'year_level.required' => 'Year level is required.',
            'year_level.integer' => 'Year level must be an integer.',
            'year_level.min' => 'Year level must be at least 1.',
            'year_level.max' => 'Year level must not exceed 6.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be ACTIVE, INACTIVE, or GRADUATED.',
        ];
    }
}
