<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create real, meaningful courses aligned with academic programs - use firstOrCreate
        $courseData = [
            // Computer Science / IT Courses
            ['course_code' => 'CS101', 'title' => 'Introduction to Computer Science', 'units' => 3, 'description' => 'Fundamentals of programming, algorithms, and data structures'],
            ['course_code' => 'CS102', 'title' => 'Data Structures and Algorithms', 'units' => 3, 'description' => 'Advanced data structures, sorting, searching, and algorithm analysis'],
            ['course_code' => 'CS201', 'title' => 'Object-Oriented Programming', 'units' => 3, 'description' => 'OOP principles, design patterns, and software engineering practices'],
            ['course_code' => 'CS202', 'title' => 'Database Systems', 'units' => 3, 'description' => 'Relational databases, SQL, normalization, and database design'],
            ['course_code' => 'CS301', 'title' => 'Operating Systems', 'units' => 3, 'description' => 'Process management, memory management, file systems, and concurrency'],
            ['course_code' => 'CS302', 'title' => 'Computer Networks', 'units' => 3, 'description' => 'Network protocols, TCP/IP, routing, and network security'],
            ['course_code' => 'CS401', 'title' => 'Software Engineering', 'units' => 3, 'description' => 'Software development lifecycle, testing, and project management'],
            ['course_code' => 'CS402', 'title' => 'Artificial Intelligence', 'units' => 3, 'description' => 'Machine learning, neural networks, and AI applications'],

            // Information Technology Courses
            ['course_code' => 'IT101', 'title' => 'Information Technology Fundamentals', 'units' => 3, 'description' => 'IT concepts, hardware, software, and emerging technologies'],
            ['course_code' => 'IT102', 'title' => 'Computer Programming 1', 'units' => 3, 'description' => 'Introduction to programming concepts and problem solving'],
            ['course_code' => 'IT201', 'title' => 'Web Development', 'units' => 3, 'description' => 'HTML, CSS, JavaScript, and modern web frameworks'],
            ['course_code' => 'IT202', 'title' => 'System Administration', 'units' => 3, 'description' => 'Linux/Windows administration, scripting, and automation'],
            ['course_code' => 'IT203', 'title' => 'Data Communications and Networking 1', 'units' => 3, 'description' => 'Fundamentals of data communications and networking'],
            ['course_code' => 'IT204', 'title' => 'Web Systems and Technologies', 'units' => 3, 'description' => 'Web systems architecture and technologies'],
            ['course_code' => 'IT205', 'title' => 'Information Management', 'units' => 3, 'description' => 'Information management principles and practices'],
            ['course_code' => 'IT301', 'title' => 'Cybersecurity Fundamentals', 'units' => 3, 'description' => 'Security principles, cryptography, and threat modeling'],
            ['course_code' => 'IT302', 'title' => 'Cloud Computing', 'units' => 3, 'description' => 'Cloud services, virtualization, and deployment strategies'],
            ['course_code' => 'IT303', 'title' => 'Human Computer Interaction', 'units' => 3, 'description' => 'Human-computer interaction principles and design'],
            ['course_code' => 'IT304', 'title' => 'Information Assurance and Security', 'units' => 3, 'description' => 'Information assurance and security principles'],
            ['course_code' => 'IT305', 'title' => 'Mobile Application Development', 'units' => 3, 'description' => 'Mobile application development principles'],
            ['course_code' => 'IT306', 'title' => 'IT Project Management', 'units' => 3, 'description' => 'IT project management principles and practices'],
            ['course_code' => 'IT401', 'title' => 'Cloud Computing', 'units' => 3, 'description' => 'Cloud services, virtualization, and deployment strategies'],
            ['course_code' => 'IT402', 'title' => 'Data Analytics', 'units' => 3, 'description' => 'Data analytics and business intelligence'],
            ['course_code' => 'IT403', 'title' => 'Emerging Technologies', 'units' => 3, 'description' => 'Emerging technologies in information technology'],

            // Information Technology Elective (ITE) Courses
            ['course_code' => 'ITE101', 'title' => 'Introduction to Information Technology', 'units' => 3, 'description' => 'Introduction to IT concepts and fundamentals'],
            ['course_code' => 'ITE102', 'title' => 'Computer Programming 1', 'units' => 3, 'description' => 'Introduction to programming concepts and problem solving'],
            ['course_code' => 'ITE201', 'title' => 'Object-Oriented Programming', 'units' => 3, 'description' => 'OOP principles, design patterns, and software engineering practices'],
            ['course_code' => 'ITE202', 'title' => 'Discrete Mathematics', 'units' => 3, 'description' => 'Discrete mathematics for computer science'],
            ['course_code' => 'ITE203', 'title' => 'Data Communications and Networking 1', 'units' => 3, 'description' => 'Fundamentals of data communications and networking'],
            ['course_code' => 'ITE204', 'title' => 'Web Systems and Technologies', 'units' => 3, 'description' => 'Web systems architecture and technologies'],
            ['course_code' => 'ITE205', 'title' => 'Information Management', 'units' => 3, 'description' => 'Information management principles and practices'],
            ['course_code' => 'ITE301', 'title' => 'Data Communications and Networking 2', 'units' => 3, 'description' => 'Advanced data communications and networking'],
            ['course_code' => 'ITE302', 'title' => 'System Analysis and Design', 'units' => 3, 'description' => 'System analysis and design methodologies'],
            ['course_code' => 'ITE303', 'title' => 'Human Computer Interaction', 'units' => 3, 'description' => 'Human-computer interaction principles and design'],
            ['course_code' => 'ITE304', 'title' => 'Information Assurance and Security', 'units' => 3, 'description' => 'Information assurance and security principles'],
            ['course_code' => 'ITE305', 'title' => 'Mobile Application Development', 'units' => 3, 'description' => 'Mobile application development principles'],
            ['course_code' => 'ITE306', 'title' => 'IT Project Management', 'units' => 3, 'description' => 'IT project management principles and practices'],
            ['course_code' => 'ITE401', 'title' => 'Cloud Computing', 'units' => 3, 'description' => 'Cloud services, virtualization, and deployment strategies'],
            ['course_code' => 'ITE402', 'title' => 'Data Analytics', 'units' => 3, 'description' => 'Data analytics and business intelligence'],
            ['course_code' => 'ITE403', 'title' => 'Emerging Technologies', 'units' => 3, 'description' => 'Emerging technologies in information technology'],

            // Computer Science Courses
            ['course_code' => 'CS101', 'title' => 'Introduction to Computer Science', 'units' => 3, 'description' => 'Fundamentals of programming, algorithms, and data structures'],
            ['course_code' => 'CS102', 'title' => 'Programming Fundamentals', 'units' => 3, 'description' => 'Programming fundamentals and problem solving'],
            ['course_code' => 'CS201', 'title' => 'Data Structures and Algorithms', 'units' => 3, 'description' => 'Advanced data structures, sorting, searching, and algorithm analysis'],
            ['course_code' => 'CS202', 'title' => 'Database Systems', 'units' => 3, 'description' => 'Relational databases, SQL, normalization, and database design'],
            ['course_code' => 'CS301', 'title' => 'Operating Systems', 'units' => 3, 'description' => 'Process management, memory management, file systems, and concurrency'],
            ['course_code' => 'CS302', 'title' => 'Computer Networks', 'units' => 3, 'description' => 'Network protocols, TCP/IP, routing, and network security'],
            ['course_code' => 'CS303', 'title' => 'Computer Architecture', 'units' => 3, 'description' => 'Computer architecture and organization'],
            ['course_code' => 'CS304', 'title' => 'Application Development', 'units' => 3, 'description' => 'Application development and deployment'],
            ['course_code' => 'CS401', 'title' => 'Software Engineering', 'units' => 3, 'description' => 'Software development lifecycle, testing, and project management'],
            ['course_code' => 'CS402', 'title' => 'Artificial Intelligence', 'units' => 3, 'description' => 'Machine learning, neural networks, and AI applications'],
            ['course_code' => 'CS403', 'title' => 'Capstone Project 2', 'units' => 3, 'description' => 'Capstone project continuation'],
            ['course_code' => 'CS404', 'title' => 'Practicum/Internship', 'units' => 6, 'description' => 'Industry practicum or internship'],

            // Business / Management Courses
            ['course_code' => 'BUS101', 'title' => 'Introduction to Business', 'units' => 3, 'description' => 'Business fundamentals, entrepreneurship, and management principles'],
            ['course_code' => 'BUS201', 'title' => 'Financial Accounting', 'units' => 3, 'description' => 'Accounting principles, financial statements, and reporting'],
            ['course_code' => 'BUS202', 'title' => 'Marketing Management', 'units' => 3, 'description' => 'Marketing strategies, consumer behavior, and brand management'],
            ['course_code' => 'BUS301', 'title' => 'Organizational Behavior', 'units' => 3, 'description' => 'Leadership, team dynamics, and organizational culture'],
            ['course_code' => 'BUS302', 'title' => 'Strategic Management', 'units' => 3, 'description' => 'Business strategy, competitive analysis, and decision making'],

            // Mathematics / Science Courses
            ['course_code' => 'MATH101', 'title' => 'College Algebra', 'units' => 3, 'description' => 'Functions, equations, inequalities, and mathematical modeling'],
            ['course_code' => 'MATH102', 'title' => 'Calculus I', 'units' => 4, 'description' => 'Limits, derivatives, and applications of differentiation'],
            ['course_code' => 'MATH201', 'title' => 'Calculus II', 'units' => 4, 'description' => 'Integration techniques, sequences, and series'],
            ['course_code' => 'MATH202', 'title' => 'Calculus III', 'units' => 4, 'description' => 'Multivariable calculus and vector analysis'],
            ['course_code' => 'STAT101', 'title' => 'Introduction to Statistics', 'units' => 3, 'description' => 'Descriptive statistics, probability, and inferential statistics'],
            ['course_code' => 'PHYS201', 'title' => 'Physics for IT', 'units' => 3, 'description' => 'Fundamentals of physics for information technology'],

            // General Education Courses
            ['course_code' => 'ENG101', 'title' => 'English Composition', 'units' => 3, 'description' => 'Academic writing and composition skills'],
            ['course_code' => 'ENG102', 'title' => 'Speech Communication', 'units' => 3, 'description' => 'Public speaking and interpersonal communication'],
            ['course_code' => 'FIL101', 'title' => 'Komunikasyon sa Akademikong Filipino', 'units' => 3, 'description' => 'Academic communication in Filipino'],
            ['course_code' => 'FIL102', 'title' => 'Pagbasa at Pagsulat sa Iba\'t Ibang Disiplina', 'units' => 3, 'description' => 'Reading and writing across disciplines in Filipino'],

            // Physical Education Courses
            ['course_code' => 'PE101', 'title' => 'Physical Fitness', 'units' => 2, 'description' => 'Physical fitness and wellness'],
            ['course_code' => 'PE102', 'title' => 'Rhythmic Activities', 'units' => 2, 'description' => 'Rhythmic movements and dance'],
            ['course_code' => 'PE201', 'title' => 'Individual/Dual Sports', 'units' => 2, 'description' => 'Individual and dual sports activities'],
            ['course_code' => 'PE202', 'title' => 'Team Sports', 'units' => 2, 'description' => 'Team sports and group activities'],

            // NSTP Courses
            ['course_code' => 'NSTP101', 'title' => 'National Service Training Program 1', 'units' => 3, 'description' => 'Civic welfare training service'],
            ['course_code' => 'NSTP102', 'title' => 'National Service Training Program 2', 'units' => 3, 'description' => 'Literacy training service'],

            // IT Elective Courses
            ['course_code' => 'ELEC301', 'title' => 'Professional Elective 1', 'units' => 3, 'description' => 'Specialized IT elective'],
            ['course_code' => 'ELEC302', 'title' => 'Professional Elective 2', 'units' => 3, 'description' => 'Specialized IT elective'],
            ['course_code' => 'ELEC401', 'title' => 'Professional Elective 3', 'units' => 3, 'description' => 'Specialized IT elective'],
            ['course_code' => 'ELEC402', 'title' => 'Professional Elective 4', 'units' => 3, 'description' => 'Specialized IT elective'],
            ['course_code' => 'ELEC403', 'title' => 'Professional Elective 5', 'units' => 3, 'description' => 'Specialized IT elective'],
        ];

        foreach ($courseData as $data) {
            Course::firstOrCreate(
                ['course_code' => $data['course_code']],
                array_merge($data, ['status' => 'ACTIVE'])
            );
        }

        $this->command->info('Courses seeded successfully!');
    }
}
