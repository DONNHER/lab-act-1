<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Hash;

$user = App\Models\User::where('email', 'admin@example.com')->first();
echo "User: " . $user->email . "\n";
echo "Password hash: " . $user->password . "\n";
echo "Check 'password': " . (Hash::check('password', $user->password) ? 'TRUE' : 'FALSE') . "\n";
echo "Check 'password123': " . (Hash::check('password123', $user->password) ? 'TRUE' : 'FALSE') . "\n";