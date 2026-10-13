<?php

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\Enrollment;
use App\Models\Student;

class AcademicRecordService
{
    /**
     * Get academic record for a student grouped by term.
     */
    public function getAcademicRecord(int $studentId): array
    {
        $student = Student::with(['program'])->findOrFail($studentId);

        // Get all enrollments for the student (excluding dropped)
        $enrollments = Enrollment::where('student_id', $studentId)
            ->whereIn('status', ['ENROLLED', 'COMPLETED'])
            ->with([
                'courseOffering.course',
                'courseOffering.academicTerm',
                'courseOffering.instructor',
                'grade',
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Build flat enrollments array for frontend
        $flatEnrollments = $enrollments->map(function ($enrollment) {
            $grade = $enrollment->grade;
            return [
                'id' => $enrollment->id,
                'enrollment_date' => $enrollment->enrollment_date?->toISOString(),
                'status' => $enrollment->status,
                'course_offering' => [
                    'id' => $enrollment->courseOffering->id,
                    'section' => $enrollment->courseOffering->section,
                    'schedule' => $enrollment->courseOffering->schedule,
                    'room' => $enrollment->courseOffering->room,
                    'course' => [
                        'id' => $enrollment->courseOffering->course->id,
                        'code' => $enrollment->courseOffering->course->course_code,
                        'name' => $enrollment->courseOffering->course->title,
                        'units' => $enrollment->courseOffering->course->units,
                    ],
                    'academic_term' => [
                        'id' => $enrollment->courseOffering->academicTerm->id,
                        'academic_year' => $enrollment->courseOffering->academicTerm->academic_year,
                        'semester' => $enrollment->courseOffering->academicTerm->semester,
                        'start_date' => $enrollment->courseOffering->academicTerm->start_date?->toISOString(),
                        'end_date' => $enrollment->courseOffering->academicTerm->end_date?->toISOString(),
                        'status' => $enrollment->courseOffering->academicTerm->status,
                    ],
                    'instructor' => $enrollment->courseOffering->instructor ? [
                        'id' => $enrollment->courseOffering->instructor->id,
                        'name' => $enrollment->courseOffering->instructor->name,
                    ] : null,
                ],
                'grade' => $grade ? [
                    'id' => $grade->id,
                    'midterm_grade' => $grade->midterm_grade,
                    'final_grade' => $grade->final_grade,
                    'remarks' => $grade->remarks,
                    'status' => $grade->status,
                ] : null,
            ];
        });

        // Calculate summary
        $totalUnits = $enrollments->sum(fn($e) => $e->courseOffering->course->units);
        
        // Count completed units: enrollments with COMPLETED status OR passing grades (≥75)
        $completedEnrollments = $enrollments->filter(function ($e) {
            // If enrollment status is COMPLETED, count it
            if ($e->status === 'COMPLETED') {
                return true;
            }
            // If enrollment has a published grade with passing score (≥75), count it
            if ($e->grade && $e->grade->status === 'PUBLISHED' && $e->grade->final_grade !== null && $e->grade->final_grade >= 75) {
                return true;
            }
            return false;
        });
        $completedUnits = $completedEnrollments->sum(fn($e) => $e->courseOffering->course->units);
        
        // Calculate GPA from published grades
        $publishedGrades = $enrollments->filter(fn($e) => $e->grade && $e->grade->status === 'PUBLISHED' && $e->grade->final_grade !== null);
        $gpa = 0;
        if ($publishedGrades->count() > 0) {
            $totalPoints = $publishedGrades->sum(function ($e) {
                $grade = $e->grade->final_grade;
                // Convert percentage to 4.0 scale
                if ($grade >= 97) return 4.0;
                if ($grade >= 93) return 3.7;
                if ($grade >= 90) return 3.3;
                if ($grade >= 87) return 3.0;
                if ($grade >= 83) return 2.7;
                if ($grade >= 80) return 2.3;
                if ($grade >= 77) return 2.0;
                if ($grade >= 73) return 1.7;
                if ($grade >= 70) return 1.0;
                return 0;
            });
            $gpa = round($totalPoints / $publishedGrades->count(), 2);
        }

        $summary = [
            'total_units' => $totalUnits,
            'completed_units' => $completedUnits,
            'gpa' => $gpa,
        ];

        // Group by academic term for terms view
        $terms = $enrollments->groupBy(function ($enrollment) {
            return $enrollment->courseOffering->academic_term_id;
        });

        $record = [
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'program' => $student->program ? [
                    'id' => $student->program->id,
                    'code' => $student->program->code,
                    'name' => $student->program->name,
                ] : null,
                'year_level' => $student->year_level,
                'status' => $student->status,
            ],
            'enrollments' => $flatEnrollments->values()->all(),
            'summary' => $summary,
            'terms' => [],
        ];

        foreach ($terms as $termId => $termEnrollments) {
            $academicTerm = AcademicTerm::find($termId);

            $courses = $termEnrollments->map(function ($enrollment) {
                $grade = $enrollment->grade;

                return [
                    'course' => [
                        'id' => $enrollment->courseOffering->course->id,
                        'code' => $enrollment->courseOffering->course->course_code,
                        'name' => $enrollment->courseOffering->course->title,
                        'units' => $enrollment->courseOffering->course->units,
                    ],
                    'offering' => [
                        'id' => $enrollment->courseOffering->id,
                        'section' => $enrollment->courseOffering->section,
                        'schedule' => $enrollment->courseOffering->schedule,
                        'room' => $enrollment->courseOffering->room,
                        'instructor' => $enrollment->courseOffering->instructor ? [
                            'id' => $enrollment->courseOffering->instructor->id,
                            'name' => $enrollment->courseOffering->instructor->name,
                        ] : null,
                    ],
                    'enrollment' => [
                        'id' => $enrollment->id,
                        'enrollment_date' => $enrollment->enrollment_date?->toISOString(),
                        'status' => $enrollment->status,
                    ],
                    'grade' => $grade ? [
                        'id' => $grade->id,
                        'midterm_grade' => $grade->midterm_grade,
                        'final_grade' => $grade->final_grade,
                        'remarks' => $grade->remarks,
                        'status' => $grade->status,
                    ] : null,
                ];
            });

            $record['terms'][] = [
                'term' => $academicTerm ? [
                    'id' => $academicTerm->id,
                    'academic_year' => $academicTerm->academic_year,
                    'semester' => $academicTerm->semester,
                    'start_date' => $academicTerm->start_date?->toISOString(),
                    'end_date' => $academicTerm->end_date?->toISOString(),
                    'status' => $academicTerm->status,
                ] : null,
                'courses' => $courses,
            ];
        }

        // Sort terms by start date
        usort($record['terms'], function ($a, $b) {
            $dateA = $a['term']['start_date'] ?? '';
            $dateB = $b['term']['start_date'] ?? '';

            return strcmp($dateA, $dateB);
        });

        return $record;
    }

    /**
     * Get academic record for a student with only published grades.
     */
    public function getStudentAcademicRecord(int $studentId): array
    {
        $record = $this->getAcademicRecord($studentId);

        // Filter out draft grades for student view
        foreach ($record['terms'] as &$term) {
            foreach ($term['courses'] as &$course) {
                if (isset($course['grade']) && $course['grade']['status'] === 'DRAFT') {
                    $course['grade'] = null;
                }
            }
        }

        return $record;
    }
}
