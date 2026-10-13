<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Curriculum;
use App\Models\Program;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the BSIT program
        $bsitProgram = Program::where('code', 'BSIT')->first();
        
        if (!$bsitProgram) {
            $this->command->warn('BSIT program not found. Skipping curriculum seeding.');
            return;
        }

        // Get all courses for reference
        $courses = Course::all()->keyBy('course_code');

        // BSIT Curriculum data matching the frontend's hardcoded array
        $curriculumData = [
            // Year 1, First Semester
            ['course_code' => 'CS101', 'year_level' => 1, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'MATH101', 'year_level' => 1, 'semester' => 1, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ENG101', 'year_level' => 1, 'semester' => 1, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'FIL101', 'year_level' => 1, 'semester' => 1, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'PE101', 'year_level' => 1, 'semester' => 1, 'category' => 'pe', 'units' => 2, 'prerequisites' => []],
            ['course_code' => 'NSTP101', 'year_level' => 1, 'semester' => 1, 'category' => 'nstp', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE101', 'year_level' => 1, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => []],

            // Year 1, Second Semester
            ['course_code' => 'CS102', 'year_level' => 1, 'semester' => 2, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS101']],
            ['course_code' => 'MATH102', 'year_level' => 1, 'semester' => 2, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ENG102', 'year_level' => 1, 'semester' => 2, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'FIL102', 'year_level' => 1, 'semester' => 2, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'PE102', 'year_level' => 1, 'semester' => 2, 'category' => 'pe', 'units' => 2, 'prerequisites' => []],
            ['course_code' => 'NSTP102', 'year_level' => 1, 'semester' => 2, 'category' => 'nstp', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE102', 'year_level' => 1, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => ['CS101']],

            // Year 2, First Semester
            ['course_code' => 'CS201', 'year_level' => 2, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS102']],
            ['course_code' => 'MATH201', 'year_level' => 2, 'semester' => 1, 'category' => 'ge', 'units' => 4, 'prerequisites' => []],
            ['course_code' => 'PHYS201', 'year_level' => 2, 'semester' => 1, 'category' => 'ge', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE201', 'year_level' => 2, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => ['ITE102']],
            ['course_code' => 'ITE202', 'year_level' => 2, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'PE201', 'year_level' => 2, 'semester' => 1, 'category' => 'pe', 'units' => 2, 'prerequisites' => []],

            // Year 2, Second Semester
            ['course_code' => 'CS202', 'year_level' => 2, 'semester' => 2, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS201']],
            ['course_code' => 'MATH202', 'year_level' => 2, 'semester' => 2, 'category' => 'ge', 'units' => 4, 'prerequisites' => []],
            ['course_code' => 'ITE203', 'year_level' => 2, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE204', 'year_level' => 2, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => ['ITE201']],
            ['course_code' => 'ITE205', 'year_level' => 2, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'PE202', 'year_level' => 2, 'semester' => 2, 'category' => 'pe', 'units' => 2, 'prerequisites' => []],

            // Year 3, First Semester
            ['course_code' => 'CS301', 'year_level' => 3, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS201']],
            ['course_code' => 'CS302', 'year_level' => 3, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS202']],
            ['course_code' => 'ITE301', 'year_level' => 3, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => ['ITE203']],
            ['course_code' => 'ITE302', 'year_level' => 3, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => ['ITE204']],
            ['course_code' => 'ITE303', 'year_level' => 3, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ELEC301', 'year_level' => 3, 'semester' => 1, 'category' => 'elective', 'units' => 3, 'prerequisites' => []],

            // Year 3, Second Semester
            ['course_code' => 'CS303', 'year_level' => 3, 'semester' => 2, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS301']],
            ['course_code' => 'CS304', 'year_level' => 3, 'semester' => 2, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS302']],
            ['course_code' => 'ITE304', 'year_level' => 3, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE305', 'year_level' => 3, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => ['ITE302']],
            ['course_code' => 'ITE306', 'year_level' => 3, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ELEC302', 'year_level' => 3, 'semester' => 2, 'category' => 'elective', 'units' => 3, 'prerequisites' => []],

            // Year 4, First Semester
            ['course_code' => 'CS401', 'year_level' => 4, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS304', 'ITE306']],
            ['course_code' => 'CS402', 'year_level' => 4, 'semester' => 1, 'category' => 'core', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE401', 'year_level' => 4, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ITE402', 'year_level' => 4, 'semester' => 1, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ELEC401', 'year_level' => 4, 'semester' => 1, 'category' => 'elective', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ELEC402', 'year_level' => 4, 'semester' => 1, 'category' => 'elective', 'units' => 3, 'prerequisites' => []],

            // Year 4, Second Semester
            ['course_code' => 'CS403', 'year_level' => 4, 'semester' => 2, 'category' => 'core', 'units' => 3, 'prerequisites' => ['CS401']],
            ['course_code' => 'CS404', 'year_level' => 4, 'semester' => 2, 'category' => 'core', 'units' => 6, 'prerequisites' => []],
            ['course_code' => 'ITE403', 'year_level' => 4, 'semester' => 2, 'category' => 'major', 'units' => 3, 'prerequisites' => []],
            ['course_code' => 'ELEC403', 'year_level' => 4, 'semester' => 2, 'category' => 'elective', 'units' => 3, 'prerequisites' => []],
        ];

        foreach ($curriculumData as $data) {
            $course = $courses->get($data['course_code']);
            
            if (!$course) {
                $this->command->warn("Course {$data['course_code']} not found. Skipping.");
                continue;
            }

            // Convert prerequisite course codes to course IDs
            $prerequisiteIds = [];
            foreach ($data['prerequisites'] as $prereqCode) {
                $prereqCourse = $courses->get($prereqCode);
                if ($prereqCourse) {
                    $prerequisiteIds[] = $prereqCourse->id;
                }
            }

            Curriculum::updateOrCreate(
                [
                    'program_id' => $bsitProgram->id,
                    'course_id' => $course->id,
                    'year_level' => $data['year_level'],
                    'semester' => $data['semester'],
                ],
                [
                    'category' => $data['category'],
                    'prerequisites' => $prerequisiteIds,
                    'units' => $data['units'],
                ]
            );
        }

        $this->command->info('BSIT Curriculum seeded successfully!');
    }
}
