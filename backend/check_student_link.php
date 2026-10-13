<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;

$user = User::where('email', 'student1@example.com')->first();

if ($user) {
    echo "User ID: " . $user->id . "\n";
    echo "User Name: " . $user->name . "\n";
    echo "User Email: " . $user->email . "\n";
    
    $student = Student::where('user_id', $user->id)->first();
    if ($student) {
        echo "Student ID: " . $student->id . "\n";
        echo "Student Number: " . $student->student_number . "\n";
        echo "Student Name: " . $student->first_name . " " . $student->last_name . "\n";
    } else {
        echo "No student record found for this user\n";
    }
} else {
    echo "User not found\n";
}