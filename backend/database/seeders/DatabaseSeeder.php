<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndUserSeeder::class,    // 1. Roles & Accounts (ADMIN, REGISTRAR, INSTRUCTOR, STUDENT)
            ProgramSeeder::class,        // 2. Degree Programs (BSIT, etc.)
            CourseSeeder::class,         // 3. Master Course List
            CurriculumSeeder::class,     // 4. Program <-> Course mappings
            AcademicTermSeeder::class,   // 5. Terms (e.g., 1st Sem 2026-2027)
            CourseOfferingSeeder::class, // 6. Sections assigned to Instructors
            StudentSeeder::class,        // 7. Student Records
            EnrollmentSeeder::class,     // 8. Student Enrollments
            GradeSeeder::class,          // 9. Enrolled Student Grades
        ]);
    }
}