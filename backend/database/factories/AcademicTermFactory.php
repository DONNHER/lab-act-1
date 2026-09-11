<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicTerm>
 */
class AcademicTermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = fake()->numberBetween(2020, 2026);
        $semester = fake()->randomElement(['1st', '2nd', 'Summer']);
        
        return [
            'academic_year' => "{$year}-" . ($year + 1),
            'semester' => $semester,
            'start_date' => fake()->dateTimeBetween("-1 year", "now")->format('Y-m-d'),
            'end_date' => fake()->dateTimeBetween("now", "+1 year")->format('Y-m-d'),
            'status' => 'PLANNED',
        ];
    }

    /**
     * Create an open term.
     */
    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'OPEN',
        ]);
    }

    /**
     * Create a closed term.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CLOSED',
        ]);
    }
}
