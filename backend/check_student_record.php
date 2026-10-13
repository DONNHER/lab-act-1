<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;

$user = User::where('email', 'student1@example.com')->first();
echo "User: " . $user->id . ' ' . $user->name . ' ' . $user->email . "\n";

$student = Student::where('user_id', $user->id)->first();
if ($student) {
    echo "Student exists: " . $student->id . " - " . $student->student_number . " - " . $student->first_name . " " . $student->last_name . "\n";
} else {
    echo "No student record found for user_id: " . $user->id . "\n";
}