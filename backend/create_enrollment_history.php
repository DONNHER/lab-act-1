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

// Get academic terms for 1st year to 3rd year
$terms = AcademicTerm::where('academic_year', 'like', '202%')->orderBy('start_date')->get();
foreach ($terms as $term) {
    echo "Term: " . $term->id . " - " . $term->academic_year . " " . $term->semester . " (" . $term->status . ")\n";
}

// Get courses for BSIT program (1st year to 3rd year courses)
$courses = Course::where('status', 'ACTIVE')->get();
echo "Total courses: " . $courses->count() . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors count: " . $instructors->count() . "\n";

// Create course offerings for 1st year to 3rd year
// 1st year courses (typically 100-level)
$firstYearCourses = Course::where('course_code', 'like', '%1%')->where('status', 'ACTIVE')->get();
echo "1st year courses: " . $firstYearCourses->count() . "\n";

// 2nd year courses (typically 200-level)
$secondYearCourses = Course::where('course_code', 'like', '%2%')->where('status', 'ACTIVE')->get();
echo "2nd year courses: " . $secondYearCourses->count() . "\n";

// 3rd year courses (typically 300-level)
$thirdYearCourses = Course::where('course_code', 'like', '%3%')->where('status', 'ACTIVE')->get();
echo "3rd year courses: " . $thirdYearCourses->count() . "\n";

// Get all terms for 1st to 3rd year (2022-2023, 2023-2024, 2024-2025)
$allTerms = AcademicTerm::where('academic_year', 'like', '202%')->orderBy('start_date')->get();
echo "Total terms: " . $allTerms->count() . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors: " . $instructors->count() . "\n";

// Create course offerings and enrollments for 1st year (2022-2023)
$terms2022 = AcademicTerm::where('academic_year', '2022-2023')->get();
echo "2022-2023 terms: " . $terms2022->count() . "\n";

// 2023-2024 terms
$terms2023 = AcademicTerm::where('academic_year', '2023-2024')->get();
echo "2023-2024 terms: " . $terms2023->count() . "\n";

// 2024-2025 terms (already exist)
$terms2024 = AcademicTerm::where('academic_year', '2024-2025')->get();
echo "2024-2025 terms: " . $terms2024->count() . "\n";

// Get all courses for BSIT
$bsitCourses = Course::where('status', 'ACTIVE')->get();
echo "Total courses: " . $bsitCourses->count() . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors: " . $instructors->count() . "\n";

// Create course offerings for 1st year (2022-2023)
echo "\n=== Creating 1st Year (2022-2023) Offerings ===\n";
$firstYearCourseCodes = ['CS101', 'CS102', 'IT101', 'MATH101', 'ENG101', 'STAT101'];
$firstYearCourses = Course::whereIn('course_code', $firstYearCourseCodes)->get();

$terms2022 = AcademicTerm::where('academic_year', '2022-2023')->get();
foreach ($terms2022 as $term) {
    foreach ($firstYearCourses as $index => $course) {
        $instructor = $instructors[$index % $instructors->count()];
        $section = chr(65 + ($index % 3)); // A, B, C
        
        $offering = \App\Models\CourseOffering::firstOrCreate([
            'course_id' => $course->id,
            'academic_term_id' => $term->id,
            'instructor_id' => $instructor->id,
            'section' => $section,
        ], [
            'schedule' => 'MWF 09:00-10:00',
            'room' => 'Room ' . (100 + $index),
            'capacity' => 40,
            'status' => 'OPEN',
        ]);
        
        // Enroll student
        $enrollment = \App\Models\Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_offering_id' => $offering->id,
        ], [
            'enrollment_date' => $term->start_date,
            'status' => 'COMPLETED',
        ]);
        
        // Create grades
        $midterm = rand(80, 95);
        $final = rand(85, 98);
        $grade = \App\Models\Grade::firstOrCreate([
            'enrollment_id' => $enrollment->id,
        ], [
            'midterm_grade' => $midterm,
            'final_grade' => $final,
            'remarks' => 'Good performance',
            'status' => 'PUBLISHED',
        ]);
        
        echo "Enrolled in " . $course->course_code . " " . $term->semester . " - Grade: " . $midterm . "/" . $final . "\n";
    }
}

// 2nd Year (2023-2024)
echo "\n=== Creating 2nd Year (2023-2024) Offerings ===\n";
$secondYearCourseCodes = ['CS201', 'CS202', 'IT201', 'IT202', 'BUS201', 'BUS202', 'MATH102', 'STAT101'];
$secondYearCourses = Course::whereIn('course_code', $secondYearCourseCodes)->get();

$terms2023 = AcademicTerm::where('academic_year', '2023-2024')->get();
foreach ($terms2023 as $term) {
    foreach ($secondYearCourses as $index => $course) {
        $instructor = $instructors[$index % $instructors->count()];
        $section = chr(65 + ($index % 3));
        
        $offering = \App\Models\CourseOffering::firstOrCreate([
            'course_id' => $course->id,
            'academic_term_id' => $term->id,
            'instructor_id' => $instructor->id,
            'section' => $section,
        ], [
            'schedule' => 'MWF 10:00-11:00',
            'room' => 'Room ' . (200 + $index),
            'capacity' => 40,
            'status' => 'OPEN',
        ]);
        
        $enrollment = \App\Models\Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_offering_id' => $offering->id,
        ], [
            'enrollment_date' => $term->start_date,
            'status' => 'COMPLETED',
        ]);
        
        $midterm = rand(80, 95);
        $final = rand(85, 98);
        $grade = \App\Models\Grade::firstOrCreate([
            'enrollment_id' => $enrollment->id,
        ], [
            'midterm_grade' => $midterm,
            'final_grade' => $final,
            'remarks' => 'Good performance',
            'status' => 'PUBLISHED',
        ]);
        
        echo "Enrolled in " . $course->course_code . " " . $term->semester . " - Grade: " . $midterm . "/" . $final . "\n";
    }
}

// 3rd Year (2024-2025) - 1st semester already exists, add 2nd semester
echo "\n=== Creating 3rd Year 2nd Semester (2024-2025 2nd) Offerings ===\n";
$thirdYearCourseCodes = ['CS301', 'CS302', 'IT301', 'IT302', 'BUS301', 'BUS302'];
$thirdYearCourses = Course::whereIn('course_code', $thirdYearCourseCodes)->get();

$term2024_2nd = AcademicTerm::where('academic_year', '2024-2025')->where('semester', '2nd')->first();
if ($term2024_2nd) {
    foreach ($thirdYearCourses as $index => $course) {
        $instructor = $instructors[$index % $instructors->count()];
        $section = chr(65 + ($index % 3));
        
        $offering = \App\Models\CourseOffering::firstOrCreate([
            'course_id' => $course->id,
            'academic_term_id' => $term2024_2nd->id,
            'instructor_id' => $instructor->id,
            'section' => $section,
        ], [
            'schedule' => 'MWF 13:00-14:00',
            'room' => 'Room ' . (300 + $index),
            'capacity' => 40,
            'status' => 'OPEN',
        ]);
        
        $enrollment = \App\Models\Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_offering_id' => $offering->id,
        ], [
            'enrollment_date' => $term2024_2nd->start_date,
            'status' => 'ENROLLED',
        ]);
        
        $midterm = rand(80, 95);
        $final = null; // Not yet finalized
        $grade = \App\Models\Grade::firstOrCreate([
            'enrollment_id' => $enrollment->id,
        ], [
            'midterm_grade' => $midterm,
            'final_grade' => $final,
            'remarks' => 'Midterm completed',
            'status' => 'DRAFT',
        ]);
        
        echo "Enrolled in " . $course->course_code . " 2nd semester - Midterm: " . $midterm . "\n";
    }
}

echo "\nDone! Student now has enrollment history from 1st year to 3rd year.\n";