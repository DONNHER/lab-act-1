<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GradeService
{
    /**
     * Create or update a grade for an enrollment.
     */
    public function upsertGrade(array $data): Grade
    {
        return DB::transaction(function () use ($data) {
            $enrollment = Enrollment::findOrFail($data['enrollment_id']);

            // Check enrollment is not dropped
            if ($enrollment->status === 'DROPPED') {
                throw ValidationException::withMessages([
                    'enrollment_id' => ['Cannot add grade for dropped enrollment.'],
                ]);
            }

            // Check if grade already exists
            $existingGrade = Grade::where('enrollment_id', $enrollment->id)->first();

            if ($existingGrade) {
                // Update existing grade
                $existingGrade->update([
                    'midterm_grade' => $data['midterm_grade'] ?? $existingGrade->midterm_grade,
                    'final_grade' => $data['final_grade'] ?? $existingGrade->final_grade,
                    'remarks' => $data['remarks'] ?? $existingGrade->remarks,
                    'status' => $data['status'] ?? $existingGrade->status,
                ]);

                return $existingGrade->load(['enrollment.student', 'enrollment.courseOffering']);
            }

            // Create new grade
            $grade = Grade::create([
                'enrollment_id' => $enrollment->id,
                'midterm_grade' => $data['midterm_grade'] ?? null,
                'final_grade' => $data['final_grade'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'status' => $data['status'] ?? 'DRAFT',
            ]);

            return $grade->load(['enrollment.student', 'enrollment.courseOffering']);
        });
    }

    /**
     * Publish a grade (requires final grade).
     */
    public function publishGrade(Grade $grade): Grade
    {
        if ($grade->final_grade === null) {
            throw ValidationException::withMessages([
                'final_grade' => ['Final grade is required to publish.'],
            ]);
        }

        $grade->update(['status' => 'PUBLISHED']);

        return $grade->load(['enrollment.student', 'enrollment.courseOffering']);
    }

    /**
     * Unpublish a grade (revert to draft).
     */
    public function unpublishGrade(Grade $grade): Grade
    {
        $grade->update(['status' => 'DRAFT']);

        return $grade->load(['enrollment.student', 'enrollment.courseOffering']);
    }

    /**
     * Get grades for an instructor's offerings.
     */
    public function getInstructorGrades(int $instructorId): Collection
    {
        return Grade::whereHas('enrollment.courseOffering', function ($query) use ($instructorId) {
            $query->where('instructor_id', $instructorId);
        })->with(['enrollment.student', 'enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get grades for a student.
     */
    public function getStudentGrades(int $studentId): Collection
    {
        return Grade::whereHas('enrollment.student', function ($query) use ($studentId) {
            $query->where('id', $studentId);
        })->with(['enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get published grades for a student.
     */
    public function getStudentPublishedGrades(int $studentId): Collection
    {
        return Grade::whereHas('enrollment.student', function ($query) use ($studentId) {
            $query->where('id', $studentId);
        })->where('status', 'PUBLISHED')
            ->with(['enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
