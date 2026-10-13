<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EnrollmentResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer'),
        new OA\Property(property: 'student_id', type: 'integer'),
        new OA\Property(property: 'student', ref: '#/components/schemas/StudentResource'),
        new OA\Property(property: 'course_offering_id', type: 'integer'),
        new OA\Property(property: 'course_offering', ref: '#/components/schemas/CourseOfferingResource'),
        new OA\Property(property: 'enrollment_date', type: 'string', format: 'date'),
        new OA\Property(property: 'status', type: 'string'),
        new OA\Property(property: 'grade', ref: '#/components/schemas/GradeResource'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class EnrollmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'course_offering_id' => $this->course_offering_id,
            'course_offering' => $this->whenLoaded('courseOffering', fn () => new CourseOfferingResource($this->courseOffering)),
            'enrollment_date' => $this->enrollment_date?->toISOString(),
            'status' => $this->status,
            'grade' => $this->whenLoaded('grade', fn () => new GradeResource($this->grade)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
