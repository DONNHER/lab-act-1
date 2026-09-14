<?php

namespace App\Http\Requests\AcademicTerm;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicTermRequest extends FormRequest
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
            'academic_year' => ['required', 'string', 'max:255', 'unique:academic_terms,academic_year,NULL,id,semester,'.$this->input('semester')],
            'semester' => ['required', 'in:1st,2nd,Summer'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'in:PLANNED,OPEN,CLOSED'],
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
            'academic_year.required' => 'Academic year is required.',
            'semester.required' => 'Semester is required.',
            'semester.in' => 'Semester must be 1st, 2nd, or Summer.',
            'start_date.required' => 'Start date is required.',
            'end_date.required' => 'End date is required.',
            'end_date.after' => 'End date must be after start date.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be PLANNED, OPEN, or CLOSED.',
        ];
    }
}
