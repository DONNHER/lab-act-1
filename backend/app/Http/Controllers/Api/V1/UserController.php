<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\User\IndexUserRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Users', description: 'User management endpoints (Admin only)')]
class UserController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/users',
        summary: 'List users',
        description: 'Get paginated list of users with search, filter, sort, and pagination (Admin only)',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'search', description: 'Search by name or email', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'role', description: 'Filter by role', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT'])),
            new OA\Parameter(name: 'status', description: 'Filter by status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['ACTIVE', 'INACTIVE'])),
            new OA\Parameter(name: 'sort', description: 'Sort column (prefix with - for desc)', in: 'query', schema: new OA\Schema(type: 'string', enum: ['name', 'email', 'role', 'status', 'created_at', '-name', '-email', '-role', '-status', '-created_at'])),
            new OA\Parameter(name: 'per_page', description: 'Items per page (max 100)', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
            new OA\Parameter(name: 'page', description: 'Page number', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Paginated list of users',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/UserResource')),
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
    public function index(IndexUserRequest $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->validatedSearch(), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->input('role'), function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->validatedSort(), function ($query, $sort) {
                $query->orderBy($sort['column'], $sort['direction']);
            }, function ($query) {
                $query->orderBy('name', 'asc');
            })
            ->paginate($request->validatedPerPage());

        return $this->paginated($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/users',
        summary: 'Create user',
        description: 'Create a new user account (Admin only)',
        tags: ['Users'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'role'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123'),
                    new OA\Property(property: 'role', type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'User created'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->status ?? 'ACTIVE',
        ]);

        return $this->created(new UserResource($user));
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/users/{id}',
        summary: 'Get user',
        description: 'Get a single user by ID (Admin only)',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'User ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return $this->success(new UserResource($user));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Patch(
        path: '/users/{id}',
        summary: 'Update user',
        description: 'Update a user account (Admin only)',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'User ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'role', type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
                    new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'User updated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $this->success(new UserResource($user));
    }

    /**
     * Remove the specified resource from storage (deactivate).
     */
    #[OA\Delete(
        path: '/users/{id}',
        summary: 'Deactivate user',
        description: 'Deactivate a user account (Admin only)',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', description: 'User ID', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'User deactivated'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->update(['status' => 'INACTIVE']);
        $user->tokens()->delete();

        return $this->noContent();
    }
}
