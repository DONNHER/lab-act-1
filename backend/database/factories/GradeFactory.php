<?php

namespace Database\Factories;

use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Grade>
 */
class GradeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'enrollment_id' => null, // Will be set by seeder
            'midterm_grade' => fake()->optional()->randomFloat(2, 0, 100),
            'final_grade' => fake()->optional()->randomFloat(2, 0, 100),
            'remarks' => fake()->optional()->sentence(),
            'status' => 'DRAFT',
        ];
    }

    /**
     * Create a published grade.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PUBLISHED',
            'final_grade' => $attributes['final_grade'] ?? fake()->randomFloat(2, 75, 100),
        ]);
    }

    /**
     * Create a failing grade.
     */
    public function failing(): static
    {
        return $this->state(fn (array $attributes) => [
            'final_grade' => fake()->randomFloat(2, 0, 74),
        ]);
    }

    /**
     * Create a passing grade.
     */
    public function passing(): static
    {
        return $this->state(fn (array $attributes) => [
            'final_grade' => fake()->randomFloat(2, 75, 100),
        ]);
    }
}
