<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $itPrograms = [
            ['code' => 'BSCS', 'name' => 'Bachelor of Science in Computer Science', 'description' => 'Comprehensive program covering computer science fundamentals, software development, algorithms, and data structures.'],
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'description' => 'Focuses on IT infrastructure, network administration, database management, and systems analysis.'],
            ['code' => 'BSIS', 'name' => 'Bachelor of Science in Information Systems', 'description' => 'Combines business and technology, focusing on systems analysis, design, and enterprise applications.'],
            ['code' => 'BSCpE', 'name' => 'Bachelor of Science in Computer Engineering', 'description' => 'Integrates computer science and electrical engineering, covering hardware, software, and embedded systems.'],
            ['code' => 'BSDS', 'name' => 'Bachelor of Science in Data Science', 'description' => 'Covers statistics, machine learning, data visualization, and big data analytics.'],
            ['code' => 'BSCyS', 'name' => 'Bachelor of Science in Cybersecurity', 'description' => 'Focuses on network security, cryptography, ethical hacking, and digital forensics.'],
            ['code' => 'BSAI', 'name' => 'Bachelor of Science in Artificial Intelligence', 'description' => 'Specializes in machine learning, neural networks, natural language processing, and AI applications.'],
            ['code' => 'BSGD', 'name' => 'Bachelor of Science in Game Development', 'description' => 'Covers game design, graphics programming, physics engines, and interactive media.'],
            ['code' => 'MSCS', 'name' => 'Master of Science in Computer Science', 'description' => 'Advanced studies in algorithms, distributed systems, and computer science research.'],
            ['code' => 'MSIT', 'name' => 'Master of Science in Information Technology', 'description' => 'Graduate program focusing on IT management, enterprise architecture, and emerging technologies.'],
        ];

        // Pick a random program from the list
        $program = $this->faker->randomElement($itPrograms);
        $baseCode = $program['code'];

        // Generate a unique code by appending a random suffix
        // Use faker's unique() to ensure uniqueness across all factory calls
        $uniqueCode = $this->faker->unique()->lexify($baseCode . '-???');

        return [
            'code' => $uniqueCode,
            'name' => $program['name'],
            'description' => $program['description'],
            'status' => 'ACTIVE',
        ];
    }

    /**
     * Create an inactive program.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INACTIVE',
        ]);
    }
}
