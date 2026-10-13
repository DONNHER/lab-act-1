<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseOfferingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get instructors
        $instructors = User::where('role', 'INSTRUCTOR')->get();
        
        if ($instructors->isEmpty()) {
            $this->command->warn('No instructors found. Skipping CourseOfferingSeeder.');
            return;
        }

        // Get academic terms
        $terms = AcademicTerm::all();
        
        if ($terms->isEmpty()) {
            $this->command->warn('No academic terms found. Skipping CourseOfferingSeeder.');
            return;
        }

        // Get courses
        $courses = Course::all();
        
        if ($courses->isEmpty()) {
            $this->command->warn('No courses found. Skipping CourseOfferingSeeder.');
            return;
        }

        $offerings = collect();
        $instructorCount = $instructors->count();

        // Create offerings for each term
        foreach (AcademicTerm::all() as $term) {
            // Create offerings for a subset of courses for each term
            $coursesForTerm = $courses->shuffle()->take(10);
            
            foreach ($coursesForTerm as $index => $course) {
                $instructor = $instructors[$index % $instructors->count()];
                
                $offering = CourseOffering::factory()->create([
                    'course_id' => $course->id,
                    'academic_term_id' => $term->id,
                    'instructor_id' => $instructor->id,
                    'section' => 'A',
                    'schedule' => 'MWF 08:00-09:30',
                    'room' => 'Room ' . (100 + $index),
                    'capacity' => 30,
                    'status' => 'OPEN',
                ]);
                
                $offerings->push($offering);
            }
        }

        // Create additional offerings to reach 20 total
        $additionalCount = 20 - $offerings->count();
        for ($i = 0; $i < $additionalCount; $i++) {
            $course = Course::inRandomOrder()->first();
            $term = AcademicTerm::inRandomOrder()->first();
            $instructor = User::where('role', 'INSTRUCTOR')->inRandomOrder()->first();

            $offering = CourseOffering::factory()->create([
                'course_id' => $course->id,
                'academic_term_id' => $term->id,
                'instructor_id' => $instructor->id,
                'section' => chr(65 + ($i % 3)), // A, B, C
                'schedule' => 'TTH 10:00-11:30',
                'room' => 'Room ' . (200 + $i),
                'capacity' => 30,
                'status' => 'OPEN',
            ]);
            
            $offerings->push($offering);
        }

        $this->command->info('Course Offerings seeded successfully! Total: ' . $offerings->count());
    }
}
