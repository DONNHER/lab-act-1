<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users and Programs (dependency order)
        $this->createUsersAndPrograms();
        
        // 2. Create Students, Courses, and Academic Terms
        $this->createStudentsCoursesAndTerms();
        
        // 3. Create Course Offerings
        $this->createCourseOfferings();
        
        // 4. Create Enrollments
        $this->createEnrollments();
        
        // 5. Create Grades
        $this->createGrades();
    }

    /**
     * Create users and programs.
     */
    private function createUsersAndPrograms(): void
    {
        // Create 3 programs
        $programs = Program::factory(3)->create();

        // Create 1 admin user
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        // Create 1 registrar user
        $registrar = User::factory()->registrar()->create([
            'name' => 'Registrar User',
            'email' => 'registrar@example.com',
        ]);

        // Create 2 instructor users
        $instructor1 = User::factory()->instructor()->create([
            'name' => 'Instructor One',
            'email' => 'instructor1@example.com',
        ]);
        $instructor2 = User::factory()->instructor()->create([
            'name' => 'Instructor Two',
            'email' => 'instructor2@example.com',
        ]);
        $instructors = collect([$instructor1, $instructor2]);

        // Create 2 student users (will be linked to student profiles later)
        $studentUser1 = User::factory()->student()->create([
            'name' => 'Student One',
            'email' => 'student1@example.com',
        ]);
        $studentUser2 = User::factory()->student()->create([
            'name' => 'Student Two',
            'email' => 'student2@example.com',
        ]);
        $studentUsers = collect([$studentUser1, $studentUser2]);

        // Store for later use
        $this->admin = $admin;
        $this->registrar = $registrar;
        $this->instructors = $instructors;
        $this->studentUsers = $studentUsers;
        $this->programs = $programs;
    }

    /**
     * Create students, courses, and academic terms.
     */
    private function createStudentsCoursesAndTerms(): void
    {
        // Create 2 academic terms (one OPEN, one PLANNED)
        $term1 = AcademicTerm::factory()->open()->create([
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
        ]);

        $term2 = AcademicTerm::factory()->create([
            'academic_year' => '2024-2025',
            'semester' => '2nd',
            'start_date' => '2025-01-15',
            'end_date' => '2025-05-15',
            'status' => 'PLANNED',
        ]);

        $this->terms = [$term1, $term2];

        // Create 20 courses
        $courses = Course::factory(20)->create();
        $this->courses = $courses;

        // Create 100 students
        // First 2 students linked to the student users created earlier
        $students = collect();
        
        // Create 2 students linked to the student users
        foreach ($this->studentUsers as $index => $user) {
            $student = Student::factory()->create([
                'user_id' => $user->id,
                'program_id' => $this->programs->random()->id,
            ]);
            $students->push($student);
        }

        // Create 98 more students without user accounts
        $moreStudents = Student::factory(98)->create([
            'program_id' => $this->programs->random()->id,
        ]);
        
        $students = $students->merge($moreStudents);
        $this->students = $students;
    }

    /**
     * Create course offerings.
     */
    private function createCourseOfferings(): void
    {
        $offerings = collect();
        
        // Create offerings for term 1 (OPEN term)
        foreach ($this->courses as $index => $course) {
            $instructor = $this->instructors[$index % count($this->instructors)];
            
            // Create at least one full offering (capacity 1)
            if ($index === 0) {
                $offering = CourseOffering::factory()->full()->create([
                    'course_id' => $course->id,
                    'academic_term_id' => $this->terms[0]->id,
                    'instructor_id' => $instructor->id,
                ]);
            } else {
                $offering = CourseOffering::factory()->create([
                    'course_id' => $course->id,
                    'academic_term_id' => $this->terms[0]->id,
                    'instructor_id' => $instructor->id,
                ]);
            }
            $offerings->push($offering);
        }

        // Create additional offerings to reach 20 total
        // Some for term 2, some for term 1 with different instructors
        $additionalCount = 20 - $offerings->count();
        for ($i = 0; $i < $additionalCount; $i++) {
            $course = $this->courses->random();
            $term = $this->terms[array_rand($this->terms)];
            $instructor = $this->instructors->random();
            
            $offering = CourseOffering::factory()->create([
                'course_id' => $course->id,
                'academic_term_id' => $term->id,
                'instructor_id' => $instructor->id,
            ]);
            $offerings->push($offering);
        }

        $this->offerings = $offerings;
    }

    /**
     * Create enrollments.
     */
    private function createEnrollments(): void
    {
        $enrollments = collect();
        $targetCount = 200;
        
        // Create enrollments ensuring we don't exceed capacity
        while ($enrollments->count() < $targetCount) {
            $student = $this->students->random();
            $offering = $this->offerings->random();
            
            // Check if student is already enrolled in this offering
            $exists = Enrollment::where('student_id', $student->id)
                ->where('course_offering_id', $offering->id)
                ->exists();
            
            if ($exists) {
                continue;
            }
            
            // Check capacity (count non-dropped enrollments)
            $occupiedSeats = Enrollment::where('course_offering_id', $offering->id)
                ->whereIn('status', ['ENROLLED', 'COMPLETED'])
                ->count();
            
            if ($occupiedSeats >= $offering->capacity) {
                continue;
            }
            
            // Check student is active
            if ($student->status !== 'ACTIVE') {
                continue;
            }
            
            // Check offering is open
            if ($offering->status !== 'OPEN') {
                continue;
            }
            
            // Check term is open
            if ($offering->academicTerm->status !== 'OPEN') {
                continue;
            }
            
            $enrollment = Enrollment::factory()->create([
                'student_id' => $student->id,
                'course_offering_id' => $offering->id,
            ]);
            $enrollments->push($enrollment);
        }
        
        $this->enrollments = $enrollments;
    }

    /**
     * Create grades.
     */
    private function createGrades(): void
    {
        $grades = collect();
        $targetCount = 100;
        
        // Get enrollments that are not dropped
        $eligibleEnrollments = $this->enrollments->where('status', '!=', 'DROPPED');
        
        // Create grades for up to 100 enrollments
        $enrollmentsToGrade = $eligibleEnrollments->take($targetCount);
        
        foreach ($enrollmentsToGrade as $enrollment) {
            $isPublished = fake()->boolean(60); // 60% published
            
            if ($isPublished) {
                $grade = Grade::factory()->published()->create([
                    'enrollment_id' => $enrollment->id,
                ]);
            } else {
                $grade = Grade::factory()->create([
                    'enrollment_id' => $enrollment->id,
                ]);
            }
            $grades->push($grade);
        }
        
        $this->grades = $grades;
    }
}
