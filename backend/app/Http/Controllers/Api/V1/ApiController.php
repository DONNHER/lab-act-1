<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Student Services Portal API',
    version: '1.0.0',
    description: 'Student Information Management REST API for Student Services Portal'
)]
abstract class ApiController extends Controller
{
    use AuthorizesRequests;

    /**
     * Success response with data.
     */
    protected function success(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
        ], $status);
    }

    /**
     * Success response with paginated collection.
     */
    protected function paginated(LengthAwarePaginator $paginator): JsonResponse
    {
        return response()->json([
            'data' => $paginator->items(),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Created response.
     */
    protected function created(mixed $data): JsonResponse
    {
        return $this->success($data, 201);
    }

    /**
     * No content response.
     */
    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Validation error response.
     */
    protected function validationError(array $errors): JsonResponse
    {
        return response()->json([
            'message' => 'Validation failed.',
            'errors' => $errors,
        ], 422);
    }

    /**
     * Not found response.
     */
    protected function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 404);
    }

    /**
     * Forbidden response.
     */
    protected function forbidden(string $message = 'Forbidden.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 403);
    }

    /**
     * Conflict response.
     */
    protected function conflict(string $message = 'Conflict.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 409);
    }

    /**
     * Unauthorized response.
     */
    protected function unauthorized(string $message = 'Unauthenticated.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }

    /**
     * Server error response.
     */
    protected function serverError(string $message = 'An unexpected error occurred.'): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 500);
    }
}
