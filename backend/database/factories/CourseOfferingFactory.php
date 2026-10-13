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
        $sections = ['A', 'B', 'C', 'D', 'E', 'F'];
        $days = ['MWF', 'TTH', 'MW', 'TTHF', 'MTWTHF'];
        $times = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
        $rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Lab 1', 'Lab 2', 'Lab 3', 'Auditorium A', 'Auditorium B'];

        return [
            'course_id' => null, // Will be set by seeder
            'academic_term_id' => null, // Will be set by seeder
            'instructor_id' => null, // Will be set by seeder
            'section' => fake()->randomElement($sections) . '-' . fake()->numberBetween(1, 99),
            'schedule' => fake()->randomElement($days) . ' ' . fake()->randomElement($times),
            'room' => fake()->randomElement($rooms),
            'capacity' => fake()->randomElement([25, 30, 35, 40, 45, 50]),
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
