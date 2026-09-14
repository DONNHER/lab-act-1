<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Student;
use App\Services\AcademicRecordService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Academic Records', description: 'Academic record endpoints')]
class AcademicRecordController extends ApiController
{
    protected AcademicRecordService $academicRecordService;

    public function __construct(AcademicRecordService $academicRecordService)
    {
        $this->academicRecordService = $academicRecordService;
    }

    /**
     * Get academic record for a student.
     */
    #[OA\Get(
        path: '/students/{id}/academic-record',
        summary: 'Get student academic record',
        description: 'Get a student\'s academic record grouped by term with courses, grades, and enrollment status',
        tags: ['Academic Records'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Student ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Academic record',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'student', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'student_number', type: 'string'),
                            new OA\Property(property: 'first_name', type: 'string'),
                            new OA\Property(property: 'last_name', type: 'string'),
                            new OA\Property(property: 'middle_name', type: 'string', nullable: true),
                            new OA\Property(property: 'program', type: 'object', nullable: true),
                            new OA\Property(property: 'year_level', type: 'integer'),
                            new OA\Property(property: 'status', type: 'string'),
                        ]),
                        new OA\Property(property: 'terms', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Student $student): JsonResponse
    {
        // Check authorization
        $user = auth()->user();

        if ($user->role === 'STUDENT') {
            // Student can only view their own record
            if ($student->user_id !== $user->id) {
                return $this->forbidden('You can only view your own academic record.');
            }
            $record = $this->academicRecordService->getStudentAcademicRecord($student->id);
        } else {
            // Admin, Registrar, Instructor can view full record
            $this->authorize('view', $student);
            $record = $this->academicRecordService->getAcademicRecord($student->id);
        }

        return $this->success($record);
    }
}
