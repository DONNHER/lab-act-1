<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AcademicRecordService;

$service = new AcademicRecordService();
$record = $service->getAcademicRecord(54);

echo "Enrollments count: " . count($record['enrollments']) . "\n";
echo "Summary: " . json_encode($record['summary']) . "\n";
echo "Terms count: " . count($record['terms']) . "\n";

if (count($record['enrollments']) > 0) {
    echo "\nFirst enrollment:\n";
    print_r($record['enrollments'][0]);
}