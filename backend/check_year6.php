<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;

$students = Student::where('year_level', 6)->get();

foreach ($students as $s) {
    echo $s->student_number . ' - ' . $s->first_name . ' ' . $s->last_name . ' - Enrollments: ' . $s->enrollments()->count() . "\n";
}