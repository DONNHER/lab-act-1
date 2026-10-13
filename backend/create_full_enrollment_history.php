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

// Create academic terms for 2022-2023, 2023-2024, 2024-2025
$termsData = [
    ['academic_year' => '2022-2023', 'semester' => '1st', 'start_date' => '2022-08-01', 'end_date' => '2022-12-15', 'status' => 'CLOSED'],
    ['academic_year' => '2022-2023', 'semester' => '2nd', 'start_date' => '2023-01-15', 'end_date' => '2023-05-15', 'status' => 'CLOSED'],
    ['academic_year' => '2023-2024', 'semester' => '1st', 'start_date' => '2023-08-01', 'end_date' => '2023-12-15', 'status' => 'CLOSED'],
    ['academic_year' => '2023-2024', 'semester' => '2nd', 'start_date' => '2024-01-15', 'end_date' => '2024-05-15', 'status' => 'CLOSED'],
    ['academic_year' => '2024-2025', 'semester' => '1st', 'start_date' => '2024-08-01', 'end_date' => '2024-12-15', 'status' => 'OPEN'],
    ['academic_year' => '2024-2025', 'semester' => '2nd', 'start_date' => '2025-01-15', 'end_date' => '2025-05-15', 'status' => 'PLANNED'],
];

$terms = [];
foreach ($termsData as $termData) {
    $term = AcademicTerm::firstOrCreate(
        ['academic_year' => $termData['academic_year'], 'semester' => $termData['semester']],
        array_merge($termData, ['status' => $termData['status']])
    );
    $terms[] = $term;
    echo "Term: " . $term->academic_year . " " . $term->semester . " (" . $term->status . ")\n";
}

// Get BSIT program
$bsitProgram = Program::where('code', 'BSIT')->first();
echo "BSIT Program ID: " . ($bsitProgram ? $bsitProgram->id : 'NOT FOUND') . "\n";

// Get all courses for BSIT program
$courses = Course::where('status', 'ACTIVE')->get();
echo "Total courses: " . $courses->count() . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors count: " . $instructors->count() . "\n";

// Define course codes by year level
$firstYearCourseCodes = ['CS101', 'CS102', 'IT101', 'MATH101', 'ENG101', 'STAT101'];
$secondYearCourseCodes = ['CS201', 'CS202', 'IT201', 'IT202', 'BUS201', 'BUS202', 'MATH102', 'STAT101'];
$thirdYearCourseCodes = ['CS301', 'CS302', 'IT301', 'IT302', 'BUS301', 'BUS302'];

$firstYearCourses = Course::whereIn('course_code', $firstYearCourseCodes)->get();
$secondYearCourses = Course::whereIn('course_code', $secondYearCourseCodes)->get();
$thirdYearCourses = Course::whereIn('course_code', $thirdYearCourseCodes)->get();

echo "1st year courses: " . $firstYearCourses->count() . "\n";
echo "2nd year courses: " . $secondYearCourses->count() . "\n";
echo "3rd year courses: " . $thirdYearCourses->count() . "\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Instructors: " . $instructors->count() . "\n";

// Get terms by year
$terms2022 = AcademicTerm::where('academic_year', '2022-2023')->get();
$terms2023 = AcademicTerm::where('academic_year', '2023-2024')->get();
$terms2024 = AcademicTerm::where('academic_year', '2024-2025')->get();

echo "2022-2023 terms: " . $terms2022->count() . "\n";
echo "2023-2024 terms: " . $terms2023->count() . "\n";
echo "2024-2025 terms: " . $terms2024->count() . "\n";

// Get student
$user = User::where('email', 'student1@example.com')->first();
$student = Student::where('user_id', $user->id)->first();

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();

// Helper function to create offering and enrollment
function createOfferingAndEnrollment($course, $term, $instructor, $section, $student, $schedule, $room, $capacity, $status, $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus) {
    $offering = \App\Models\CourseOffering::firstOrCreate([
        'course_id' => $course->id,
        'academic_term_id' => $term->id,
        'instructor_id' => $instructor->id,
        'section' => $section,
    ], [
        'schedule' => $schedule,
        'room' => $room,
        'capacity' => $capacity,
        'status' => $status,
    ]);
    
    $enrollment = \App\Models\Enrollment::firstOrCreate([
        'student_id' => $student->id,
        'course_offering_id' => $offering->id,
    ], [
        'enrollment_date' => $term->start_date,
        'status' => $enrollmentStatus,
    ]);
    
    $grade = \App\Models\Grade::firstOrCreate([
        'enrollment_id' => $enrollment->id,
    ], [
        'midterm_grade' => $midtermGrade,
        'final_grade' => $finalGrade,
        'remarks' => $gradeStatus === 'PUBLISHED' ? 'Good performance' : 'Midterm completed',
        'status' => $gradeStatus,
    ]);
    
    echo "Enrolled in " . $course->course_code . " " . $term->semester . " " . $term->academic_year . " - Grade: " . $midtermGrade . "/" . ($finalGrade ?? 'N/A') . " (" . $gradeStatus . ")\n";
}

// 1st Year (2022-2023)
echo "\n=== Creating 1st Year (2022-2023) Offerings ===\n";
$firstYearCourseCodes = ['CS101', 'CS102', 'IT101', 'MATH101', 'ENG101', 'STAT101'];
$firstYearCourses = Course::whereIn('course_code', $firstYearCourseCodes)->get();

$terms2022 = AcademicTerm::where('academic_year', '2022-2023')->get();
foreach ($terms2022 as $term) {
    foreach ($firstYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
        $section = chr(65 + ($index % 3));
        
        $schedule = $term->semester === '1st' ? 'MWF 09:00-10:00' : 'TTH 10:00-11:30';
        $room = 'Room ' . (100 + $index);
        $enrollmentStatus = 'COMPLETED';
        $midtermGrade = rand(80, 95);
        $finalGrade = rand(85, 98);
        $gradeStatus = 'PUBLISHED';
        
        createOfferingAndEnrollment(
            $course, $term, $instructors[$index % count($instructors)], 
            $section, $student, $schedule, $room, 40, 'OPEN', 
            $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
        );
    }
}

// 2nd Year (2023-2024)
echo "\n=== Creating 2nd Year (2023-2024) Offerings ===\n";
$secondYearCourseCodes = ['CS201', 'CS202', 'IT201', 'IT202', 'BUS201', 'BUS202', 'MATH102', 'STAT101'];
$secondYearCourses = Course::whereIn('course_code', $secondYearCourseCodes)->get();

$terms2023 = AcademicTerm::where('academic_year', '2023-2024')->get();
foreach ($terms2023 as $term) {
    foreach ($secondYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
        $section = chr(65 + ($index % 3));
        
        $schedule = $term->semester === '1st' ? 'MWF 10:00-11:00' : 'TTH 13:00-14:30';
        $room = 'Room ' . (200 + $index);
        $enrollmentStatus = 'COMPLETED';
        $midtermGrade = rand(80, 95);
        $finalGrade = rand(85, 98);
        $gradeStatus = 'PUBLISHED';
        
        createOfferingAndEnrollment(
            $course, $term, $instructors[$index % count($instructors)], 
            $section, $student, $schedule, $room, 40, 'OPEN', 
            $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
        );
    }
}

// 3rd Year 1st Semester (2024-2025 1st) - already exists
echo "\n=== 3rd Year 1st Semester (2024-2025 1st) - Already exists ===\n";
$term2024_1st = AcademicTerm::where('academic_year', '2024-2025')->where('semester', '1st')->first();
if ($term2024_1st) {
    $thirdYearCourseCodes = ['CS301', 'CS302', 'IT301', 'IT302', 'BUS301', 'BUS302'];
    $thirdYearCourses = Course::whereIn('course_code', $thirdYearCourseCodes)->get();
    
    foreach ($thirdYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
        $section = chr(65 + ($index % 3));
        
        $offering = \App\Models\CourseOffering::firstOrCreate([
            'course_id' => $course->id,
            'academic_term_id' => $term2024_1st->id,
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
            'enrollment_date' => $term2024_1st->start_date,
            'status' => 'ENROLLED',
        ]);
        
        $midterm = rand(80, 95);
        $final = null;
        $grade = \App\Models\Grade::firstOrCreate([
            'enrollment_id' => $enrollment->id,
        ], [
            'midterm_grade' => $midterm,
            'final_grade' => null,
            'remarks' => 'Midterm completed',
            'status' => 'DRAFT',
        ]);
        
        echo "Enrolled in " . $course->course_code . " 1st semester - Midterm: " . $midterm . "\n";
    }
}

// 3rd Year 2nd Semester (2024-2025 2nd)
echo "\n=== Creating 3rd Year 2nd Semester (2024-2025 2nd) Offerings ===\n";
$term2024_2nd = AcademicTerm::where('academic_year', '2024-2025')->where('semester', '2nd')->first();
if ($term2024_2nd) {
    $thirdYearCourseCodes = ['CS301', 'CS302', 'IT301', 'IT302', 'BUS301', 'BUS302'];
    $thirdYearCourses = Course::whereIn('course_code', $thirdYearCourseCodes)->get();
    
    foreach ($thirdYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
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
        $final = null;
        $grade = \App\Models\Grade::firstOrCreate([
            'enrollment_id' => $enrollment->id,
        ], [
            'midterm_grade' => $midterm,
            'final_grade' => null,
            'remarks' => 'Midterm completed',
            'status' => 'DRAFT',
        ]);
        
        echo "Enrolled in " . $course->course_code . " 2nd semester - Midterm: " . $midterm . "\n";
    }
}

echo "\nDone! Student now has enrollment history from 1st year to 3rd year.\n";