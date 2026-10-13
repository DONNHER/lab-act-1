<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Authentication', description: 'Authentication endpoints')]
class AuthController extends ApiController
{
    /**
     * Get redirect URL based on user role.
     */
    private function getRedirectUrl(string $role): string
    {
        return match ($role) {
            'ADMIN' => '/admin/dashboard',
            'REGISTRAR' => '/registrar/dashboard',
            'INSTRUCTOR' => '/instructor/dashboard',
            'STUDENT' => '/student/dashboard',
            default => '/dashboard',
        };
    }

    /**
     * Login and issue token.
     */
    #[OA\Post(
        path: '/auth/login',
        summary: 'User login',
        description: 'Validate credentials and issue a Sanctum bearer token',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'user', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'name', type: 'string'),
                            new OA\Property(property: 'email', type: 'string'),
                            new OA\Property(property: 'role', type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
                            new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                        ]),
                        new OA\Property(property: 'token', type: 'string'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'redirect_url', type: 'string', example: '/dashboard'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 403, description: 'Account inactive'),
        ]
    )]
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            return $this->forbidden('Account is inactive.');
        }

        // Revoke existing tokens for security
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        $redirectUrl = $this->getRedirectUrl($user->role);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
            'redirect_url' => $redirectUrl,
        ]);
    }

    /**
     * Logout and revoke token.
     */
    #[OA\Post(
        path: '/auth/logout',
        summary: 'User logout',
        description: 'Revoke the current bearer token',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Logged out successfully.'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    #[OA\Get(
        path: '/auth/me',
        summary: 'Get authenticated user profile',
        description: 'Return the authenticated user\'s safe profile',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'integer'),
                        new OA\Property(property: 'name', type: 'string'),
                        new OA\Property(property: 'email', type: 'string'),
                        new OA\Property(property: 'role', type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
                        new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
                        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Get redirect URL for authenticated user based on role.
     */
    #[OA\Get(
        path: '/auth/redirect',
        summary: 'Get redirect URL for authenticated user',
        description: 'Return the appropriate redirect URL based on the user\'s role',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Redirect URL',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'redirect_url', type: 'string', example: '/dashboard'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function redirect(Request $request): JsonResponse
    {
        $user = $request->user();
        $redirectUrl = $this->getRedirectUrl($user->role);

        return $this->success([
            'redirect_url' => $redirectUrl,
        ]);
    }

    /**
     * Impersonate a user (admin only).
     */
    #[OA\Post(
        path: '/auth/impersonate/{userId}',
        summary: 'Impersonate a user',
        description: 'Allow admin to impersonate another user by generating a token for them',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'userId',
                description: 'ID of the user to impersonate',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Impersonation successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'user', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'name', type: 'string'),
                            new OA\Property(property: 'email', type: 'string'),
                            new OA\Property(property: 'role', type: 'string', enum: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT']),
                            new OA\Property(property: 'status', type: 'string', enum: ['ACTIVE', 'INACTIVE']),
                        ]),
                        new OA\Property(property: 'token', type: 'string'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'redirect_url', type: 'string', example: '/dashboard'),
                        new OA\Property(property: 'impersonated', type: 'boolean', example: true),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden - Admin only'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function impersonate(Request $request, int $userId): JsonResponse
    {
        // Only admins can impersonate
        $admin = $request->user();
        if ($admin->role !== 'ADMIN') {
            return $this->forbidden('Only administrators can impersonate users.');
        }

        // Find the user to impersonate
        $user = User::find($userId);
        if (! $user) {
            return $this->notFound('User not found.');
        }

        // Prevent impersonating other admins (optional security measure)
        if ($user->role === 'ADMIN' && $user->id !== $admin->id) {
            return $this->forbidden('Cannot impersonate other administrators.');
        }

        // Revoke existing tokens for the target user
        $user->tokens()->delete();

        // Create a new token for the target user
        $token = $user->createToken('impersonation-token')->plainTextToken;

        $redirectUrl = $this->getRedirectUrl($user->role);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
            'redirect_url' => $redirectUrl,
            'impersonated' => true,
        ]);
    }
}
