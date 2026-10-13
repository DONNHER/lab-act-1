<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'GradeResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer'),
        new OA\Property(property: 'enrollment_id', type: 'integer'),
        new OA\Property(property: 'enrollment', ref: '#/components/schemas/EnrollmentResource'),
        new OA\Property(property: 'midterm_grade', type: 'number', format: 'float', nullable: true),
        new OA\Property(property: 'final_grade', type: 'number', format: 'float', nullable: true),
        new OA\Property(property: 'remarks', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class GradeResource extends JsonResource
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
            'enrollment_id' => $this->enrollment_id,
            'enrollment' => $this->whenLoaded('enrollment', fn () => new EnrollmentResource($this->enrollment)),
            'midterm_grade' => $this->midterm_grade,
            'final_grade' => $this->final_grade,
            'remarks' => $this->remarks,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
