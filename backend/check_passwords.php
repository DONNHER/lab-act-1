<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\User::all();
foreach($users as $u) {
    echo $u->email . ' - ' . $u->role . ' - ' . $u->status . ' - ' . substr($u->password, 0, 30) . '...' . PHP_EOL;
}