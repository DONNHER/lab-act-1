<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;

$courses = Course::where('status', 'ACTIVE')->get(['id', 'course_code', 'course_title', 'units']);
foreach ($courses as $c) {
    echo $c->course_code . ' - ' . $c->course_title . ' (' . $c->units . ' units)' . PHP_EOL;
}