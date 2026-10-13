<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;
use App\Models\Program;

$user = User::where('email', 'student1@example.com')->first();
echo "User: " . $user->id . ' ' . $user->name . ' ' . $user->email . "\n";

$student = Student::where('user_id', $user->id)->first();
if ($student) {
    echo "Student exists: " . $student->id . " - " . $student->student_number . " - " . $student->first_name . " " . $student->last_name . " - Program: " . $student->program_id . " - Year: " . $student->year_level . "\n";
    
    // Update to BSIT (program_id 2) and 4th year
    $bsitProgram = Program::where('code', 'BSIT')->first();
    if ($bsitProgram) {
        $student->program_id = $bsitProgram->id;
        $student->year_level = 4;
        $student->save();
        echo "Updated student to BSIT program (ID: " . $bsitProgram->id . ") and 4th year\n";
    } else {
        echo "BSIT program not found\n";
    }
} else {
    echo "No student record found\n";
}