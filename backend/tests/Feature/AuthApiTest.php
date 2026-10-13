<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'status'],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJsonPath('data.user.email', 'admin@example.com')
            ->assertJsonPath('data.user.role', 'ADMIN');
    }

    #[Test]
    public function user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => Hash::make('password123'),
            'status' => 'INACTIVE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    #[Test]
    public function authenticated_user_can_get_current_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'registrar@example.com',
            'role' => 'REGISTRAR',
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', 'registrar@example.com')
            ->assertJsonPath('data.role', 'REGISTRAR');
    }

    #[Test]
    public function unauthenticated_user_cannot_access_protected_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    #[Test]
    public function authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('data.message', 'Logged out successfully.');

        $this->assertCount(0, $user->fresh()->tokens);
    }
}
