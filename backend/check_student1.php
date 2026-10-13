<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Student;
use App\Models\Program;

$student = Student::find(1);
echo "Student: {$student->student_number} - {$student->first_name} {$student->last_name}\n";
echo "Current Program: {$student->program_id}\n";
echo "Current Year: {$student->year_level}\n";

$bsit = Program::where('code', 'BSIT')->first();
echo "BSIT Program ID: {$bsit->id}\n";