<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CurriculumResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'courseCode' => $this->whenLoaded('course', fn() => $this->course->course_code),
            'title' => $this->whenLoaded('course', fn() => $this->course->title),
            'units' => $this->units,
            'yearLevel' => $this->year_level,
            'semester' => $this->semester,
            'prerequisites' => $this->prerequisites,
            'category' => $this->category,
        ];
    }
}
