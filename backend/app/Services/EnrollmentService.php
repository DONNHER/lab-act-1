<?php

namespace App\Services;

use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EnrollmentService
{
    /**
     * Create a new enrollment with capacity checking and concurrency protection.
     */
    public function createEnrollment(array $data): Enrollment
    {
        return DB::transaction(function () use ($data) {
            $student = Student::findOrFail($data['student_id']);
            $offering = CourseOffering::lockForUpdate()->findOrFail($data['course_offering_id']);

            // Check student is active
            if ($student->status !== 'ACTIVE') {
                throw ValidationException::withMessages([
                    'student_id' => ['Student must be active to enroll.'],
                ]);
            }

            // Check offering is open
            if ($offering->status !== 'OPEN') {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering is not open for enrollment.'],
                ]);
            }

            // Check term is open
            if ($offering->academicTerm->status !== 'OPEN') {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Academic term is not open for enrollment.'],
                ]);
            }

            // Check for existing enrollment
            $existing = Enrollment::where('student_id', $student->id)
                ->where('course_offering_id', $offering->id)
                ->first();

            if ($existing) {
                // If dropped, restore it
                if ($existing->status === 'DROPPED') {
                    // Recheck capacity
                    $occupiedSeats = $this->getOccupiedSeats($offering->id);
                    if ($occupiedSeats >= $offering->capacity) {
                        throw ValidationException::withMessages([
                            'course_offering_id' => ['Course offering is at full capacity.'],
                        ]);
                    }

                    $existing->update([
                        'status' => 'ENROLLED',
                        'enrollment_date' => $data['enrollment_date'] ?? now()->toDateString(),
                    ]);

                    return $existing->load(['student', 'courseOffering']);
                }

                throw ValidationException::withMessages([
                    'course_offering_id' => ['Student is already enrolled in this offering.'],
                ]);
            }

            // Check capacity
            $occupiedSeats = $this->getOccupiedSeats($offering->id);
            if ($occupiedSeats >= $offering->capacity) {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering is at full capacity.'],
                ]);
            }

            // Create enrollment
            $enrollment = Enrollment::create([
                'student_id' => $student->id,
                'course_offering_id' => $offering->id,
                'enrollment_date' => $data['enrollment_date'] ?? now()->toDateString(),
                'status' => 'ENROLLED',
            ]);

            return $enrollment->load(['student', 'courseOffering']);
        });
    }

    /**
     * Drop an enrollment (change status to DROPPED).
     */
    public function dropEnrollment(Enrollment $enrollment): Enrollment
    {
        // Check if enrollment has a published grade
        if ($enrollment->grade && $enrollment->grade->status === 'PUBLISHED') {
            throw ValidationException::withMessages([
                'enrollment' => ['Cannot drop enrollment with published grade without correction process.'],
            ]);
        }

        $enrollment->update(['status' => 'DROPPED']);

        return $enrollment->load(['student', 'courseOffering']);
    }

    /**
     * Restore a dropped enrollment.
     */
    public function restoreEnrollment(Enrollment $enrollment): Enrollment
    {
        return DB::transaction(function () use ($enrollment) {
            $offering = CourseOffering::lockForUpdate()->findOrFail($enrollment->course_offering_id);

            // Check offering is still open
            if ($offering->status !== 'OPEN') {
                throw ValidationException::withMessages([
                    'enrollment' => ['Course offering is no longer open.'],
                ]);
            }

            // Check term is open
            if ($offering->academicTerm->status !== 'OPEN') {
                throw ValidationException::withMessages([
                    'enrollment' => ['Academic term is no longer open.'],
                ]);
            }

            // Check capacity
            $occupiedSeats = $this->getOccupiedSeats($offering->id);
            if ($occupiedSeats >= $offering->capacity) {
                throw ValidationException::withMessages([
                    'enrollment' => ['Course offering is at full capacity.'],
                ]);
            }

            // Check student is active
            if ($enrollment->student->status !== 'ACTIVE') {
                throw ValidationException::withMessages([
                    'enrollment' => ['Student must be active to restore enrollment.'],
                ]);
            }

            $enrollment->update(['status' => 'ENROLLED']);

            return $enrollment->load(['student', 'courseOffering']);
        });
    }

    /**
     * Get occupied seats count for an offering.
     */
    public function getOccupiedSeats(int $offeringId): int
    {
        return Enrollment::where('course_offering_id', $offeringId)
            ->whereIn('status', ['ENROLLED', 'COMPLETED'])
            ->count();
    }

    /**
     * Get enrollments for a student.
     */
    public function getStudentEnrollments(int $studentId): Collection
    {
        return Enrollment::where('student_id', $studentId)
            ->with(['courseOffering.course', 'courseOffering.academicTerm', 'courseOffering.instructor', 'grade'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get enrollments for a course offering.
     */
    public function getOfferingEnrollments(int $offeringId): Collection
    {
        return Enrollment::where('course_offering_id', $offeringId)
            ->with(['student', 'grade'])
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
