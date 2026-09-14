<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AcademicRecordResource',
    properties: [
        new OA\Property(property: 'student', ref: '#/components/schemas/StudentResource'),
        new OA\Property(
            property: 'terms',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'term', ref: '#/components/schemas/AcademicTermResource'),
                    new OA\Property(
                        property: 'courses',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'course', ref: '#/components/schemas/CourseResource'),
                                new OA\Property(property: 'offering', ref: '#/components/schemas/CourseOfferingResource'),
                                new OA\Property(property: 'enrollment', ref: '#/components/schemas/EnrollmentResource'),
                                new OA\Property(property: 'grade', ref: '#/components/schemas/GradeResource', nullable: true),
                            ]
                        )
                    ),
                ]
            )
        ),
    ]
)]
class AcademicRecordResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'student' => new StudentResource($this->whenLoaded('student')),
            'terms' => $this->whenLoaded('terms', function () {
                return $this->terms->map(function ($term) {
                    return [
                        'term' => new AcademicTermResource($term),
                        'courses' => $term->courses->map(function ($course) {
                            return [
                                'course' => new CourseResource($course),
                                'offering' => new CourseOfferingResource($course->pivot->offering ?? $course->offering ?? null),
                                'enrollment' => new EnrollmentResource($course->pivot->enrollment ?? $course->enrollment ?? null),
                                'grade' => $course->pivot->grade ? new GradeResource($course->pivot->grade) : null,
                            ];
                        }),
                    ];
                });
            }),
        ];
    }
}
