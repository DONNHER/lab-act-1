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

class EnrollmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $registrar;
    protected User $instructor;
    protected User $studentUser;
    protected Student $student;
    protected CourseOffering $offering;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->registrar = User::factory()->registrar()->create();
        $this->instructor = User::factory()->instructor()->create();
        $this->studentUser = User::factory()->student()->create();

        $program = Program::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'program_id' => $program->id,
            'status' => 'ACTIVE',
        ]);

        $term = AcademicTerm::factory()->open()->create();
        $course = Course::factory()->create();
        $this->offering = CourseOffering::factory()->create([
            'academic_term_id' => $term->id,
            'course_id' => $course->id,
            'instructor_id' => $this->instructor->id,
            'capacity' => 2,
            'status' => 'OPEN',
        ]);
    }

    #[Test]
    public function admin_can_enroll_student(): void
    {
        $payload = [
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
            'enrollment_date' => now()->toDateString(),
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/enrollments', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.student_id', $this->student->id)
            ->assertJsonPath('data.course_offering_id', $this->offering->id);
    }

    #[Test]
    public function duplicate_enrollment_is_prevented(): void
    {
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
            'status' => 'ENROLLED',
        ]);

        $payload = [
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/enrollments', $payload);

        $response->assertStatus(409);
    }

    #[Test]
    public function enrollment_fails_when_offering_is_full(): void
    {
        $otherStudents = Student::factory(2)->create(['program_id' => $this->student->program_id]);
        foreach ($otherStudents as $st) {
            Enrollment::factory()->create([
                'student_id' => $st->id,
                'course_offering_id' => $this->offering->id,
                'status' => 'ENROLLED',
            ]);
        }

        $payload = [
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/enrollments', $payload);

        $response->assertStatus(422);
    }

    #[Test]
    public function student_can_drop_own_enrollment(): void
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
            'status' => 'ENROLLED',
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->deleteJson("/api/v1/enrollments/{$enrollment->id}");

        $response->assertStatus(204);
        $this->assertEquals('DROPPED', $enrollment->fresh()->status);
    }
}
