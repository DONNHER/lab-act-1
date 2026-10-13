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

echo "=== Creating Academic Records for 1st Year Students ===\n\n";

// Get all 1st year students
$firstYearStudents = Student::where('year_level', 1)->where('status', 'ACTIVE')->get();
echo "Found {$firstYearStudents->count()} 1st year students\n\n";

// Get 1st year courses
$firstYearCourseCodes = ['CS101', 'CS102', 'IT101', 'MATH101', 'ENG101', 'STAT101'];
$firstYearCourses = Course::whereIn('course_code', $firstYearCourseCodes)->where('status', 'ACTIVE')->get();
echo "Found {$firstYearCourses->count()} 1st year courses\n\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Found {$instructors->count()} instructors\n\n";

// Get or create academic terms for 1st year (2024-2025)
$termsData = [
    ['academic_year' => '2024-2025', 'semester' => '1st', 'start_date' => '2024-08-01', 'end_date' => '2024-12-15', 'status' => 'OPEN'],
    ['academic_year' => '2024-2025', 'semester' => '2nd', 'start_date' => '2025-01-15', 'end_date' => '2025-05-15', 'status' => 'CLOSED'],
];

$terms = [];
foreach ($termsData as $termData) {
    $term = AcademicTerm::firstOrCreate(
        ['academic_year' => $termData['academic_year'], 'semester' => $termData['semester']],
        array_merge($termData, ['status' => $termData['status']])
    );
    $terms[] = $term;
    echo "Term: {$term->academic_year} {$term->semester} ({$term->status})\n";
}

echo "\n";

// Helper function to create offering, enrollment, and grade
function createOfferingAndEnrollment($course, $term, $instructor, $section, $student, $schedule, $room, $capacity, $offeringStatus, $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus) {
    $offering = \App\Models\CourseOffering::firstOrCreate([
        'course_id' => $course->id,
        'academic_term_id' => $term->id,
        'instructor_id' => $instructor->id,
        'section' => $section,
    ], [
        'schedule' => $schedule,
        'room' => $room,
        'capacity' => $capacity,
        'status' => $offeringStatus,
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
    
    return [$offering, $enrollment, $grade];
}

// Process each 1st year student
$totalEnrollments = 0;
$totalGrades = 0;

foreach ($firstYearStudents as $student) {
    echo "Processing student: {$student->student_number} - {$student->first_name} {$student->last_name}\n";
    
    // 1st Semester (2024-2025 1st)
    $term1st = $terms[0]; // 2024-2025 1st
    
    foreach ($firstYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
        $section = chr(65 + ($index % 3)); // A, B, C
        
        $schedule = 'MWF 09:00-10:00';
        $room = 'Room ' . (100 + $index);
        $enrollmentStatus = 'COMPLETED';
        $midtermGrade = rand(80, 95);
        $finalGrade = rand(85, 98);
        $gradeStatus = 'PUBLISHED';
        
        [$offering, $enrollment, $grade] = createOfferingAndEnrollment(
            $course, $term1st, $instructor, $section, $student, 
            $schedule, $room, 40, 'OPEN', 
            $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
        );
        
        $totalEnrollments++;
        $totalGrades++;
        
        echo "  ✓ {$course->course_code} Sec {$section} - Grade: {$midtermGrade}/{$finalGrade} ({$gradeStatus})\n";
    }
    
    // 2nd Semester (2024-2025 2nd) - only if term is OPEN or we want to pre-create
    $term2nd = $terms[1]; // 2024-2025 2nd
    
    // For 2nd semester, we'll create offerings but with CLOSED status
    // and enrollments with ENROLLED status (not completed yet)
    foreach ($firstYearCourses as $index => $course) {
        $instructor = $instructors[$index % count($instructors)];
        $section = chr(65 + ($index % 3));
        
        $schedule = 'TTH 10:00-11:30';
        $room = 'Room ' . (200 + $index);
        $enrollmentStatus = 'ENROLLED';
        $midtermGrade = null;
        $finalGrade = null;
        $gradeStatus = 'DRAFT';
        
        [$offering, $enrollment, $grade] = createOfferingAndEnrollment(
            $course, $term2nd, $instructor, $section, $student, 
            $schedule, $room, 40, 'CLOSED', 
            $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
        );
        
        $totalEnrollments++;
        
        echo "  ○ {$course->course_code} Sec {$section} - Enrolled (2nd sem)\n";
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
echo "Total students processed: {$firstYearStudents->count()}\n";
echo "Total enrollments created: {$totalEnrollments}\n";
echo "Total grades created: {$totalGrades}\n";
echo "\nDone!\n";