<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Program;

$programs = Program::where('status', 'ACTIVE')->get(['id', 'code', 'name']);
foreach ($programs as $p) {
    echo $p->id . ' - ' . $p->code . ' - ' . $p->name . PHP_EOL;
}