<?php

namespace App\Enums;

enum OfferingStatus: string
{
    case OPEN = 'OPEN';
    case CLOSED = 'CLOSED';
    case CANCELLED = 'CANCELLED';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isOpen(): bool
    {
        return $this === self::OPEN;
    }

    public function isClosed(): bool
    {
        return $this === self::CLOSED;
    }

    public function isCancelled(): bool
    {
        return $this === self::CANCELLED;
    }
}
