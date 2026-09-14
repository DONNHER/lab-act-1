<?php

namespace App\Providers;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use App\Policies\AcademicTermPolicy;
use App\Policies\CourseOfferingPolicy;
use App\Policies\CoursePolicy;
use App\Policies\EnrollmentPolicy;
use App\Policies\GradePolicy;
use App\Policies\ProgramPolicy;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Program::class => ProgramPolicy::class,
        Course::class => CoursePolicy::class,
        AcademicTerm::class => AcademicTermPolicy::class,
        Student::class => StudentPolicy::class,
        CourseOffering::class => CourseOfferingPolicy::class,
        Enrollment::class => EnrollmentPolicy::class,
        Grade::class => GradePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
