<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Grade\IndexGradeRequest;
use App\Http\Requests\Grade\StoreGradeRequest;
use App\Http\Requests\Grade\UpdateGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;
use App\Services\GradeService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Grades', description: 'Grade management endpoints')]
class GradeController extends ApiController
{
    protected GradeService $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/grades',
        summary: 'List grades',
        description: 'Get paginated list of grades with search, filter, sort, and pagination',
        tags: ['Grades'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by student number or name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'enrollment_id', description: 'Filter by enrollment ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['DRAFT', 'PUBLISHED'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['midterm_grade', 'final_grade', 'status', 'created_at', '-midterm_grade', '-final_grade', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of grades',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/GradeResource')),
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
    public function index(IndexGradeRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Grade::class);

        $query = Grade::query()
            ->with(['enrollment.student', 'enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm', 'enrollment.courseOffering.instructor'])
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->whereHas('enrollment.student', function ($q) use ($search) {
                    $q->where('student_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('enrollment_id'), function ($query, $enrollmentId) {
                $query->where('enrollment_id', $enrollmentId);
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('created_at', 'desc');
            });

        // Apply instructor scope
        if (auth()->user()->role === 'INSTRUCTOR') {
            $query->whereHas('enrollment.courseOffering', function ($q) {
                $q->where('instructor_id', auth()->id());
            });
        }

        // Apply student scope (only published grades)
        if (auth()->user()->role === 'STUDENT') {
            $query->whereHas('enrollment.student', function ($q) {
                $q->where('user_id', auth()->id());
            })->where('status', 'PUBLISHED');
        }

        $grades = $query->paginate($request->validatedPerPage());

        return $this->paginated($grades);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/grades',
        summary: 'Create or update grade',
        description: 'Create a new grade or update existing grade for an enrollment',
        tags: ['Grades'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['enrollment_id'],
                properties: [
                    new OA\Property(property: 'enrollment_id', type: 'integer'),
                    new OA\Property(property: 'midterm_grade', type: 'number', format: 'float', nullable: true, minimum: 0, maximum: 100),
                    new OA\Property(property: 'final_grade', type: 'number', format: 'float', nullable: true, minimum: 0, maximum: 100),
                    new OA\Property(property: 'remarks', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Grade created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 409, description: 'Conflict - grade already exists'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreGradeRequest $request): JsonResponse
    {
        $this->authorize('create', Grade::class);

        $enrollment = Enrollment::with('courseOffering')->findOrFail($request->enrollment_id);

        if (auth()->user()->role === 'INSTRUCTOR' && $enrollment->courseOffering->instructor_id !== auth()->id()) {
            return $this->forbidden('You can only enter grades for your own course offerings.');
        }

        $grade = $this->gradeService->upsertGrade($request->validated());

        return $this->created(new GradeResource($grade));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/grades/{id}',
        summary: 'Get grade',
        description: 'Get a single grade by ID',
        tags: ['Grades'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Grade ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Grade details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Grade $grade): JsonResponse
    {
        // Load relationships needed for authorization
        $grade->load('enrollment.courseOffering', 'enrollment.student.user');
        
        $this->authorize('view', $grade);

        return $this->success(new GradeResource($grade->load(['enrollment.student', 'enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm', 'enrollment.courseOffering.instructor'])));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/grades/{id}',
        summary: 'Update grade',
        description: 'Update a grade record',
        tags: ['Grades'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Grade ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'midterm_grade', type: 'number', format: 'float', nullable: true, minimum: 0, maximum: 100),
                    new OA\Property(property: 'final_grade', type: 'number', format: 'float', nullable: true, minimum: 0, maximum: 100),
                    new OA\Property(property: 'remarks', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['DRAFT', 'PUBLISHED']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Grade updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateGradeRequest $request, Grade $grade): JsonResponse
    {
        // Load relationships needed for authorization
        $grade->load('enrollment.courseOffering');
        
        $this->authorize('update', $grade);

        $grade = $this->gradeService->upsertGrade(array_merge(
            ['enrollment_id' => $grade->enrollment_id],
            $request->validated()
        ));

        return $this->success(new GradeResource($grade));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grade $grade): JsonResponse
    {
        // Load relationships needed for authorization
        $grade->load('enrollment.courseOffering');
        
        $this->authorize('delete', $grade);

        $grade->delete();

        return $this->noContent();
    }

    /**
     * Publish a grade.
     */
    public function publish(Grade $grade): JsonResponse
    {
        // Load relationships needed for authorization
        $grade->load('enrollment.courseOffering');
        
        $this->authorize('update', $grade);

        $grade = $this->gradeService->publishGrade($grade);

        return $this->success(new GradeResource($grade));
    }

    /**
     * Unpublish a grade (revert to draft).
     */
    public function unpublish(Grade $grade): JsonResponse
    {
        // Load relationships needed for authorization
        $grade->load('enrollment.courseOffering');
        
        $this->authorize('update', $grade);

        $grade = $this->gradeService->unpublishGrade($grade);

        return $this->success(new GradeResource($grade));
    }

    /**
     * Get grades for a specific student.
     */
    public function byStudent(Student $student): JsonResponse
    {
        // This nested endpoint exposes a student's academic data.  Authorize
        // the requested student record, not only the caller's role.
        $this->authorize('view', $student);

        $grades = Grade::whereHas('enrollment.student', function ($query) use ($student) {
            $query->where('id', $student->id);
        })->with(['enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->orderBy('created_at', 'desc')
            ->paginate(min(request('per_page', 20), 100));

        return $this->paginated($grades);
    }
}
