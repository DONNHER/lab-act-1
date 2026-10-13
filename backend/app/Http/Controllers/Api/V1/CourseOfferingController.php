<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CourseOffering\IndexCourseOfferingRequest;
use App\Http\Requests\CourseOffering\StoreCourseOfferingRequest;
use App\Http\Requests\CourseOffering\UpdateCourseOfferingRequest;
use App\Http\Resources\CourseOfferingResource;
use App\Models\CourseOffering;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Course Offerings', description: 'Course offering management endpoints')]
class CourseOfferingController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/course-offerings',
        summary: 'List course offerings',
        description: 'Get paginated list of course offerings with search, filter, sort, and pagination',
        tags: ['Course Offerings'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by course code or title', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'course_id', description: 'Filter by course ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'academic_term_id', description: 'Filter by academic term ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'instructor_id', description: 'Filter by instructor ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['OPEN', 'CLOSED', 'CANCELLED'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['section', 'capacity', 'status', 'created_at', '-section', '-capacity', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of course offerings',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CourseOfferingResource')),
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
    public function index(IndexCourseOfferingRequest $request): JsonResponse
    {
        $this->authorize('viewAny', CourseOffering::class);

        $query = CourseOffering::query()
            ->with(['course', 'academicTerm', 'instructor'])
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->whereHas('course', function ($q) use ($search) {
                    $q->where('course_code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when($request->input('course_id'), function ($query, $courseId) {
                $query->where('course_id', $courseId);
            })
            ->when($request->input('academic_term_id'), function ($query, $termId) {
                $query->where('academic_term_id', $termId);
            })
            ->when($request->input('instructor_id'), function ($query, $instructorId) {
                $query->where('instructor_id', $instructorId);
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('section', 'asc');
            });

        // Apply instructor scope
        if (auth()->user()->role === 'INSTRUCTOR') {
            $query->where('instructor_id', auth()->id());
        }

        $offerings = $query->paginate($request->validatedPerPage());

        $data = CourseOfferingResource::collection($offerings->items());

        return response()->json([
            'data' => $data,
            'links' => [
                'first' => $offerings->url(1),
                'last' => $offerings->url($offerings->lastPage()),
                'prev' => $offerings->previousPageUrl(),
                'next' => $offerings->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $offerings->currentPage(),
                'from' => $offerings->firstItem(),
                'last_page' => $offerings->lastPage(),
                'path' => $offerings->path(),
                'per_page' => $offerings->perPage(),
                'to' => $offerings->lastItem(),
                'total' => $offerings->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/course-offerings',
        summary: 'Create course offering',
        description: 'Create a new course offering record',
        tags: ['Course Offerings'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['course_id', 'academic_term_id', 'instructor_id', 'section', 'capacity'],
                properties: [
                    new OA\Property(property: 'course_id', type: 'integer'),
                    new OA\Property(property: 'academic_term_id', type: 'integer'),
                    new OA\Property(property: 'instructor_id', type: 'integer'),
                    new OA\Property(property: 'section', type: 'string', example: 'A'),
                    new OA\Property(property: 'schedule', type: 'string', nullable: true, example: 'MWF 10:00-11:00'),
                    new OA\Property(property: 'room', type: 'string', nullable: true, example: 'Room 101'),
                    new OA\Property(property: 'capacity', type: 'integer', minimum: 1, example: 30),
                    new OA\Property(property: 'status', type: 'string', enum: ['OPEN', 'CLOSED', 'CANCELLED'], default: 'OPEN'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Course offering created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCourseOfferingRequest $request): JsonResponse
    {
        $this->authorize('create', CourseOffering::class);

        $offering = CourseOffering::create($request->validated());

        return $this->created(new CourseOfferingResource($offering->load(['course', 'academicTerm', 'instructor'])));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/course-offerings/{id}',
        summary: 'Get course offering',
        description: 'Get a single course offering by ID',
        tags: ['Course Offerings'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course Offering ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Course offering details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(CourseOffering $course_offering): JsonResponse
    {
        $this->authorize('view', $course_offering);

        return $this->success(new CourseOfferingResource($course_offering->load(['course', 'academicTerm', 'instructor'])));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/course-offerings/{id}',
        summary: 'Update course offering',
        description: 'Update a course offering record',
        tags: ['Course Offerings'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course Offering ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'course_id', type: 'integer'),
                    new OA\Property(property: 'academic_term_id', type: 'integer'),
                    new OA\Property(property: 'instructor_id', type: 'integer'),
                    new OA\Property(property: 'section', type: 'string'),
                    new OA\Property(property: 'schedule', type: 'string', nullable: true),
                    new OA\Property(property: 'room', type: 'string', nullable: true),
                    new OA\Property(property: 'capacity', type: 'integer', minimum: 1),
                    new OA\Property(property: 'status', type: 'string', enum: ['OPEN', 'CLOSED', 'CANCELLED']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Course offering updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCourseOfferingRequest $request, CourseOffering $course_offering): JsonResponse
    {
        $this->authorize('update', $course_offering);

        $course_offering->update($request->validated());

        return $this->success(new CourseOfferingResource($course_offering->load(['course', 'academicTerm', 'instructor'])));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/course-offerings/{id}',
        summary: 'Cancel course offering',
        description: 'Cancel a course offering (sets status to CANCELLED)',
        tags: ['Course Offerings'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course Offering ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Course offering cancelled'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(CourseOffering $course_offering): JsonResponse
    {
        $this->authorize('delete', $course_offering);

        $course_offering->update(['status' => 'CANCELLED']);

        return $this->noContent();
    }
}
