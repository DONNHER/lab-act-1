<?php

namespace Tests\Feature;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CourseOfferingApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $registrar;
    protected User $instructor;
    protected User $student;
    protected Course $course;
    protected AcademicTerm $term;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->registrar = User::factory()->registrar()->create();
        $this->instructor = User::factory()->instructor()->create();
        $this->student = User::factory()->student()->create();

        $this->course = Course::factory()->create();
        $this->term = AcademicTerm::factory()->open()->create();
    }

    #[Test]
    public function authenticated_user_can_list_course_offerings(): void
    {
        CourseOffering::factory(3)->create([
            'course_id' => $this->course->id,
            'academic_term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/course-offerings');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    #[Test]
    public function admin_can_create_course_offering(): void
    {
        $payload = [
            'course_id' => $this->course->id,
            'academic_term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
            'section' => 'CS-101-A',
            'schedule' => 'MWF 9:00AM - 10:30AM',
            'room' => 'Lab 3',
            'capacity' => 35,
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/course-offerings', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.section', 'CS-101-A')
            ->assertJsonPath('data.capacity', 35);

        $this->assertDatabaseHas('course_offerings', [
            'section' => 'CS-101-A',
            'capacity' => 35,
        ]);
    }

    #[Test]
    public function student_cannot_create_course_offering(): void
    {
        $payload = [
            'course_id' => $this->course->id,
            'academic_term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
            'section' => 'CS-101-B',
            'capacity' => 30,
            'status' => 'OPEN',
        ];

        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/course-offerings', $payload);

        $response->assertStatus(403);
    }
}
