<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Student;

$user = User::where('email', 'student1@example.com')->first();
echo "User: " . $user->id . ' ' . $user->name . ' ' . $user->email . "\n";

$token = $user->createToken('test')->plainTextToken;
echo "Token: " . $token . "\n";

$client = new \GuzzleHttp\Client();
try {
    $response = $client->get('http://localhost:8000/api/v1/students/me', [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ]
    ]);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Body: " . $response->getBody() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    if ($e->hasResponse()) {
        echo "Response: " . $e->getResponse()->getBody() . "\n";
    }
}