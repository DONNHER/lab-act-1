<?php

namespace App\Enums;

enum EnrollmentStatus: string
{
    case ENROLLED = 'ENROLLED';
    case DROPPED = 'DROPPED';
    case COMPLETED = 'COMPLETED';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isEnrolled(): bool
    {
        return $this === self::ENROLLED;
    }

    public function isDropped(): bool
    {
        return $this === self::DROPPED;
    }

    public function isCompleted(): bool
    {
        return $this === self::COMPLETED;
    }

    public function isActive(): bool
    {
        return in_array($this, [self::ENROLLED, self::COMPLETED]);
    }
}
