<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get enrollments that are not dropped
        $eligibleEnrollments = Enrollment::where('status', '!=', 'DROPPED')->get();

        if ($eligibleEnrollments->isEmpty()) {
            $this->command->warn('No eligible enrollments found. Skipping GradeSeeder.');
            return;
        }

        $grades = collect();
        $targetCount = 100;

        // Create grades for up to 100 enrollments
        $enrollmentsToGrade = $eligibleEnrollments->take(100);

        foreach ($enrollmentsToGrade as $enrollment) {
            $isPublished = fake()->boolean(60); // 60% published

            // Generate realistic grades (70-100 range for passing grades)
            $midtermGrade = fake()->numberBetween(70, 100);
            $finalGrade = fake()->numberBetween(70, 100);

            if ($isPublished) {
                $grade = Grade::factory()->published()->create([
                    'enrollment_id' => $enrollment->id,
                    'midterm_grade' => $midtermGrade,
                    'final_grade' => $finalGrade,
                ]);
            } else {
                $grade = Grade::factory()->create([
                    'enrollment_id' => $enrollment->id,
                    'midterm_grade' => $midtermGrade,
                    'final_grade' => $finalGrade,
                ]);
            }
            $grades->push($grade);
        }

        $this->command->info('Grades seeded successfully! Total: ' . $grades->count());
    }
}
