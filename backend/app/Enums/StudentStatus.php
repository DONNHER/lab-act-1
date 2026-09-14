<?php

namespace App\Enums;

enum StudentStatus: string
{
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case GRADUATED = 'GRADUATED';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }
}
