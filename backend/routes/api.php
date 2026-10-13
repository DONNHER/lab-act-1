<?php

use App\Http\Controllers\Api\V1\AcademicRecordController;
use App\Http\Controllers\Api\V1\AcademicTermController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CourseOfferingController;
use App\Http\Controllers\Api\V1\CurriculumController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\GradeController;
use App\Http\Controllers\Api\V1\ProgramController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Public routes (no authentication required)
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth'); // 5 attempts per minute

    // Protected routes (authentication required)
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/auth/redirect', [AuthController::class, 'redirect']);
        Route::post('/auth/impersonate/{userId}', [AuthController::class, 'impersonate'])
            ->middleware('role:ADMIN');

        // User management (admin only)
        Route::middleware('role:ADMIN')->group(function () {
            Route::apiResource('/users', UserController::class);
        });

        // Core resources
        Route::apiResource('/programs', ProgramController::class);
        Route::apiResource('/courses', CourseController::class);
        Route::apiResource('/academic-terms', AcademicTermController::class);
        Route::apiResource('/curriculum', CurriculumController::class);
        Route::get('/programs/{program_id}/curriculum', [CurriculumController::class, 'byProgram']);
        Route::get('/students/me', [StudentController::class, 'me']);
        Route::apiResource('/students', StudentController::class);

        // Academic transactions
        Route::apiResource('/course-offerings', CourseOfferingController::class);
        Route::apiResource('/enrollments', EnrollmentController::class);
        Route::apiResource('/grades', GradeController::class);

        // Nested routes
        Route::get('/students/{student}/enrollments', [EnrollmentController::class, 'byStudent']);
        Route::get('/course-offerings/{offering}/students', [EnrollmentController::class, 'byOffering']);
        Route::get('/students/{student}/grades', [GradeController::class, 'byStudent']);
        Route::get('/students/{student}/academic-record', [AcademicRecordController::class, 'show']);
    });
});
