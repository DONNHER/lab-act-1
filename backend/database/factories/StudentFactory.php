<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hasEmail = fake()->boolean(70);
        $hasPhone = fake()->boolean(70);
        $hasAddress = fake()->boolean(50);
        $hasBirthDate = fake()->boolean(80);

        return [
            'student_number' => fake()->unique()->bothify('202?-#####'),
            'user_id' => null,
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'middle_name' => fake()->optional()->lastName(),
            'email' => $hasEmail ? fake()->unique()->safeEmail() : null,
            'phone' => $hasPhone ? fake()->phoneNumber() : null,
            'address' => $hasAddress ? fake()->address() : null,
            'birth_date' => $hasBirthDate ? fake()->dateTimeBetween('-25 years', '-16 years')->format('Y-m-d') : null,
            'program_id' => null, // Will be set by seeder
            'year_level' => fake()->numberBetween(1, 6),
            'status' => 'ACTIVE',
        ];
    }

    /**
     * Create an inactive student.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INACTIVE',
        ]);
    }

    /**
     * Create a graduated student.
     */
    public function graduated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'GRADUATED',
        ]);
    }
}
