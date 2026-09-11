<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_code' => fake()->unique()->bothify('???-###'),
            'title' => fake()->unique()->words(4, true),
            'units' => fake()->randomFloat(2, 1, 5),
            'description' => fake()->optional()->paragraph(),
            'status' => 'ACTIVE',
        ];
    }

    /**
     * Create an inactive course.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INACTIVE',
        ]);
    }
}
