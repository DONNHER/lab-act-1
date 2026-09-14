<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\AcademicTerm\IndexAcademicTermRequest;
use App\Http\Requests\AcademicTerm\StoreAcademicTermRequest;
use App\Http\Requests\AcademicTerm\UpdateAcademicTermRequest;
use App\Http\Resources\AcademicTermResource;
use App\Models\AcademicTerm;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Academic Terms', description: 'Academic term management endpoints')]
class AcademicTermController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/academic-terms',
        summary: 'List academic terms',
        description: 'Get paginated list of academic terms with search, filter, sort, and pagination',
        tags: ['Academic Terms'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by academic year', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['PLANNED', 'OPEN', 'CLOSED'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['academic_year', 'semester', 'start_date', 'end_date', 'status', 'created_at', '-academic_year', '-semester', '-start_date', '-end_date', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of academic terms',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/AcademicTermResource')
                        ),
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
    public function index(IndexAcademicTermRequest $request): JsonResponse
    {
        $this->authorize('viewAny', AcademicTerm::class);

        $terms = AcademicTerm::query()
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->where('academic_year', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('start_date', 'desc');
            })
            ->paginate($request->validatedPerPage());

        return $this->paginated($terms);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/academic-terms',
        summary: 'Create academic term',
        description: 'Create a new academic term record',
        tags: ['Academic Terms'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['academic_year', 'semester', 'start_date', 'end_date'],
                properties: [
                    new OA\Property(property: 'academic_year', type: 'string', example: '2024-2025'),
                    new OA\Property(property: 'semester', type: 'string', enum: ['1st', '2nd', 'Summer']),
                    new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2024-08-01'),
                    new OA\Property(property: 'end_date', type: 'string', format: 'date', example: '2024-12-15'),
                    new OA\Property(property: 'status', type: 'string', enum: ['PLANNED', 'OPEN', 'CLOSED'], default: 'PLANNED'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Academic term created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreAcademicTermRequest $request): JsonResponse
    {
        $this->authorize('create', AcademicTerm::class);

        $term = AcademicTerm::create($request->validated());

        return $this->created(new AcademicTermResource($term));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/academic-terms/{id}',
        summary: 'Get academic term',
        description: 'Get a single academic term by ID',
        tags: ['Academic Terms'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Academic Term ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Academic term details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(AcademicTerm $academic_term): JsonResponse
    {
        $this->authorize('view', $academic_term);

        return $this->success(new AcademicTermResource($academic_term));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/academic-terms/{id}',
        summary: 'Update academic term',
        description: 'Update an academic term record',
        tags: ['Academic Terms'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Academic Term ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'academic_year', type: 'string'),
                    new OA\Property(property: 'semester', type: 'string', enum: ['1st', '2nd', 'Summer']),
                    new OA\Property(property: 'start_date', type: 'string', format: 'date'),
                    new OA\Property(property: 'end_date', type: 'string', format: 'date'),
                    new OA\Property(property: 'status', type: 'string', enum: ['PLANNED', 'OPEN', 'CLOSED']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Academic term updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateAcademicTermRequest $request, AcademicTerm $academic_term): JsonResponse
    {
        $this->authorize('update', $academic_term);

        $academic_term->update($request->validated());

        return $this->success(new AcademicTermResource($academic_term));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/academic-terms/{id}',
        summary: 'Close academic term',
        description: 'Close an academic term (sets status to CLOSED)',
        tags: ['Academic Terms'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Academic Term ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Academic term closed'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(AcademicTerm $academic_term): JsonResponse
    {
        $this->authorize('delete', $academic_term);

        $academic_term->update(['status' => 'CLOSED']);

        return $this->noContent();
    }
}
