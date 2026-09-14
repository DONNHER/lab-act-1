<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'CourseOfferingResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer'),
        new OA\Property(property: 'course_id', type: 'integer'),
        new OA\Property(property: 'course', ref: '#/components/schemas/CourseResource'),
        new OA\Property(property: 'academic_term_id', type: 'integer'),
        new OA\Property(property: 'academic_term', ref: '#/components/schemas/AcademicTermResource'),
        new OA\Property(property: 'instructor_id', type: 'integer'),
        new OA\Property(property: 'instructor', ref: '#/components/schemas/UserResource'),
        new OA\Property(property: 'section', type: 'string'),
        new OA\Property(property: 'schedule', type: 'string'),
        new OA\Property(property: 'room', type: 'string'),
        new OA\Property(property: 'capacity', type: 'integer'),
        new OA\Property(property: 'status', type: 'string'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class CourseOfferingResource extends JsonResource
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
            'course_id' => $this->course_id,
            'course' => $this->whenLoaded('course', new CourseResource($this->course)),
            'academic_term_id' => $this->academic_term_id,
            'academic_term' => $this->whenLoaded('academicTerm', new AcademicTermResource($this->academicTerm)),
            'instructor_id' => $this->instructor_id,
            'instructor' => $this->whenLoaded('instructor', new UserResource($this->instructor)),
            'section' => $this->section,
            'schedule' => $this->schedule,
            'room' => $this->room,
            'capacity' => $this->capacity,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
