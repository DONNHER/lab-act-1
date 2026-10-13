<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;

$students = Student::where('first_name', 'like', '%Christopher%')
    ->orWhere('last_name', 'like', '%Barton%')
    ->get();

foreach ($students as $s) {
    echo $s->student_number . ' - ' . $s->first_name . ' ' . $s->last_name . ' - Year: ' . $s->year_level . ' - Enrollments: ' . $s->enrollments()->count() . "\n";
}