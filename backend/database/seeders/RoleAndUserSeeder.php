<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create programs explicitly to avoid duplicates
        $programData = [
            ['code' => 'BSCS', 'name' => 'Bachelor of Science in Computer Science', 'description' => 'Comprehensive program covering computer science fundamentals, software development, algorithms, and data structures.'],
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'description' => 'Focuses on IT infrastructure, network administration, database management, and systems analysis.'],
            ['code' => 'BSIS', 'name' => 'Bachelor of Science in Information Systems', 'description' => 'Combines business and technology, focusing on systems analysis, design, and enterprise applications.'],
        ];

        foreach ($programData as $data) {
            Program::firstOrCreate(
                ['code' => $data['code']],
                array_merge($data, ['status' => 'ACTIVE'])
            );
        }

        // Create users explicitly to avoid duplicates
        $userData = [
            ['name' => 'Admin User', 'email' => 'admin@example.com', 'role' => 'ADMIN'],
            ['name' => 'Registrar User', 'email' => 'registrar@example.com', 'role' => 'REGISTRAR'],
            ['name' => 'Instructor One', 'email' => 'instructor1@example.com', 'role' => 'INSTRUCTOR'],
            ['name' => 'Instructor Two', 'email' => 'instructor2@example.com', 'role' => 'INSTRUCTOR'],
            ['name' => 'Student One', 'email' => 'student1@example.com', 'role' => 'STUDENT'],
            ['name' => 'Student Two', 'email' => 'student2@example.com', 'role' => 'STUDENT'],
        ];

        foreach ($userData as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                    'status' => 'ACTIVE',
                ])
            );
        }

        $this->command->info('Roles, Users, and Programs seeded successfully!');
    }
}
