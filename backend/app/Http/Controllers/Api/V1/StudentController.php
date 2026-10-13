<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Student\IndexStudentRequest;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Students', description: 'Student management endpoints')]
class StudentController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/students',
        summary: 'List students',
        description: 'Get paginated list of students with search, filter, sort, and pagination',
        tags: ['Students'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by student number, name, or email', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'program_id', description: 'Filter by program ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'year_level', description: 'Filter by year level (1-6)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 6)),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['student_number', 'first_name', 'last_name', 'year_level', 'status', 'created_at', '-student_number', '-first_name', '-last_name', '-year_level', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of students',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/StudentResource')),
                        new OA\Property(property: 'links', type: 'object'),
                        new OA\Property(property: 'meta', type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function index(IndexStudentRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $students = Student::query()
            ->with('program')
            ->when(! request()->has('status'), function ($query) {
                $query->where('status', 'ACTIVE');
            })
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->where('student_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->input('program_id'), function ($query, $programId) {
                $query->where('program_id', $programId);
            })
            ->when($request->input('year_level'), function ($query, $yearLevel) {
                $query->where('year_level', $yearLevel);
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('last_name', 'asc')->orderBy('first_name', 'asc');
            })
            ->paginate($request->validatedPerPage());

        return $this->paginated($students);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/students',
        summary: 'Create student',
        description: 'Create a new student record',
        tags: ['Students'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['student_number', 'first_name', 'last_name', 'program_id', 'year_level'],
                properties: [
                    new OA\Property(property: 'student_number', type: 'string', example: '2024-00001'),
                    new OA\Property(property: 'user_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'first_name', type: 'string', example: 'John'),
                    new OA\Property(property: 'last_name', type: 'string', example: 'Doe'),
                    new OA\Property(property: 'middle_name', type: 'string', nullable: true),
                    new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true),
                    new OA\Property(property: 'birth_date', type: 'string', format: 'date', nullable: true),
                    new OA\Property(property: 'program_id', type: 'integer'),
                    new OA\Property(property: 'year_level', type: 'integer', minimum: 1, maximum: 6),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'], default: 'ACTIVE'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Student created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreStudentRequest $request): JsonResponse
    {
        $this->authorize('create', Student::class);

        $student = Student::create($request->validated());

        return $this->created(new StudentResource($student->load('program')));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/students/{id}',
        summary: 'Get student',
        description: 'Get a single student by ID',
        tags: ['Students'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Student ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Student details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Student $student): JsonResponse
    {
        $this->authorize('view', $student);

        return $this->success(new StudentResource($student->load('program')));
    }

    /**
     * Get the authenticated student's own record.
     */
    #[OA\Get(
        path: '/students/me',
        summary: 'Get authenticated student\'s own record',
        description: 'Get the student record linked to the authenticated user',
        tags: ['Students'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Student details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Student record not found for this user'),
        ]
    )]
    public function me(): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'STUDENT') {
            return $this->forbidden('Only students can access this endpoint.');
        }

        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->notFound('Student record not found for this user.');
        }

        $this->authorize('view', $student);

        return $this->success(new StudentResource($student->load('program')));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/students/{id}',
        summary: 'Update student',
        description: 'Update a student record',
        tags: ['Students'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Student ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'student_number', type: 'string'),
                    new OA\Property(property: 'user_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'first_name', type: 'string'),
                    new OA\Property(property: 'last_name', type: 'string'),
                    new OA\Property(property: 'middle_name', type: 'string', nullable: true),
                    new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
                    new OA\Property(property: 'phone', type: 'string', nullable: true),
                    new OA\Property(property: 'address', type: 'string', nullable: true),
                    new OA\Property(property: 'birth_date', type: 'string', format: 'date', nullable: true),
                    new OA\Property(property: 'program_id', type: 'integer'),
                    new OA\Property(property: 'year_level', type: 'integer', minimum: 1, maximum: 6),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE', 'GRADUATED']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Student updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $this->authorize('update', $student);

        $student->update($request->validated());

        return $this->success(new StudentResource($student->load('program')));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/students/{id}',
        summary: 'Deactivate student',
        description: 'Deactivate a student (sets status to INACTIVE)',
        tags: ['Students'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Student ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Student deactivated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Student $student): JsonResponse
    {
        $this->authorize('delete', $student);

        $student->update(['status' => 'INACTIVE']);

        return $this->noContent();
    }
}
