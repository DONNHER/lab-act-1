<?php

namespace App\Enums;

enum GradeStatus: string
{
    case DRAFT = 'DRAFT';
    case PUBLISHED = 'PUBLISHED';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isDraft(): bool
    {
        return $this === self::DRAFT;
    }

    public function isPublished(): bool
    {
        return $this === self::PUBLISHED;
    }
}
