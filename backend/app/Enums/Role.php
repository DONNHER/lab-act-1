<?php

namespace App\Enums;

enum Role: string
{
    case ADMIN = 'ADMIN';
    case REGISTRAR = 'REGISTRAR';
    case INSTRUCTOR = 'INSTRUCTOR';
    case STUDENT = 'STUDENT';

    /**
     * Get all role values as array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Check if role is staff (admin, registrar, instructor).
     */
    public function isStaff(): bool
    {
        return in_array($this, [self::ADMIN, self::REGISTRAR, self::INSTRUCTOR]);
    }

    /**
     * Check if role is admin.
     */
    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    /**
     * Check if role is registrar.
     */
    public function isRegistrar(): bool
    {
        return $this === self::REGISTRAR;
    }

    /**
     * Check if role is instructor.
     */
    public function isInstructor(): bool
    {
        return $this === self::INSTRUCTOR;
    }

    /**
     * Check if role is student.
     */
    public function isStudent(): bool
    {
        return $this === self::STUDENT;
    }
}
