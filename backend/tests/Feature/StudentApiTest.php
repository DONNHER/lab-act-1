<?php

namespace Tests\Feature;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class StudentApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $registrar;

    protected User $instructor;

    protected User $studentUser1;

    protected User $studentUser2;

    protected Student $student1;

    protected Student $student2;

    protected Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->registrar = User::factory()->registrar()->create();
        $this->instructor = User::factory()->instructor()->create();
        $this->studentUser1 = User::factory()->student()->create();
        $this->studentUser2 = User::factory()->student()->create();

        $this->program = Program::factory()->create();

        $this->student1 = Student::factory()->create([
            'user_id' => $this->studentUser1->id,
            'program_id' => $this->program->id,
            'year_level' => 1,
        ]);

        $this->student2 = Student::factory()->create([
            'user_id' => $this->studentUser2->id,
            'program_id' => $this->program->id,
            'year_level' => 1,
        ]);
    }

    #[Test]
    public function admin_can_list_students(): void
    {
        Student::factory(3)->create(['program_id' => $this->program->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'student_number', 'first_name', 'last_name', 'middle_name', 'email', 'phone', 'address', 'birth_date', 'program_id', 'year_level', 'status', 'created_at', 'updated_at'],
                ],
                'links',
                'meta',
            ]);
    }

    #[Test]
    public function registrar_can_list_students(): void
    {
        Student::factory(3)->create(['program_id' => $this->program->id]);

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->getJson('/api/v1/students');

        $response->assertStatus(200);
    }

    #[Test]
    public function instructor_can_list_students(): void
    {
        Student::factory(3)->create(['program_id' => $this->program->id]);

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->getJson('/api/v1/students');

        $response->assertStatus(200);
    }

    #[Test]
    public function student_cannot_list_all_students(): void
    {
        Student::factory(3)->create(['program_id' => $this->program->id]);

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson('/api/v1/students');

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthenticated_cannot_list_students(): void
    {
        $response = $this->getJson('/api/v1/students');
        $response->assertStatus(401);
    }

    #[Test]
    public function admin_can_create_student(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'Middle',
            'email' => 'john.doe@example.com',
            'phone' => '123-456-7890',
            'address' => '123 Main St',
            'birth_date' => '2000-01-15',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'student_number', 'first_name', 'last_name', 'middle_name', 'email', 'phone', 'address', 'birth_date', 'program_id', 'year_level', 'status', 'created_at', 'updated_at'],
            ]);

        $this->assertDatabaseHas('students', ['student_number' => '2024-00001']);
    }

    #[Test]
    public function registrar_can_create_student(): void
    {
        $data = [
            'student_number' => '2024-00002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->registrar, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(201);
    }

    #[Test]
    public function instructor_cannot_create_student(): void
    {
        $data = [
            'student_number' => '2024-00003',
            'first_name' => 'Test',
            'last_name' => 'Student',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_create_student(): void
    {
        $data = [
            'student_number' => '2024-00003',
            'first_name' => 'Test',
            'last_name' => 'Student',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(403);
    }

    #[Test]
    public function create_student_requires_unique_student_number(): void
    {
        Student::factory()->create(['student_number' => '2024-00001', 'program_id' => $this->program->id]);

        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.student_number.0', 'The student number has already been taken.');
    }

    #[Test]
    public function create_student_requires_student_number(): void
    {
        $data = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.student_number.0', 'Student number is required.');
    }

    #[Test]
    public function create_student_requires_first_name(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.first_name.0', 'First name is required.');
    }

    #[Test]
    public function create_student_requires_last_name(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.last_name.0', 'Last name is required.');
    }

    #[Test]
    public function create_student_requires_program(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.program_id.0', 'Program is required.');
    }

    #[Test]
    public function create_student_requires_valid_program(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => 999999,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.program_id.0', 'The selected program does not exist.');
    }

    #[Test]
    public function create_student_requires_year_level(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.year_level.0', 'Year level is required.');
    }

    #[Test]
    public function create_student_requires_year_level_between_1_and_6(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'year_level' => 7,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.year_level.0', 'Year level must not exceed 6.');
    }

    #[Test]
    public function create_student_requires_valid_status(): void
    {
        $data = [
            'student_number' => '2024-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'INVALID',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.status.0', 'Status must be ACTIVE, INACTIVE, or GRADUATED.');
    }

    #[Test]
    public function create_student_user_id_must_be_unique(): void
    {
        // Create a student with a specific user_id that won't conflict with setUp
        $uniqueUser = User::factory()->student()->create();
        Student::factory()->create(['user_id' => $uniqueUser->id, 'program_id' => $this->program->id]);

        $data = [
            'student_number' => '2024-00002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'user_id' => $uniqueUser->id,
            'program_id' => $this->program->id,
            'year_level' => 1,
            'status' => 'ACTIVE',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/students', $data);

        $response->assertStatus(422)
            ->assertJsonPath('errors.user_id.0', 'This user is already linked to a student profile.');
    }

    #[Test]
    public function admin_can_view_student(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->student1->id);
    }

    #[Test]
    public function registrar_can_view_student(): void
    {
        $response = $this->actingAs($this->registrar, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}");

        $response->assertStatus(200);
    }

    #[Test]
    public function instructor_can_view_student_in_their_offering(): void
    {
        // Create an offering with the instructor
        $offering = CourseOffering::factory()->create([
            'instructor_id' => $this->instructor->id,
            'academic_term_id' => AcademicTerm::factory()->open()->create()->id,
            'course_id' => Course::factory()->create()->id,
        ]);

        // Enroll the student in the offering
        Enrollment::factory()->create([
            'student_id' => $this->student1->id,
            'course_offering_id' => $offering->id,
        ]);

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}");

        $response->assertStatus(200);
    }

    #[Test]
    public function student_can_view_own_profile(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->student1->id);
    }

    #[Test]
    public function student_cannot_view_another_student_profile(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson("/api/v1/students/{$this->student2->id}");

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_update_student(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/students/{$this->student1->id}", [
                'first_name' => 'Johnny',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.first_name', 'Johnny');
    }

    #[Test]
    public function registrar_can_update_student(): void
    {
        $response = $this->actingAs($this->registrar, 'sanctum')
            ->patchJson("/api/v1/students/{$this->student1->id}", [
                'last_name' => 'Smith',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.last_name', 'Smith');
    }

    #[Test]
    public function student_can_update_own_profile(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->patchJson("/api/v1/students/{$this->student1->id}", [
                'phone' => '987-654-3210',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.phone', '987-654-3210');
    }

    #[Test]
    public function student_cannot_update_another_student(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->patchJson("/api/v1/students/{$this->student2->id}", [
                'first_name' => 'Hacked',
            ]);

        $response->assertStatus(403);
    }

    #[Test]
    public function update_student_ignores_unique_student_number_for_same_resource(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/students/{$this->student1->id}", [
                'student_number' => $this->student1->student_number,
            ]);

        $response->assertStatus(200);
    }

    #[Test]
    public function update_student_requires_unique_student_number_for_other_resources(): void
    {
        Student::factory()->create(['student_number' => '2024-00001', 'program_id' => $this->program->id]);
        $student = Student::factory()->create(['student_number' => '2024-00002', 'program_id' => $this->program->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/students/{$student->id}", [
                'student_number' => '2024-00001',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.student_number.0', 'The student number has already been taken.');
    }

    #[Test]
    public function admin_can_deactivate_student(): void
    {
        $student = Student::factory()->create(['status' => 'ACTIVE', 'program_id' => $this->program->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/students/{$student->id}");

        $response->assertStatus(204);

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => 'INACTIVE',
        ]);
    }

    #[Test]
    public function deactivated_student_not_in_default_list(): void
    {
        // setUp creates 2 ACTIVE students
        Student::factory()->create(['status' => 'ACTIVE', 'program_id' => $this->program->id]);
        Student::factory()->create(['status' => 'INACTIVE', 'program_id' => $this->program->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students');

        $response->assertStatus(200);
        // 2 from setUp + 1 created in test = 3 ACTIVE students
        $this->assertCount(3, $response->json('data'));
    }

    #[Test]
    public function can_filter_students_by_program(): void
    {
        $program2 = Program::factory()->create();
        // setUp creates 2 students in $this->program
        Student::factory()->create(['program_id' => $this->program->id, 'status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/students?program_id={$this->program->id}");

        $response->assertStatus(200);
        // 2 from setUp + 1 created in test = 3 students in $this->program
        $this->assertCount(3, $response->json('data'));
    }

    #[Test]
    public function can_filter_students_by_year_level(): void
    {
        // Use year_level 5 and 6 to avoid conflict with setUp students (which use random year_level 1-6)
        Student::factory()->create(['year_level' => 5, 'program_id' => $this->program->id, 'status' => 'ACTIVE']);
        Student::factory()->create(['year_level' => 6, 'program_id' => $this->program->id, 'status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?year_level=5');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_filter_students_by_status(): void
    {
        // setUp creates 2 ACTIVE students
        Student::factory()->create(['status' => 'ACTIVE', 'program_id' => $this->program->id]);
        Student::factory()->create(['status' => 'INACTIVE', 'program_id' => $this->program->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?status=ACTIVE');

        $response->assertStatus(200);
        // 2 from setUp + 1 created in test = 3 ACTIVE students
        $this->assertCount(3, $response->json('data'));
    }

    #[Test]
    public function can_search_students(): void
    {
        Student::factory()->create(['first_name' => 'John', 'last_name' => 'Doe', 'program_id' => $this->program->id, 'status' => 'ACTIVE']);
        Student::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith', 'program_id' => $this->program->id, 'status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?search=John');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    #[Test]
    public function can_sort_students(): void
    {
        // Create students with last names that will sort first alphabetically
        Student::factory()->create(['first_name' => 'John', 'last_name' => 'Aaa', 'program_id' => $this->program->id, 'status' => 'ACTIVE']);
        Student::factory()->create(['first_name' => 'Jane', 'last_name' => 'Bbb', 'program_id' => $this->program->id, 'status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?sort=last_name');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('Aaa', $data[0]['last_name']);
    }

    #[Test]
    public function can_paginate_students(): void
    {
        // setUp creates 2 students, so create 23 more to get 25 total
        Student::factory(23)->create(['program_id' => $this->program->id, 'status' => 'ACTIVE']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?per_page=10');

        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(25, $response->json('meta.total'));
    }

    #[Test]
    public function not_found_returns_404(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students/999999');

        $response->assertStatus(404);
    }

    #[Test]
    public function invalid_sort_column_returns_422(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?sort=invalid_column');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonPath('errors.sort.0', 'The selected sort is invalid.');
    }

    #[Test]
    public function invalid_filter_value_returns_422(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?year_level=99');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonPath('errors.year_level.0', 'The year level field must not be greater than 6.');
    }

    #[Test]
    public function per_page_exceeds_maximum_returns_422(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/students?per_page=200');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonPath('errors.per_page.0', 'The per page field must not be greater than 100.');
    }
}
