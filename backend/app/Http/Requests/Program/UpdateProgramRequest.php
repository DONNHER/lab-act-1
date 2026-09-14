<?php

namespace App\Http\Requests\Program;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProgramRequest extends FormRequest
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
        $programId = $this->route('program')?->id ?? $this->route('id');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:255', 'unique:programs,code,'.$programId],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:ACTIVE,INACTIVE'],
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
            'code.unique' => 'The program code has already been taken.',
            'status.in' => 'Status must be ACTIVE or INACTIVE.',
        ];
    }
}
