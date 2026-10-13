<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the BSIT program
        $bsitProgram = Program::where('code', 'BSIT')->first();
        
        if (!$bsitProgram) {
            $this->command->warn('BSIT program not found. Skipping student seeding.');
            return;
        }

        // Get student users
        $studentUsers = User::where('role', 'STUDENT')->get();
        
        if ($studentUsers->isEmpty()) {
            $this->command->warn('No student users found. Skipping student seeding.');
            return;
        }

        $studentData = [
            [
                'student_number' => '2024-00001',
                'first_name' => 'Juan',
                'last_name' => '',
                'middle_name' => null,
                'email' => 'student1@example.com',
                'phone' => '0917-123-4567',
                'address' => '123 Main St, Quezon City',
                'birth_date' => '2002-05-15',
                'program_id' => $bsitProgram->id,
                'year_level' => 4,
                'status' => 'ACTIVE',
            ],
            [
                'student_number' => '2024-00002',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Reyes',
                'email' => 'student2@example.com',
                'phone' => '0918-234-5678',
                'address' => '456 Oak Ave, Makati City',
                'birth_date' => '2001-08-22',
                'program_id' => $bsitProgram->id,
                'year_level' => 2,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($studentUsers as $index => $user) {
            if ($index >= count($studentData)) break;
            
            $data = $studentData[$index];
            $data['user_id'] = $user->id;
            
            Student::firstOrCreate(
                ['student_number' => $data['student_number']],
                $data
            );
        }

        $this->command->info('Students seeded successfully!');
    }
}
