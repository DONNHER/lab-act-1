<?php

namespace App\Enums;

enum TermStatus: string
{
    case PLANNED = 'PLANNED';
    case OPEN = 'OPEN';
    case CLOSED = 'CLOSED';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isOpen(): bool
    {
        return $this === self::OPEN;
    }

    public function isPlanned(): bool
    {
        return $this === self::PLANNED;
    }

    public function isClosed(): bool
    {
        return $this === self::CLOSED;
    }
}
