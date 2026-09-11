# Requirements and Business Rules

This document freezes the requirements and business rules for the Laravel Student Information Management REST API. All implementation, tests, and documentation must align with these decisions.

---

## Required Modules

Track these ten modules with their implementation location and verification method:

| Module | Implementation Location | Verification |
|--------|------------------------|--------------|
| **Authentication** | `backend/app/Http/Controllers/Api/V1/AuthController.php`, `backend/routes/api.php` | Valid login returns token; invalid credentials return 401; logout revokes token; expired token rejected |
| **Users and Roles** | `backend/app/Models/User.php`, `backend/app/Enums/Role.php`, `backend/app/Policies/UserPolicy.php` | Role enum enforced; only admin can manage users; inactive users cannot authenticate |
| **Students** | `backend/app/Models/Student.php`, `backend/app/Http/Controllers/Api/V1/StudentController.php`, `backend/app/Policies/StudentPolicy.php` | Unique student number enforced; student privacy via policies; CRUD operations tested |
| **Programs** | `backend/app/Models/Program.php`, `backend/app/Http/Controllers/Api/V1/ProgramController.php`, `backend/app/Policies/ProgramPolicy.php` | Unique code enforced; status validation; CRUD operations tested |
| **Courses** | `backend/app/Models/Course.php`, `backend/app/Http/Controllers/Api/V1/CourseController.php`, `backend/app/Policies/CoursePolicy.php` | Unique course code enforced; decimal units; status validation; CRUD operations tested |
| **Academic Terms** | `backend/app/Models/AcademicTerm.php`, `backend/app/Http/Controllers/Api/V1/AcademicTermController.php`, `backend/app/Policies/AcademicTermPolicy.php` | Unique year/semester pair; date ordering validated; status validation; CRUD operations tested |
| **Course Offerings** | `backend/app/Models/CourseOffering.php`, `backend/app/Http/Controllers/Api/V1/CourseOfferingController.php`, `backend/app/Policies/CourseOfferingPolicy.php` | Course, term, instructor validated; unique section per course/term; capacity validated; CRUD operations tested |
| **Enrollments** | `backend/app/Models/Enrollment.php`, `backend/app/Services/EnrollmentService.php`, `backend/app/Http/Controllers/Api/V1/EnrollmentController.php`, `backend/app/Policies/EnrollmentPolicy.php` | Atomic transaction with row locking; duplicate prevention via unique constraint; capacity enforcement; status transitions tested |
| **Grades** | `backend/app/Models/Grade.php`, `backend/app/Services/GradeService.php`, `backend/app/Http/Controllers/Api/V1/GradeController.php`, `backend/app/Policies/GradePolicy.php` | One grade per enrollment; grade range validation; instructor authorization; draft/published states; publication requires final grade |
| **Academic Records** | `backend/app/Services/AcademicRecordService.php`, `backend/app/Http/Controllers/Api/V1/AcademicRecordController.php` | Term-grouped response; ownership verified; draft grades excluded; missing grades not treated as zero; pagination by term |

---

## Requirement Verification Matrix

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| Unique student number | Validation (Form Request) + Database unique constraint on `students.student_number` | Duplicate creation test returns 422/409 |
| Student privacy | Policy (`StudentPolicy::view`) + Scoped queries in controller | Another student's record returns 403 |
| Duplicate enrollment prevention | Composite unique constraint on `enrollments(student_id, course_offering_id)` + `EnrollmentService` transaction | Repeated enrollment returns 409 Conflict |
| Complete documentation | OpenAPI spec (`docs/openapi.yaml`) + Postman collection (`docs/postman/`) | Documented requests execute successfully via Postman/curl |

---

## Business Rules (Agreed Decisions)

These are project decisions recorded so code, tests, and documentation agree.

### Roles and Statuses

| Area | Decision |
|------|----------|
| **Roles** | `ADMIN`, `REGISTRAR`, `INSTRUCTOR`, `STUDENT` (stored as enum on `users.role`) |
| **User Status** | `ACTIVE`, `INACTIVE` (stored on `users.status`) |
| **Student Status** | `ACTIVE`, `INACTIVE`, `GRADUATED` (stored on `students.status`) |
| **Year Level** | Integer from 1 to 6 (stored on `students.year_level`) |
| **Catalog Status** (Programs, Courses) | `ACTIVE`, `INACTIVE` |
| **Term Status** | `PLANNED`, `OPEN`, `CLOSED` |
| **Offering Status** | `OPEN`, `CLOSED`, `CANCELLED` |
| **Enrollment Status** | `ENROLLED`, `DROPPED`, `COMPLETED` |
| **Grade Scale** | **0–100**, with passing at **75** (confirmed with instructor) |
| **Grade Status** | `DRAFT`, `PUBLISHED` |
| **Student-Visible Grades** | Published grades only |
| **Capacity** | Positive integer; occupied seats count non-dropped enrollments (`ENROLLED` + `COMPLETED`) |
| **Enrollment Deletion** | Change status to `DROPPED`; preserve the record (soft delete via status) |
| **Catalog Deletion** | Deactivate resource (set status to `INACTIVE`); preserve academic history |

### Enrollment-to-Grade Workflow Rules

1. **Only active instructor accounts** can be assigned to offerings.
2. **Students must be active** to receive a new enrollment.
3. **New enrollments require** an open term (`OPEN`) and an open offering (`OPEN`).
4. **A student cannot have two enrollment rows** for the same offering (enforced by composite unique constraint).
5. **Restoring a dropped enrollment** updates the existing row and rechecks capacity.
6. **An offering's capacity cannot be reduced** below its occupied seats.
7. **An enrollment with a published grade cannot be dropped** without an explicitly defined correction process.
8. **Grades belong to enrollments**, not directly to students or courses.

### Authorization Rules (Permission Matrix)

| Role | Allowed Scope | Important Restriction |
|------|---------------|----------------------|
| **Administrator** | All managed resources and user accounts | Still subject to data-integrity rules |
| **Registrar** | Students, catalogs, terms, offerings, enrollments, academic records, grades | Cannot grant administrative roles |
| **Instructor** | Assigned offerings, roster information, grades for assigned enrollments | No unrelated offerings or student records |
| **Student** | Own profile, enrollments, published grades, academic record | No management operations or other students' records |

### Scoped Query Requirements

- `GET /grades` must not expose everyone's grades to students.
- `GET /course-offerings` must restrict instructors to assigned offerings.
- `GET /students/{id}/academic-record` must verify ownership or staff permission.
- `POST /grades` must authorize access to the enrollment supplied in the body.
- Pagination totals must count only records the caller is authorized to see.
- Instructors may need student names and student numbers for a roster, but should not automatically receive birth dates, addresses, and unrelated academic history.

---

## Schema Decisions

### Tables and Key Fields

| Table | Important Fields and Constraints |
|-------|----------------------------------|
| **users** | `id`, `name`, `email` (unique), `password` (hashed), `role` (enum), `status` (enum) |
| **students** | `id`, `student_number` (unique), `user_id` (unique, nullable), `first_name`, `last_name`, `middle_name`, `email`, `phone`, `address`, `birth_date`, `program_id` (FK), `year_level` (1-6), `status` (enum) |
| **programs** | `id`, `code` (unique), `name`, `description`, `status` (enum) |
| **courses** | `id`, `course_code` (unique), `title`, `units` (decimal), `description`, `status` (enum) |
| **academic_terms** | `id`, `academic_year`, `semester`, `start_date`, `end_date`, `status` (enum); unique on `(academic_year, semester)` |
| **course_offerings** | `id`, `course_id` (FK), `academic_term_id` (FK), `instructor_id` (FK to users), `section`, `schedule`, `room`, `capacity` (positive int), `status` (enum); unique on `(course_id, academic_term_id, section)` |
| **enrollments** | `id`, `student_id` (FK), `course_offering_id` (FK), `enrollment_date`, `status` (enum); unique on `(student_id, course_offering_id)` |
| **grades** | `id`, `enrollment_id` (FK, unique), `midterm_grade` (decimal, nullable), `final_grade` (decimal, nullable), `remarks`, `status` (enum: `DRAFT`, `PUBLISHED`) |

### Integrity Rules

- Foreign keys for every relationship.
- Composite unique constraint on `enrollments(student_id, course_offering_id)` at database level.
- `grades.enrollment_id` is unique (one grade per enrollment).
- Unique offering identity: `course_id`, `academic_term_id`, `section`.
- Decimal columns for `courses.units`, `grades.midterm_grade`, `grades.final_grade`.
- Validate that term's `end_date` follows `start_date`.
- Prefer restricted deletion over cascading away academic records.
- Index frequently filtered fields: `students.program_id`, `students.status`, `course_offerings.academic_term_id`, `course_offerings.instructor_id`, `enrollments.student_id`, `enrollments.course_offering_id`.

---

## Seed Data Minimums

| Entity | Minimum Records |
|--------|-----------------|
| Users | 5 (at least 6 for demo: 1 admin, 1 registrar, 2 instructors, 2 students linked to profiles) |
| Programs | 3 |
| Students | 100 |
| Courses | 20 |
| Academic Terms | 2 |
| Course Offerings | 20 |
| Enrollments | 200 |
| Grades | 100 |

### Seed Data Generation Order

```
Users and programs
    → Students and courses and terms
    → Offerings
    → Enrollments
    → Grades
```

### Deterministic Fixtures Required

- At least one full offering (at capacity)
- Two different instructors' offerings
- Published vs. draft grades
- Avoid random seed logic that sometimes violates capacity

---

## Phase 0 Checkpoint

> **You can explain the entire enrollment-to-grade workflow without referring to code.**

### Enrollment-to-Grade Workflow Explanation

1. **Administrator/Registrar creates** a Program, Course, and Academic Term (with `OPEN` status).
2. **Administrator/Registrar creates** a Course Offering linking the Course, Term, and an Instructor (who must have `INSTRUCTOR` role and `ACTIVE` status), with a section, capacity, and `OPEN` status.
3. **Registrar (or Student via self-service)** creates an Enrollment for an `ACTIVE` Student into the `OPEN` Offering during an `OPEN` Term.
   - System checks: student is active, offering is open, term is open, no existing enrollment, capacity not exceeded.
   - If all checks pass, enrollment created with `ENROLLED` status.
4. **Instructor** (assigned to the offering) encodes grades for enrollments in their offering.
   - Creates/updates Grade record for a specific enrollment.
   - Validates grade range (0-100).
   - Grade starts as `DRAFT`.
5. **Instructor publishes** the grade (changes status to `PUBLISHED`).
   - Requires a valid final grade.
   - Once published, student can see the grade.
6. **Student** retrieves their Academic Record.
   - Returns term-grouped data: course code, title, units, section, enrollment status, final grade (if published), remarks.
   - Draft grades are excluded.
   - Missing grades are not treated as zero.
7. **Enrollment completion**: When term ends, enrollment status may change to `COMPLETED`.
8. **Dropping enrollment**: Changes status to `DROPPED` (preserves record). If grade was published, requires correction process.

---

## Grading Scale Confirmation

**Confirmed:** 0–100 scale with passing at 75.

> *Note: This was confirmed with the instructor before implementing grade-related logic.*

---

## Implementation Notes

- Use Laravel's conventional `users.password` field for hashed passwords.
- `students.user_id` is nullable to allow registrar to create student before issuing account.
- When student account is linked, enforce that the account has `STUDENT` role.
- Role restrictions (e.g., "instructor must be instructor account") require application validation; foreign key alone does not enforce.
- Use Form Requests for validation, Policies for authorization, API Resources for responses.
- Use Services for multi-record business transactions (EnrollmentService, GradeService, AcademicRecordService).
- Configure API exception handling so `/api/*` failures return JSON, not HTML.
- Never return a body with 204 status code.