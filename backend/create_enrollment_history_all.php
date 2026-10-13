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

echo "=== Creating Enrollment History for All Students ===\n\n";

// Get all students
$students = Student::where('status', 'ACTIVE')->get();
echo "Found {$students->count()} active students\n\n";

// Get all courses
$courses = Course::where('status', 'ACTIVE')->get();
echo "Found {$courses->count()} active courses\n\n";

// Get instructors
$instructors = User::where('role', 'INSTRUCTOR')->get();
echo "Found {$instructors->count()} instructors\n\n";

// Get or create academic terms
$termsData = [
    ['academic_year' => '2022-2023', 'semester' => '1st', 'start_date' => '2022-08-01', 'end_date' => '2022-12-15', 'status' => 'CLOSED'],
    ['academic_year' => '2022-2023', 'semester' => '2nd', 'start_date' => '2023-01-15', 'end_date' => '2023-05-15', 'status' => 'CLOSED'],
    ['academic_year' => '2023-2024', 'semester' => '1st', 'start_date' => '2023-08-01', 'end_date' => '2023-12-15', 'status' => 'CLOSED'],
    ['academic_year' => '2023-2024', 'semester' => '2nd', 'start_date' => '2024-01-15', 'end_date' => '2024-05-15', 'status' => 'CLOSED'],
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

// Define course codes by year level
$firstYearCourseCodes = ['CS101', 'CS102', 'IT101', 'MATH101', 'ENG101', 'STAT101'];
$secondYearCourseCodes = ['CS201', 'CS202', 'IT201', 'IT202', 'BUS201', 'BUS202', 'MATH102', 'STAT101'];
$thirdYearCourseCodes = ['CS301', 'CS302', 'IT301', 'IT302', 'BUS301', 'BUS302'];
$fourthYearCourseCodes = ['CS401', 'CS402', 'IT301', 'IT302', 'BUS301', 'BUS302'];

$firstYearCourses = Course::whereIn('course_code', $firstYearCourseCodes)->get();
$secondYearCourses = Course::whereIn('course_code', $secondYearCourseCodes)->get();
$thirdYearCourses = Course::whereIn('course_code', $thirdYearCourseCodes)->get();
$fourthYearCourses = Course::whereIn('course_code', $fourthYearCourseCodes)->get();

echo "1st year courses: {$firstYearCourses->count()}\n";
echo "2nd year courses: {$secondYearCourses->count()}\n";
echo "3rd year courses: {$thirdYearCourses->count()}\n";
echo "4th year courses: {$fourthYearCourses->count()}\n\n";

// Helper function to create offering, enrollment, and grade
function createOfferingAndEnrollment($course, $term, $instructor, $section, $student, $schedule, $room, $capacity, $offeringStatus, $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus) {
    // First, get or create the course offering (without instructor_id in the unique check)
    $offering = \App\Models\CourseOffering::firstOrCreate([
        'course_id' => $course->id,
        'academic_term_id' => $term->id,
        'section' => $section,
    ], [
        'instructor_id' => $instructor->id,
        'schedule' => $schedule,
        'room' => $room,
        'capacity' => $capacity,
        'status' => $offeringStatus,
    ]);
    
    // If offering exists but has different instructor, update it
    if ($offering->instructor_id !== $instructor->id) {
        $offering->instructor_id = $instructor->id;
        $offering->save();
    }
    
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

$totalEnrollments = 0;
$totalGrades = 0;

// Process each student based on their year level
foreach ($students as $student) {
    echo "Processing student: {$student->student_number} - {$student->first_name} {$student->last_name} (Year {$student->year_level})\n";
    
    $yearLevel = $student->year_level;
    
    // Determine which courses and terms to use based on year level
    $completedTerms = [];
    $currentTerms = [];
    $coursesToEnroll = [];
    
    if ($yearLevel >= 1) {
        // 1st year courses in 2022-2023
        $completedTerms[] = ['year' => 1, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2022-2023')];
        $coursesToEnroll[1] = $firstYearCourses;
    }
    if ($yearLevel >= 2) {
        // 2nd year courses in 2023-2024
        $completedTerms[] = ['year' => 2, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2023-2024')];
        $coursesToEnroll[2] = $secondYearCourses;
    }
    if ($yearLevel >= 3) {
        // 3rd year courses in 2024-2025 1st
        $completedTerms[] = ['year' => 3, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2024-2025' && $t->semester === '1st')];
        $coursesToEnroll[3] = $thirdYearCourses;
    }
    if ($yearLevel >= 4) {
        // 4th year courses in 2024-2025 2nd
        $currentTerms[] = ['year' => 4, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2024-2025' && $t->semester === '2nd')];
        $coursesToEnroll[4] = $fourthYearCourses;
    }
    
    // For current year level, also add current term enrollments
    if ($yearLevel === 1) {
        $currentTerms[] = ['year' => 1, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2024-2025' && $t->semester === '2nd')];
    } elseif ($yearLevel === 2) {
        $currentTerms[] = ['year' => 2, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2024-2025' && $t->semester === '1st')];
    } elseif ($yearLevel === 3) {
        $currentTerms[] = ['year' => 3, 'terms' => array_filter($terms, fn($t) => $t->academic_year === '2024-2025' && $t->semester === '2nd')];
    }
    
    // Create completed enrollments (past years)
    foreach ($completedTerms as $yearData) {
        $year = $yearData['year'];
        $yearTerms = $yearData['terms'];
        $yearCourses = $coursesToEnroll[$year] ?? collect();
        
        foreach ($yearTerms as $term) {
            foreach ($yearCourses as $index => $course) {
                $instructor = $instructors[$index % count($instructors)];
                $section = chr(65 + ($index % 3));
                
                $schedule = $term->semester === '1st' ? 'MWF 09:00-10:00' : 'TTH 10:00-11:30';
                $room = 'Room ' . (100 + $index + ($year - 1) * 10);
                $enrollmentStatus = 'COMPLETED';
                $midtermGrade = rand(75, 95);
                $finalGrade = rand(80, 98);
                $gradeStatus = 'PUBLISHED';
                
                [$offering, $enrollment, $grade] = createOfferingAndEnrollment(
                    $course, $term, $instructor, $section, $student, 
                    $schedule, $room, 40, 'OPEN', 
                    $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
                );
                
                $totalEnrollments++;
                $totalGrades++;
            }
        }
    }
    
    // Create current enrollments (current year)
    foreach ($currentTerms as $yearData) {
        $year = $yearData['year'];
        $yearTerms = $yearData['terms'];
        $yearCourses = $coursesToEnroll[$year] ?? collect();
        
        foreach ($yearTerms as $term) {
            foreach ($yearCourses as $index => $course) {
                $instructor = $instructors[$index % count($instructors)];
                $section = chr(65 + ($index % 3));
                
                $schedule = $term->semester === '1st' ? 'MWF 10:00-11:00' : 'TTH 13:00-14:30';
                $room = 'Room ' . (200 + $index + ($year - 1) * 10);
                $enrollmentStatus = 'ENROLLED';
                $midtermGrade = null;
                $finalGrade = null;
                $gradeStatus = 'DRAFT';
                
                [$offering, $enrollment, $grade] = createOfferingAndEnrollment(
                    $course, $term, $instructor, $section, $student, 
                    $schedule, $room, 40, 'OPEN', 
                    $enrollmentStatus, $midtermGrade, $finalGrade, $gradeStatus
                );
                
                $totalEnrollments++;
            }
        }
    }
    
    echo "  ✓ Created enrollments for Year {$yearLevel} student\n";
}

echo "\n=== Summary ===\n";
echo "Total students processed: {$students->count()}\n";
echo "Total enrollments created: {$totalEnrollments}\n";
echo "Total grades created: {$totalGrades}\n";
echo "\nDone!\n";