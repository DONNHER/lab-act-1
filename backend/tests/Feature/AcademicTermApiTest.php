<?php

namespace Tests\Feature;

use App\Models\AcademicTerm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AcademicTermApiTest extends TestCase
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
    public function admin_can_list_academic_terms(): void
    {
        AcademicTerm::factory(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/academic-terms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'academic_year', 'semester', 'start_date', 'end_date', 'status', 'created_at', 'updated_at'],
                ],
                'links',
                'meta',
            ]);
    }

    #[Test]
    public function registrar_can_list_academic_terms(): void
    {
        AcademicTerm::factory(3)->create();

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->getJson('/api/v1/academic-terms');

        $response->assertStatus(200);
    }

    #[Test]
    public function instructor_cannot_list_academic_terms(): void
    {
        $response = $this->actingAs($this->instructor, 'sanctum')
            ->getJson('/api/v1/academic-terms');

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_list_academic_terms(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/v1/academic-terms');

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthenticated_cannot_list_academic_terms(): void
    {
        $response = $this->getJson('/api/v1/academic-terms');
        $response->assertStatus(401);
    }

    #[Test]
    public function admin_can_create_academic_term(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'academic_year', 'semester', 'start_date', 'end_date', 'status', 'created_at', 'updated_at'],
            ]);

        $this->assertDatabaseHas('academic_terms', ['academic_year' => '2024-2025', 'semester' => '1st']);
    }

    #[Test]
    public function registrar_can_create_academic_term(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '2nd',
            'start_date' => '2025-01-15',
            'end_date' => '2025-05-15',
            'status' => 'PLANNED',
        ];

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(201);
    }

    #[Test]
    public function instructor_cannot_create_academic_term(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => 'Summer',
            'start_date' => '2024-06-01',
            'end_date' => '2024-08-15',
            'status' => 'PLANNED',
        ];

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_create_academic_term(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => 'Summer',
            'start_date' => '2024-06-01',
            'end_date' => '2024-08-15',
            'status' => 'PLANNED',
        ];

        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function create_academic_term_requires_unique_year_semester(): void
    {
        // Create a term with a unique year/semester that won't conflict with factory sequence
        AcademicTerm::factory()->create([
            'academic_year' => '2017-2018',
            'semester' => '1st',
        ]);

        $data = [
            'academic_year' => '2017-2018',
            'semester' => '1st',
            'start_date' => '2017-08-01',
            'end_date' => '2017-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422);
    }

    #[Test]
    public function create_academic_term_requires_academic_year(): void
    {
        $data = [
            'semester' => '1st',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422);
    }

    #[Test]
    public function create_academic_term_requires_semester(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422);
    }

    #[Test]
    public function create_academic_term_requires_valid_semester(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => 'INVALID',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.semester.0', 'Semester must be 1st, 2nd, or Summer.');
    }

    #[Test]
    public function create_academic_term_requires_start_date(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'end_date' => '2024-12-15',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422);
    }

    #[Test]
    public function create_academic_term_requires_end_date(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'start_date' => '2024-08-01',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422);
    }

    #[Test]
    public function create_academic_term_requires_end_date_after_start_date(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'start_date' => '2024-12-15',
            'end_date' => '2024-08-01',
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.end_date.0', 'End date must be after start date.');
    }

    #[Test]
    public function create_academic_term_requires_valid_status(): void
    {
        $data = [
            'academic_year' => '2024-2025',
            'semester' => '1st',
            'start_date' => '2024-08-01',
            'end_date' => '2024-12-15',
            'status' => 'INVALID',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/academic-terms', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.status.0', 'Status must be PLANNED, OPEN, or CLOSED.');
    }

    #[Test]
    public function admin_can_view_academic_term(): void
    {
        $term = AcademicTerm::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/academic-terms/{$term->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $term->id);
    }

    #[Test]
    public function admin_can_update_academic_term(): void
    {
        $term = AcademicTerm::factory()->create(['status' => 'PLANNED']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/academic-terms/{$term->id}", [
                'status' => 'OPEN',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'OPEN');
    }

    #[Test]
    public function admin_can_deactivate_academic_term(): void
    {
        $term = AcademicTerm::factory()->create(['status' => 'OPEN']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/academic-terms/{$term->id}");

        $response->assertStatus(204);

        $this->assertDatabaseHas('academic_terms', [
            'id' => $term->id,
            'status' => 'CLOSED',
        ]);
    }

    #[Test]
    public function can_filter_terms_by_status(): void
    {
        AcademicTerm::factory()->create(['status' => 'OPEN']);
        AcademicTerm::factory()->create(['status' => 'CLOSED']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/academic-terms?status=OPEN');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_sort_terms(): void
    {
        AcademicTerm::factory()->create(['academic_year' => '2024-2025', 'semester' => '1st', 'start_date' => '2024-08-01']);
        AcademicTerm::factory()->create(['academic_year' => '2024-2025', 'semester' => '2nd', 'start_date' => '2025-01-15']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/academic-terms?sort=start_date');

        $response->assertStatus(200);
        $data = $response->json('data');
        // API returns ISO 8601 format, so we need to compare with that format
        $this->assertEquals('2024-08-01T00:00:00.000000Z', $data[0]['start_date']);
    }

    #[Test]
    public function can_paginate_terms(): void
    {
        AcademicTerm::factory(25)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/academic-terms?per_page=10');

        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(25, $response->json('meta.total'));
    }

    #[Test]
    public function not_found_returns_404(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/academic-terms/999999');

        $response->assertStatus(404);
    }
}
