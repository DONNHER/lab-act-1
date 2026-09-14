<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Course\IndexCourseRequest;
use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Courses', description: 'Course management endpoints')]
class CourseController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/courses',
        summary: 'List courses',
        description: 'Get paginated list of courses with search, filter, sort, and pagination',
        tags: ['Courses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by course code or title', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ACTIVE', 'INACTIVE'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['course_code', 'title', 'units', 'status', 'created_at', '-course_code', '-title', '-units', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of courses',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CourseResource')),
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
    public function index(IndexCourseRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Course::class);

        $courses = Course::query()
            ->when(! request()->has('status'), function ($query) {
                $query->where('status', 'ACTIVE');
            })
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->where('course_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('course_code', 'asc');
            })
            ->paginate($request->validatedPerPage());

        return $this->paginated($courses);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/courses',
        summary: 'Create course',
        description: 'Create a new course record',
        tags: ['Courses'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['course_code', 'title', 'units'],
                properties: [
                    new OA\Property(property: 'course_code', type: 'string', example: 'CS101'),
                    new OA\Property(property: 'title', type: 'string', example: 'Introduction to Computer Science'),
                    new OA\Property(property: 'units', type: 'number', format: 'float', example: 3.0),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Course created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $this->authorize('create', Course::class);

        $course = Course::create($request->validated());

        return $this->created(new CourseResource($course));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/courses/{id}',
        summary: 'Get course',
        description: 'Get a single course by ID',
        tags: ['Courses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Course details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Course $course): JsonResponse
    {
        $this->authorize('view', $course);

        return $this->success(new CourseResource($course));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/courses/{id}',
        summary: 'Update course',
        description: 'Update a course record',
        tags: ['Courses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'course_code', type: 'string'),
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'units', type: 'number', format: 'float'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Course updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $course->update($request->validated());

        return $this->success(new CourseResource($course));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/courses/{id}',
        summary: 'Deactivate course',
        description: 'Deactivate a course (sets status to INACTIVE)',
        tags: ['Courses'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Course ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Course deactivated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Course $course): JsonResponse
    {
        $this->authorize('delete', $course);

        $course->update(['status' => 'INACTIVE']);

        return $this->noContent();
    }
}
