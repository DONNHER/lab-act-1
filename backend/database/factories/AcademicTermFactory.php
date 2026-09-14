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
        static $sequence = 0;
        $year = 2020 + ($sequence % 10);
        $semesters = ['1st', '2nd', 'Summer'];
        $semester = $semesters[$sequence % 3];
        $sequence++;

        return [
            'academic_year' => "{$year}-".($year + 1),
            'semester' => $semester,
            'start_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'end_date' => $this->faker->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
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
