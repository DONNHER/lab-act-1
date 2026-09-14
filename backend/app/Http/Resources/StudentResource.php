<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StudentResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer'),
        new OA\Property(property: 'student_number', type: 'string'),
        new OA\Property(property: 'user_id', type: 'integer', nullable: true),
        new OA\Property(property: 'first_name', type: 'string'),
        new OA\Property(property: 'last_name', type: 'string'),
        new OA\Property(property: 'middle_name', type: 'string', nullable: true),
        new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
        new OA\Property(property: 'phone', type: 'string', nullable: true),
        new OA\Property(property: 'address', type: 'string', nullable: true),
        new OA\Property(property: 'birth_date', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'program_id', type: 'integer'),
        new OA\Property(property: 'program', ref: '#/components/schemas/ProgramResource'),
        new OA\Property(property: 'year_level', type: 'integer'),
        new OA\Property(property: 'status', type: 'string'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class StudentResource extends JsonResource
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
            'student_number' => $this->student_number,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'birth_date' => $this->birth_date?->toISOString(),
            'program_id' => $this->program_id,
            'program' => $this->whenLoaded('program', new ProgramResource($this->program)),
            'year_level' => $this->year_level,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
