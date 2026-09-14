<?php

namespace App\Enums;

enum CatalogStatus: string
{
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }
}
