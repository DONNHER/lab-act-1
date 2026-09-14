<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CourseApiTest extends TestCase
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
    public function admin_can_list_courses(): void
    {
        Course::factory(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'course_code', 'title', 'units', 'description', 'status', 'created_at', 'updated_at'],
                ],
                'links',
                'meta',
            ]);
    }

    #[Test]
    public function registrar_can_list_courses(): void
    {
        Course::factory(3)->create();

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->getJson('/api/v1/courses');

        $response->assertStatus(200);
    }

    #[Test]
    public function instructor_cannot_list_courses(): void
    {
        $response = $this->actingAs($this->instructor, 'sanctum')
            ->getJson('/api/v1/courses');

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_list_courses(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/v1/courses');

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthenticated_cannot_list_courses(): void
    {
        $response = $this->getJson('/api/v1/courses');
        $response->assertStatus(401);
    }

    #[Test]
    public function admin_can_create_course(): void
    {
        $data = [
            'course_code' => 'CS101',
            'title' => 'Introduction to Computer Science',
            'units' => 3.00,
            'description' => 'Intro to CS',
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'course_code', 'title', 'units', 'description', 'status', 'created_at', 'updated_at'],
            ]);

        $this->assertDatabaseHas('courses', ['course_code' => 'CS101']);
    }

    #[Test]
    public function registrar_can_create_course(): void
    {
        $data = [
            'course_code' => 'MATH101',
            'title' => 'Calculus I',
            'units' => 4.00,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(201);
    }

    #[Test]
    public function instructor_cannot_create_course(): void
    {
        $data = ['course_code' => 'TEST101', 'title' => 'Test', 'units' => 3, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_create_course(): void
    {
        $data = ['course_code' => 'TEST101', 'title' => 'Test', 'units' => 3, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function create_course_requires_unique_course_code(): void
    {
        Course::factory()->create(['course_code' => 'CS101']);

        $data = ['course_code' => 'CS101', 'title' => 'Intro to CS', 'units' => 3, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.course_code.0', 'The course code has already been taken.');
    }

    #[Test]
    public function create_course_requires_course_code(): void
    {
        $data = ['title' => 'Intro to CS', 'units' => 3, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.course_code.0', 'Course code is required.');
    }

    #[Test]
    public function create_course_requires_title(): void
    {
        $data = ['course_code' => 'CS101', 'units' => 3, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.title.0', 'Course title is required.');
    }

    #[Test]
    public function create_course_requires_units(): void
    {
        $data = ['course_code' => 'CS101', 'title' => 'Intro to CS', 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.units.0', 'Units is required.');
    }

    #[Test]
    public function create_course_requires_positive_units(): void
    {
        $data = ['course_code' => 'CS101', 'title' => 'Intro to CS', 'units' => 0, 'status' => 'ACTIVE'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.units.0', 'Units must be at least 0.01.');
    }

    #[Test]
    public function create_course_requires_valid_status(): void
    {
        $data = ['course_code' => 'CS101', 'title' => 'Intro to CS', 'units' => 3, 'status' => 'INVALID'];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.status.0', 'Status must be ACTIVE or INACTIVE.');
    }

    #[Test]
    public function admin_can_view_course(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/courses/{$course->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $course->id);
    }

    #[Test]
    public function admin_can_update_course(): void
    {
        $course = Course::factory()->create(['course_code' => 'CS101', 'title' => 'Intro to CS']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/courses/{$course->id}", [
                'title' => 'Introduction to Computer Science',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Introduction to Computer Science');
    }

    #[Test]
    public function update_course_ignores_unique_code_for_same_resource(): void
    {
        $course = Course::factory()->create(['course_code' => 'CS101']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/courses/{$course->id}", [
                'course_code' => 'CS101',
            ]);

        $response->assertStatus(200);
    }

    #[Test]
    public function update_course_requires_unique_code_for_other_resources(): void
    {
        Course::factory()->create(['course_code' => 'CS101']);
        $course = Course::factory()->create(['course_code' => 'MATH101']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/courses/{$course->id}", [
                'course_code' => 'CS101',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.course_code.0', 'The course code has already been taken.');
    }

    #[Test]
    public function admin_can_deactivate_course(): void
    {
        $course = Course::factory()->create(['status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/courses/{$course->id}");

        $response->assertStatus(204);

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => 'INACTIVE',
        ]);
    }

    #[Test]
    public function deactivated_course_not_in_default_list(): void
    {
        Course::factory()->create(['status' => 'ACTIVE']);
        Course::factory()->create(['status' => 'INACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_filter_courses_by_status(): void
    {
        Course::factory()->create(['status' => 'ACTIVE']);
        Course::factory()->create(['status' => 'INACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses?status=ACTIVE');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_search_courses(): void
    {
        Course::factory()->create(['course_code' => 'CS101', 'title' => 'Intro to CS']);
        Course::factory()->create(['course_code' => 'MATH101', 'title' => 'Calculus I']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses?search=CS');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_sort_courses(): void
    {
        Course::factory()->create(['course_code' => 'CS101', 'title' => 'Intro to CS']);
        Course::factory()->create(['course_code' => 'MATH101', 'title' => 'Calculus I']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses?sort=title');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('Calculus I', $data[0]['title']);
    }

    #[Test]
    public function can_paginate_courses(): void
    {
        Course::factory(25)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses?per_page=10');

        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(25, $response->json('meta.total'));
    }

    #[Test]
    public function not_found_returns_404(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/courses/999999');

        $response->assertStatus(404);
    }
}
