<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProgramApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $registrar;

    protected User $instructor;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->registrar = User::factory()->registrar()->create();
        $this->instructor = User::factory()->instructor()->create();
        $this->student = User::factory()->student()->create();
    }

    #[Test]
    public function admin_can_list_programs(): void
    {
        Program::factory(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
                ],
                'links',
                'meta',
            ]);
    }

    #[Test]
    public function registrar_can_list_programs(): void
    {
        Program::factory(3)->create();

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->getJson('/api/v1/programs');

        $response->assertStatus(200);
    }

    #[Test]
    public function instructor_cannot_list_programs(): void
    {
        $response = $this->actingAs($this->instructor, 'sanctum')
            ->getJson('/api/v1/programs');

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_list_programs(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/v1/programs');

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthenticated_cannot_list_programs(): void
    {
        $response = $this->getJson('/api/v1/programs');
        $response->assertStatus(401);
    }

    #[Test]
    public function admin_can_create_program(): void
    {
        $data = [
            'code' => 'CS',
            'name' => 'Computer Science',
            'description' => 'Computer Science program',
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'code', 'name', 'description', 'status', 'created_at', 'updated_at'],
            ]);

        $this->assertDatabaseHas('programs', ['code' => 'CS']);
    }

    #[Test]
    public function registrar_can_create_program(): void
    {
        $data = [
            'code' => 'IT',
            'name' => 'Information Technology',
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(201);
    }

    #[Test]
    public function instructor_cannot_create_program(): void
    {
        $data = ['code' => 'TEST', 'name' => 'Test', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_create_program(): void
    {
        $data = ['code' => 'TEST', 'name' => 'Test', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function create_program_requires_unique_code(): void
    {
        Program::factory()->create(['code' => 'CS']);

        $data = ['code' => 'CS', 'name' => 'Computer Science', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.code.0', 'The program code has already been taken.');
    }

    #[Test]
    public function create_program_requires_code(): void
    {
        $data = ['name' => 'Computer Science', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.code.0', 'Program code is required.');
    }

    #[Test]
    public function create_program_requires_name(): void
    {
        $data = ['code' => 'CS', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.name.0', 'Program name is required.');
    }

    #[Test]
    public function create_program_requires_valid_status(): void
    {
        $data = ['code' => 'CS', 'name' => 'Computer Science', 'status' => 'INVALID'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/programs', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.status.0', 'Status must be ACTIVE or INACTIVE.');
    }

    #[Test]
    public function admin_can_view_program(): void
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/programs/{$program->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $program->id);
    }

    #[Test]
    public function admin_can_update_program(): void
    {
        $program = Program::factory()->create(['code' => 'CS', 'name' => 'Computer Science']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/programs/{$program->id}", [
                'name' => 'Computer Science and Engineering',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Computer Science and Engineering');
    }

    #[Test]
    public function update_program_ignores_unique_code_for_same_resource(): void
    {
        $program = Program::factory()->create(['code' => 'CS']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/programs/{$program->id}", [
                'code' => 'CS',
            ]);

        $response->assertStatus(200);
    }

    #[Test]
    public function update_program_requires_unique_code_for_other_resources(): void
    {
        Program::factory()->create(['code' => 'CS']);
        $program = Program::factory()->create(['code' => 'IT']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/programs/{$program->id}", [
                'code' => 'CS',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.code.0', 'The program code has already been taken.');
    }

    #[Test]
    public function admin_can_deactivate_program(): void
    {
        $program = Program::factory()->create(['status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/programs/{$program->id}");

        $response->assertStatus(204);

        $this->assertDatabaseHas('programs', [
            'id' => $program->id,
            'status' => 'INACTIVE',
        ]);
    }

    #[Test]
    public function deactivated_program_not_in_default_list(): void
    {
        Program::factory()->create(['status' => 'ACTIVE']);
        Program::factory()->create(['status' => 'INACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_filter_programs_by_status(): void
    {
        Program::factory()->create(['status' => 'ACTIVE']);
        Program::factory()->create(['status' => 'INACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs?status=ACTIVE');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_search_programs(): void
    {
        Program::factory()->create(['code' => 'CS', 'name' => 'Computer Science']);
        Program::factory()->create(['code' => 'IT', 'name' => 'Information Technology']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs?search=Computer');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_sort_programs(): void
    {
        Program::factory()->create(['code' => 'CS', 'name' => 'Computer Science']);
        Program::factory()->create(['code' => 'IT', 'name' => 'Information Technology']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs?sort=name');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('Computer Science', $data[0]['name']);
    }

    #[Test]
    public function can_paginate_programs(): void
    {
        Program::factory(25)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs?per_page=10');

        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(25, $response->json('meta.total'));
    }

    #[Test]
    public function not_found_returns_404(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/programs/999999');

        $response->assertStatus(404);
    }
}
