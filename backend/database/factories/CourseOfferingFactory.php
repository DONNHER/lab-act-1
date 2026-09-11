<?php

namespace Database\Factories;

use App\Models\CourseOffering;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseOffering>
 */
class CourseOfferingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => null, // Will be set by seeder
            'academic_term_id' => null, // Will be set by seeder
            'instructor_id' => null, // Will be set by seeder
            'section' => fake()->bothify('?-##'),
            'schedule' => fake()->optional()->sentence(),
            'room' => fake()->optional()->bothify('Room ###'),
            'capacity' => fake()->numberBetween(20, 50),
            'status' => 'OPEN',
        ];
    }

    /**
     * Create a closed offering.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CLOSED',
        ]);
    }

    /**
     * Create a cancelled offering.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CANCELLED',
        ]);
    }

    /**
     * Create a full offering (capacity 1).
     */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'capacity' => 1,
            'status' => 'OPEN',
        ]);
    }
}
