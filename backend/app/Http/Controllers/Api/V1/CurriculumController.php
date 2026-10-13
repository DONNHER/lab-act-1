<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Resources\CurriculumResource;
use App\Models\Curriculum;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Curriculum', description: 'Curriculum management endpoints')]
class CurriculumController extends ApiController
{
    /**
     * Display a listing of the resource grouped by year and semester for a program.
     */
    #[OA\Get(
        path: '/programs/{program_id}/curriculum',
        summary: 'Get curriculum for a program',
        description: 'Get curriculum courses grouped by year and semester for a specific program',
        tags: ['Curriculum'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'program_id', description: 'Program ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Curriculum grouped by year and semester',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CurriculumResource')),
                        new OA\Property(property: 'meta', type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Program not found'),
        ]
    )]
    public function byProgram(int $program_id): JsonResponse
    {
        $curriculum = Curriculum::with('course')
            ->where('program_id', $program_id)
            ->orderBy('year_level')
            ->orderBy('semester')
            ->orderBy('course_id')
            ->get();

        // Group by year and semester
        $grouped = $curriculum->groupBy('year_level')->map(function ($yearCourses, $yearLevel) {
            return $yearCourses->groupBy('semester')->map(function ($semesterCourses, $semester) {
                return $semesterCourses->map(function ($item) {
                    return new CurriculumResource($item);
                })->values();
            });
        });

        return $this->success($grouped);
    }

    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/curriculum',
        summary: 'List curriculum',
        description: 'Get paginated list of curriculum entries with search, filter, sort, and pagination',
        tags: ['Curriculum'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'program_id', description: 'Filter by program ID', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'year_level', description: 'Filter by year level', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'semester', description: 'Filter by semester', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'category', description: 'Filter by category', in: 'query', schema: new OA\Schema(type: 'string', enum: ['core', 'major', 'elective', 'ge', 'pe', 'nstp'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['year_level', 'semester', 'category', 'created_at', '-year_level', '-semester', '-category', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of curriculum',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CurriculumResource')),
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
    public function index(): JsonResponse
    {
        $query = Curriculum::query()
            ->with('course', 'program')
            ->when(request('program_id'), function ($query, $programId) {
                $query->where('program_id', $programId);
            })
            ->when(request('year_level'), function ($query, $yearLevel) {
                $query->where('year_level', $yearLevel);
            })
            ->when(request('semester'), function ($query, $semester) {
                $query->where('semester', $semester);
            })
            ->when(request('category'), function ($query, $category) {
                $query->where('category', $category);
            })
            ->when(request('sort'), function ($query, $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $column = ltrim($sort, '-');
                $query->orderBy($column, $direction);
            }, function ($query) {
                $query->orderBy('year_level')->orderBy('semester')->orderBy('course_id');
            });

        $curriculum = $query->paginate(request('per_page', 20));

        return $this->paginated($curriculum);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(): JsonResponse
    {
        // Implementation for admin/registrar to create curriculum entries
        return $this->error('Not implemented', 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Curriculum $curriculum): JsonResponse
    {
        return $this->success(new CurriculumResource($curriculum->load('course', 'program')));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(): JsonResponse
    {
        // Implementation for admin/registrar to update curriculum entries
        return $this->error('Not implemented', 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Curriculum $curriculum): JsonResponse
    {
        // Implementation for admin/registrar to delete curriculum entries
        return $this->error('Not implemented', 501);
    }
}
