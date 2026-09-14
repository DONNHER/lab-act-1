<?php

namespace App\Http\Requests\AcademicTerm;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAcademicTermRequest extends FormRequest
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
        $termId = $this->route('academic_term')?->id ?? $this->route('id');

        return [
            'academic_year' => ['sometimes', 'required', 'string', 'max:255', 'unique:academic_terms,academic_year,'.$termId.',id,semester,'.$this->input('semester')],
            'semester' => ['sometimes', 'required', 'in:1st,2nd,Summer'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after:start_date'],
            'status' => ['sometimes', 'required', 'in:PLANNED,OPEN,CLOSED'],
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
            'semester.in' => 'Semester must be 1st, 2nd, or Summer.',
            'end_date.after' => 'End date must be after start date.',
            'status.in' => 'Status must be PLANNED, OPEN, or CLOSED.',
        ];
    }
}
