<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexRequest extends FormRequest
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
        $allowedSorts = $this->allowedSorts();
        $allowedFilters = $this->allowedFilters();

        $rules = [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'search' => ['sometimes', 'string', 'max:255'],
        ];

        // Add sort validation if allowed sorts are defined
        if (! empty($allowedSorts)) {
            $sortValues = array_merge($allowedSorts, array_map(fn ($s) => "-{$s}", $allowedSorts));
            $rules['sort'] = ['sometimes', 'string', Rule::in($sortValues)];
        } else {
            $rules['sort'] = ['sometimes', 'string'];
        }

        // Add filter validation for each allowed filter
        foreach ($allowedFilters as $filter) {
            $rules[$filter] = ['sometimes', 'string'];
        }

        return $rules;
    }

    /**
     * Get the allowed sort columns for this resource.
     * Override in child classes.
     *
     * @return array<string>
     */
    protected function allowedSorts(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }

    /**
     * Get the allowed filter columns for this resource.
     * Override in child classes.
     *
     * @return array<string>
     */
    protected function allowedFilters(): array
    {
        return [];
    }

    /**
     * Get validated sort parameter.
     */
    public function validatedSort(): ?array
    {
        $sort = $this->input('sort');

        if (! $sort) {
            return null;
        }

        $direction = 'asc';
        if (str_starts_with($sort, '-')) {
            $direction = 'desc';
            $sort = substr($sort, 1);
        }

        if (! in_array($sort, $this->allowedSorts(), true)) {
            return null;
        }

        return ['column' => $sort, 'direction' => $direction];
    }

    /**
     * Get validated filters.
     */
    public function validatedFilters(): array
    {
        $filters = [];
        $allowedFilters = $this->allowedFilters();

        foreach ($allowedFilters as $filter) {
            if ($this->has($filter)) {
                $filters[$filter] = $this->input($filter);
            }
        }

        return $filters;
    }

    /**
     * Get validated per_page with default.
     */
    public function validatedPerPage(int $default = 20): int
    {
        return min($this->integer('per_page', $default), 100);
    }

    /**
     * Get validated page with default.
     */
    public function validatedPage(int $default = 1): int
    {
        return max($this->integer('page', $default), 1);
    }

    /**
     * Get validated search term.
     */
    public function validatedSearch(): ?string
    {
        return $this->input('search');
    }
}
