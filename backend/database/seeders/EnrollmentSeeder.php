<?php

namespace Database\Seeders;

use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fetch only ACTIVE students
        $students = Student::where('status', 'ACTIVE')->get();

        // 2. Fetch OPEN offerings with OPEN academic terms and eager-load relationship
        $offerings = CourseOffering::with('academicTerm')
            ->where('status', 'OPEN')
            ->whereHas('academicTerm', fn ($query) => $query->where('status', 'OPEN'))
            ->get();

        if ($students->isEmpty()) {
            $this->command->warn('No active students found. Skipping EnrollmentSeeder.');
            return;
        }

        if ($offerings->isEmpty()) {
            $this->command->warn('No open course offerings found. Skipping EnrollmentSeeder.');
            return;
        }

        $targetCount = 200;
        $createdCount = 0;
        $maxAttempts = 1000; // Hard cap to prevent infinite loops
        $attempts = 0;

        while ($createdCount < $targetCount && $attempts < $maxAttempts) {
            $attempts++;

            // Pick random models in memory rather than querying DB
            $student = $students->random();
            $offering = $offerings->random();

            // Check duplicate enrollment
            $exists = Enrollment::where('student_id', $student->id)
                ->where('course_offering_id', $offering->id)
                ->exists();

            if ($exists) {
                continue;
            }

            // Check capacity
            $occupiedSeats = Enrollment::where('course_offering_id', $offering->id)
                ->whereIn('status', ['ENROLLED', 'COMPLETED'])
                ->count();

            if ($occupiedSeats >= $offering->capacity) {
                continue;
            }

            Enrollment::factory()->create([
                'student_id' => $student->id,
                'course_offering_id' => $offering->id,
            ]);

            $createdCount++;
        }

        if ($createdCount < $targetCount) {
            $this->command->warn("Seeded {$createdCount} enrollments (stopped after reaching max attempts due to capacity/student limits).");
        } else {
            $this->command->info("Enrollments seeded successfully! Total: {$createdCount}");
        }
    }
}
