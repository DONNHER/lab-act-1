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

        // Group by academic term
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
            'terms' => [],
        ];

        foreach ($terms as $termId => $termEnrollments) {
            $academicTerm = AcademicTerm::find($termId);

            $courses = $termEnrollments->map(function ($enrollment) {
                $grade = $enrollment->grade;

                return [
                    'course' => [
                        'id' => $enrollment->courseOffering->course->id,
                        'course_code' => $enrollment->courseOffering->course->course_code,
                        'title' => $enrollment->courseOffering->course->title,
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
