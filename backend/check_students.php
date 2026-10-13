<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;

echo "Users:\n";
$users = User::whereIn('email', ['student1@example.com', 'student2@example.com'])->get(['id', 'name', 'email', 'role']);
foreach ($users as $u) {
    echo $u->id . ' ' . $u->name . ' ' . $u->email . ' ' . $u->role . "\n";
}

echo "\nStudents:\n";
$students = Student::whereIn('user_id', [5, 6])->get(['id', 'user_id', 'student_number', 'first_name', 'last_name']);
foreach ($students as $s) {
    echo $s->id . ' ' . $s->user_id . ' ' . $s->student_number . ' ' . $s->first_name . ' ' . $s->last_name . "\n";
}

echo "\nAll students with user_id:\n";
$allStudents = Student::whereNotNull('user_id')->get(['id', 'user_id', 'student_number', 'first_name', 'last_name']);
foreach ($allStudents as $s) {
    echo $s->id . ' ' . $s->user_id . ' ' . $s->student_number . ' ' . $s->first_name . ' ' . $s->last_name . "\n";
}