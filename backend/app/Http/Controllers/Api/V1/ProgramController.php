<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Program\IndexProgramRequest;
use App\Http\Requests\Program\StoreProgramRequest;
use App\Http\Requests\Program\UpdateProgramRequest;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Programs', description: 'Program management endpoints')]
class ProgramController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/programs',
        summary: 'List programs',
        description: 'Get paginated list of programs with search, filter, sort, and pagination',
        tags: ['Programs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by program code or name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ACTIVE', 'INACTIVE'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['code', 'name', 'status', 'created_at', '-code', '-name', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of programs',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/ProgramResource')),
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
    public function index(IndexProgramRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Program::class);

        $programs = Program::query()
            ->when(! request()->has('status'), function ($query) {
                $query->where('status', 'ACTIVE');
            })
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('code', 'asc');
            })
            ->paginate($request->validatedPerPage());

        return $this->paginated($programs);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/programs',
        summary: 'Create program',
        description: 'Create a new program record',
        tags: ['Programs'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['code', 'name'],
                properties: [
                    new OA\Property(property: 'code', type: 'string', example: 'BSIT'),
                    new OA\Property(property: 'name', type: 'string', example: 'Bachelor of Science in Information Technology'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Program created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreProgramRequest $request): JsonResponse
    {
        $this->authorize('create', Program::class);

        $program = Program::create($request->validated());

        return $this->created(new ProgramResource($program));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/programs/{id}',
        summary: 'Get program',
        description: 'Get a single program by ID',
        tags: ['Programs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Program ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Program details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Program $program): JsonResponse
    {
        $this->authorize('view', $program);

        return $this->success(new ProgramResource($program));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/programs/{id}',
        summary: 'Update program',
        description: 'Update a program record',
        tags: ['Programs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Program ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'code', type: 'string'),
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Program updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateProgramRequest $request, Program $program): JsonResponse
    {
        $this->authorize('update', $program);

        $program->update($request->validated());

        return $this->success(new ProgramResource($program));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/programs/{id}',
        summary: 'Deactivate program',
        description: 'Deactivate a program (sets status to INACTIVE)',
        tags: ['Programs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'Program ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Program deactivated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Program $program): JsonResponse
    {
        $this->authorize('delete', $program);

        $program->update(['status' => 'INACTIVE']);

        return $this->noContent();
    }
}
