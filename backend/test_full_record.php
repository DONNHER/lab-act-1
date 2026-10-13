<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\AcademicRecordService;

$service = new AcademicRecordService();
$record = $service->getAcademicRecord(54);

echo "=== Full Record ===\n";
echo json_encode($record, JSON_PRETTY_PRINT) . "\n";