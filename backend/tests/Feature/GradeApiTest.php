<?php

namespace Tests\Feature;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GradeApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $instructor;
    protected User $otherInstructor;
    protected User $studentUser;
    protected Student $student;
    protected Enrollment $enrollment;
    protected CourseOffering $offering;

    protected function setUp(): void
    {
        parent::setUp();

        $this->instructor = User::factory()->instructor()->create();
        $this->otherInstructor = User::factory()->instructor()->create();
        $this->studentUser = User::factory()->student()->create();

        $program = Program::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'program_id' => $program->id,
        ]);

        $term = AcademicTerm::factory()->open()->create();
        $course = Course::factory()->create();
        $this->offering = CourseOffering::factory()->create([
            'academic_term_id' => $term->id,
            'course_id' => $course->id,
            'instructor_id' => $this->instructor->id,
        ]);

        $this->enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_offering_id' => $this->offering->id,
            'status' => 'ENROLLED',
        ]);
    }

    #[Test]
    public function assigned_instructor_can_enter_grades(): void
    {
        $payload = [
            'enrollment_id' => $this->enrollment->id,
            'midterm_grade' => 1.75,
            'final_grade' => 1.50,
            'remarks' => 'Passed',
            'status' => 'PUBLISHED',
        ];

        $response = $this->actingAs($this->instructor, 'sanctum')
            ->postJson('/api/v1/grades', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.final_grade', '1.50')
            ->assertJsonPath('data.status', 'PUBLISHED');
    }

    #[Test]
    public function unauthorized_instructor_cannot_enter_grade(): void
    {
        $payload = [
            'enrollment_id' => $this->enrollment->id,
            'midterm_grade' => 2.00,
            'final_grade' => 2.00,
            'status' => 'PUBLISHED',
        ];

        $response = $this->actingAs($this->otherInstructor, 'sanctum')
            ->postJson('/api/v1/grades', $payload);

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_create_grades(): void
    {
        $payload = [
            'enrollment_id' => $this->enrollment->id,
            'final_grade' => 1.00,
            'status' => 'PUBLISHED',
        ];

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson('/api/v1/grades', $payload);

        $response->assertStatus(403);
    }

    #[Test]
    public function unauthorized_instructor_cannot_update_another_instructors_grade(): void
    {
        $grade = Grade::factory()->create([
            'enrollment_id' => $this->enrollment->id,
            'status' => 'DRAFT',
        ]);

        $response = $this->actingAs($this->otherInstructor, 'sanctum')
            ->patchJson("/api/v1/grades/{$grade->id}", [
                'final_grade' => 1.00,
                'status' => 'PUBLISHED',
            ]);

        $response->assertStatus(403);
    }
}
