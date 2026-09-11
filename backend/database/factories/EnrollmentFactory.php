<?php

namespace Database\Factories;

use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => null, // Will be set by seeder
            'course_offering_id' => null, // Will be set by seeder
            'enrollment_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'status' => 'ENROLLED',
        ];
    }

    /**
     * Create a dropped enrollment.
     */
    public function dropped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'DROPPED',
        ]);
    }

    /**
     * Create a completed enrollment.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'COMPLETED',
        ]);
    }
}
