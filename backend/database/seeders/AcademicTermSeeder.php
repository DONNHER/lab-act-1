<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use Illuminate\Database\Seeder;

class AcademicTermSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 2 academic terms (one OPEN, one PLANNED) - use firstOrCreate to avoid duplicates
        AcademicTerm::firstOrCreate(
            ['academic_year' => '2024-2025', 'semester' => '1st'],
            [
                'start_date' => '2024-08-01',
                'end_date' => '2024-12-15',
                'status' => 'OPEN',
            ]
        );

        AcademicTerm::firstOrCreate(
            ['academic_year' => '2024-2025', 'semester' => '2nd'],
            [
                'start_date' => '2025-01-15',
                'end_date' => '2025-05-15',
                'status' => 'PLANNED',
            ]
        );

        $this->command->info('Academic Terms seeded successfully!');
    }
}
