<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Program;
use App\Models\Course;
use App\Models\AcademicTerm;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;

$user = User::where('email', 'student1@example.com')->first();
echo "User: " . $user->id . ' ' . $user->name . ' ' . $user->email . "\n";

$student = Student::where('user_id', $user->id)->first();
if (!$student) {
    echo "No student record found\n";
    exit;
}

echo "Student: " . $student->id . " - " . $student->student_number . " - " . $student->first_name . " " . $student->last_name . "\n";
echo "Program: " . $student->program_id . " - Year: " . $student->year_level . "\n";

// Get BSIT program
$bsitProgram = Program::where('code', 'BSIT')->first();
echo "BSIT Program ID: " . ($bsitProgram ? $bsitProgram->id : 'NOT FOUND') . "\n";

// Get academic terms
$terms = AcademicTerm::where('academic_year', '2024-2025')->get();
foreach ($terms as $term) {
    echo "Term: " . $term->id . " - " . $term->academic_year . " " . $term->semester . " (" . $term->status . ")\n";
}

// Get courses for BSIT program
$courses = Course::where('status', 'ACTIVE')->get();
echo "Total courses: " . $courses->count() . "\n";

// Create course offerings for BSIT courses in 2024-2025 1st semester (OPEN term)
$term1 = AcademicTerm::where('academic_year', '2024-2025')->where('semester', '1st')->first();
$term2 = AcademicTerm::where('academic_year', '2024-2025')->where('semester', '2nd')->first();

echo "Term 1: " . ($term1 ? $term1->id : 'NOT FOUND') . "\n";
echo "Term 2: " . ($term2 ? $term2->id : 'NOT FOUND') . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors count: " . $instructors->count() . "\n";

// Create course offerings for BSIT courses
$bsitCourses = Course::where('status', 'ACTIVE')->take(8)->get();
echo "BSIT Courses count: " . $bsitCourses->count() . "\n";

foreach ($bsitCourses as $index => $course) {
    $instructor = $instructors[$index % $instructors->count()];
    
    // Create offering for term 1 (1st semester)
    $offering1 = \App\Models\CourseOffering::firstOrCreate([
        'course_id' => $course->id,
        'academic_term_id' => $term1->id,
        'instructor_id' => $instructor->id,
        'section' => 'A',
    ], [
        'schedule' => 'MWF 09:00-10:00',
        'room' => 'Room ' . (100 + $index),
        'capacity' => 40,
        'status' => 'OPEN',
    ]);
    
    // Create offering for term 2 (2nd semester)
    $offering2 = \App\Models\CourseOffering::firstOrCreate([
        'course_id' => $course->id,
        'academic_term_id' => $term2->id,
        'instructor_id' => $instructor->id,
        'section' => 'A',
    ], [
        'schedule' => 'MWF 10:00-11:00',
        'room' => 'Room ' . (200 + $index),
        'capacity' => 40,
        'status' => 'OPEN',
    ]);
    
    echo "Created offerings for course: " . $course->course_code . "\n";
}

// Enroll student in term 1 offerings
$offerings1 = \App\Models\CourseOffering::where('academic_term_id', $term1->id)->get();
foreach ($offerings1 as $offering) {
    $enrollment = \App\Models\Enrollment::firstOrCreate([
        'student_id' => $student->id,
        'course_offering_id' => $offering->id,
    ], [
        'enrollment_date' => '2024-08-01',
        'status' => 'ENROLLED',
    ]);
    
    // Create grades for enrolled courses
    $grade = \App\Models\Grade::firstOrCreate([
        'enrollment_id' => $enrollment->id,
    ], [
        'midterm_grade' => rand(80, 95),
        'final_grade' => rand(85, 98),
        'remarks' => 'Good performance',
        'status' => 'PUBLISHED',
    ]);
}

echo "Created enrollments and grades for term 1\n";

// Enroll student in term 2 offerings
$offerings2 = \App\Models\CourseOffering::where('academic_term_id', $term2->id)->get();
foreach ($offerings2 as $offering) {
    $enrollment = \App\Models\Enrollment::firstOrCreate([
        'student_id' => $student->id,
        'course_offering_id' => $offering->id,
    ], [
        'enrollment_date' => '2025-01-15',
        'status' => 'ENROLLED',
    ]);
    
    // Create grades for enrolled courses (some published, some draft)
    $grade = \App\Models\Grade::firstOrCreate([
        'enrollment_id' => $enrollment->id,
    ], [
        'midterm_grade' => rand(75, 90),
        'final_grade' => null,
        'remarks' => 'Midterm completed',
        'status' => 'DRAFT',
    ]);
}

echo "Created enrollments and grades for term 2\n";
echo "Done!\n";