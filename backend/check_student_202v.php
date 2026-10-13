<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\CourseOffering;

$student = Student::where('student_number', '202v-10738')->first();

if (!$student) {
    echo "Student not found\n";
    exit;
}

echo "Student ID: {$student->id}\n";
echo "Student: {$student->first_name} {$student->last_name}\n";
echo "Year Level: {$student->year_level}\n";
echo "Enrollments count: " . $student->enrollments()->count() . "\n";

$enrollments = $student->enrollments()
    ->with(['courseOffering.course', 'courseOffering.academicTerm', 'grade'])
    ->get();

echo "Loaded enrollments: " . $enrollments->count() . "\n\n";

foreach ($enrollments as $e) {
    $term = $e->courseOffering->academicTerm;
    $course = $e->courseOffering->course;
    $grade = $e->grade;
    
    echo "{$term->academic_year} {$term->semester} - {$course->course_code} - Section: {$e->courseOffering->section} - Units: {$course->units} - Grade: " . ($grade->midterm_grade ?? 'N/A') . "/" . ($grade->final_grade ?? 'N/A') . " ({$grade->status}) - Enrollment: {$e->status}\n";
}