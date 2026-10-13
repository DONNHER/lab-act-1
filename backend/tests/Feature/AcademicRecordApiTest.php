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

class AcademicRecordApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $studentUser1;
    protected User $studentUser2;
    protected Student $student1;
    protected Student $student2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->studentUser1 = User::factory()->student()->create();
        $this->studentUser2 = User::factory()->student()->create();

        $program = Program::factory()->create();

        $this->student1 = Student::factory()->create([
            'user_id' => $this->studentUser1->id,
            'program_id' => $program->id,
            'status' => 'ACTIVE',
        ]);

        $this->student2 = Student::factory()->create([
            'user_id' => $this->studentUser2->id,
            'program_id' => $program->id,
            'status' => 'ACTIVE',
        ]);
    }

    #[Test]
    public function student_can_view_own_academic_record(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}/academic-record");

        $response->assertStatus(200)
            ->assertJsonPath('data.student.id', $this->student1->id);
    }

    #[Test]
    public function student_cannot_view_another_student_academic_record(): void
    {
        // Student 1 tries to access Student 2's academic record by altering the ID in URL
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson("/api/v1/students/{$this->student2->id}/academic-record");

        $response->assertStatus(403);
    }

    #[Test]
    public function student_cannot_view_another_students_grades(): void
    {
        $response = $this->actingAs($this->studentUser1, 'sanctum')
            ->getJson("/api/v1/students/{$this->student2->id}/grades");

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_view_any_student_academic_record(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/students/{$this->student1->id}/academic-record");

        $response->assertStatus(200)
            ->assertJsonPath('data.student.id', $this->student1->id);
    }
}
