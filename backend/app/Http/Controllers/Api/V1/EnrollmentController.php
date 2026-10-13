<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Enrollment\IndexEnrollmentRequest;
use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Requests\Enrollment\UpdateEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Enrollments', description: 'Enrollment management endpoints')]
class EnrollmentController extends ApiController
{
    protected EnrollmentService $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/enrollments',
        summary: 'List enrollments',
        description: 'Get paginated list of enrollments with search, filter, sort, and pagination',
        tags: ['Enrollments'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by student number or name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'student_id', description: 'Filter by student ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'course_offering_id', description: 'Filter by course offering ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ENROLLED', 'DROPPED', 'COMPLETED'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['enrollment_date', 'status', 'created_at', '-enrollment_date', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of enrollments',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/EnrollmentResource')),
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
    public function index(IndexEnrollmentRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Enrollment::class);

        $query = Enrollment::query()
            ->with(['student', 'courseOffering.course', 'courseOffering.academicTerm', 'courseOffering.instructor', 'grade'])
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('student_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('student_id'), function ($query, $studentId) {
                $query->where('student_id', $studentId);
            })
            ->when($request->input('course_offering_id'), function ($query, $offeringId) {
                $query->where('course_offering_id', $offeringId);
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('enrollment_date', 'desc');
            });

        // Apply instructor scope
        if (auth()->user()->role === 'INSTRUCTOR') {
            $query->whereHas('courseOffering', function ($q) {
                $q->where('instructor_id', auth()->id());
            });
        }

        // Apply student scope
        if (auth()->user()->role === 'STUDENT') {
            $query->where('student_id', auth()->user()->student?->id);
        }

        $enrollments = $query->paginate($request->validatedPerPage());

        return $this->paginated($enrollments);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/enrollments',
        summary: 'Create enrollment',
        description: 'Create a new enrollment record',
        tags: ['Enrollments'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['student_id', 'course_offering_id'],
                properties: [
                    new OA\Property(property: 'student_id', type: 'integer'),
                    new OA\Property(property: 'course_offering_id', type: 'integer'),
                    new OA\Property(property: 'enrollment_date', type: 'string', format: 'date', example: '2024-08-01'),
                    new OA\Property(property: 'status', type: 'string', enum: ['ENROLLED', 'DROPPED', 'COMPLETED'], default: 'ENROLLED'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Enrollment created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 409, description: 'Conflict - duplicate enrollment or full capacity'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $this->authorize('create', Enrollment::class);

        $exists = Enrollment::where('student_id', $request->student_id)
            ->where('course_offering_id', $request->course_offering_id)
            ->where('status', '!=', 'DROPPED')
            ->exists();

        if ($exists) {
            return $this->conflict('Student is already enrolled in this course offering.');
        }

        $enrollment = $this->enrollmentService->createEnrollment($request->validated());

        return $this->created(new EnrollmentResource($enrollment));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/enrollments/{id}',
        summary: 'Get enrollment',
        description: 'Get a single enrollment by ID',
        tags: ['Enrollments'],
        security: [['sanctum' => []]],

        responses: [
            new OA\Response(response: 200, description: 'Enrollment details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Enrollment $enrollment): JsonResponse
    {
        // Load relationships needed for authorization
        $enrollment->load('courseOffering', 'student.user');
        
        $this->authorize('view', $enrollment);

        return $this->success(new EnrollmentResource($enrollment->load(['student', 'courseOffering.course', 'courseOffering.academicTerm', 'courseOffering.instructor', 'grade'])));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/enrollments/{id}',
        summary: 'Update enrollment',
        description: 'Update an enrollment record',
        tags: ['Enrollments'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'status', type: 'string', enum: ['ENROLLED', 'DROPPED', 'COMPLETED']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Enrollment updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): JsonResponse
    {
        // Load relationships needed for authorization
        $enrollment->load('courseOffering', 'student.user');
        
        $this->authorize('update', $enrollment);

        $data = $request->validated();

        // Handle status changes
        if (isset($data['status'])) {
            if ($data['status'] === 'DROPPED' && $enrollment->status !== 'DROPPED') {
                $enrollment = $this->enrollmentService->dropEnrollment($enrollment);
            } elseif ($data['status'] === 'ENROLLED' && $enrollment->status === 'DROPPED') {
                $enrollment = $this->enrollmentService->restoreEnrollment($enrollment);
            } else {
                $enrollment->update($data);
            }
        } else {
            $enrollment->update($data);
        }

        return $this->success(new EnrollmentResource($enrollment->load(['student', 'courseOffering.course', 'courseOffering.academicTerm', 'courseOffering.instructor', 'grade'])));
    }

    /**
     * Remove the specified resource from storage (drop enrollment).
     */
    public function destroy(Enrollment $enrollment): JsonResponse
    {
        // Load relationships needed for authorization
        $enrollment->load('courseOffering', 'student.user');
        
        $this->authorize('delete', $enrollment);

        $enrollment = $this->enrollmentService->dropEnrollment($enrollment);

        return $this->noContent();
    }

    /**
     * Get enrollments for a specific student.
     */
    public function byStudent(Student $student): JsonResponse
    {
        $this->authorize('viewAny', Enrollment::class);

        $enrollments = Enrollment::where('student_id', $student->id)
            ->with(['courseOffering.course', 'courseOffering.academicTerm', 'courseOffering.instructor', 'grade'])
            ->orderBy('created_at', 'desc')
            ->paginate(min(request('per_page', 20), 100));

        return $this->paginated($enrollments);
    }

    /**
     * Get enrollments for a specific course offering.
     */
    public function byOffering(CourseOffering $course_offering): JsonResponse
    {
        $this->authorize('viewAny', Enrollment::class);

        $enrollments = Enrollment::where('course_offering_id', $course_offering->id)
            ->with(['student', 'grade'])
            ->orderBy('created_at', 'asc')
            ->paginate(min(request('per_page', 20), 100));

        return $this->paginated($enrollments);
    }
}
