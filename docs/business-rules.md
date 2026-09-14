# Business Rules

## Overview

This document records the business rules for the Student Information Management REST API. These rules were established in Phase 0 and implemented throughout the application.

## Role Definitions

| Role | Description | Permissions Scope |
|------|-------------|-------------------|
| **ADMIN** | System administrator | All managed resources and user accounts |
| **REGISTRAR** | Academic registrar | Students, catalogs, terms, offerings, enrollments, academic records, grades |
| **INSTRUCTOR** | Course instructor | Assigned offerings, roster information, grades for assigned enrollments |
| **STUDENT** | Enrolled student | Own profile, enrollments, published grades, academic record |

## User Status

| Status | Description |
|--------|-------------|
| **ACTIVE** | User can log in and access permitted resources |
| **INACTIVE** | User cannot log in; existing tokens revoked |

## Student Status

| Status | Description |
|--------|-------------|
| **ACTIVE** | Currently enrolled, can receive new enrollments |
| **INACTIVE** | Not currently enrolled, cannot receive new enrollments |
| **GRADUATED** | Completed program, read-only access to records |

## Catalog Status (Programs & Courses)

| Status | Description |
|--------|-------------|
| **ACTIVE** | Available for new offerings/enrollments |
| **INACTIVE** | Archived, preserved for academic history |

## Academic Term Status

| Status | Description |
|--------|-------------|
| **PLANNED** | Future term, not yet open for enrollment |
| **OPEN** | Current term, enrollments allowed |
| **CLOSED** | Past term, no new enrollments |

## Course Offering Status

| Status | Description |
|--------|-------------|
| **OPEN** | Accepting enrollments |
| **CLOSED** | Not accepting enrollments (full or past deadline) |
| **CANCELLED** | Offering cancelled, no enrollments allowed |

## Enrollment Status

| Status | Description |
|--------|-------------|
| **ENROLLED** | Currently enrolled in the offering |
| **DROPPED** | Withdrawn from offering (record preserved) |
| **COMPLETED** | Finished the offering (grade expected) |

## Grade Scale

| Scale | Value | Description |
|-------|-------|-------------|
| **Range** | 0–100 | Numeric grade (configurable per institution) |
| **Passing** | ≥ 75 | Minimum passing grade (confirm with institution) |

## Grade Status

| Status | Description |
|--------|-------------|
| **DRAFT** | Instructor working on grade, not visible to students |
| **PUBLISHED** | Final grade, visible to student and included in academic record |

## Student-Visible Grades

- **Only PUBLISHED grades** are visible to students
- DRAFT grades are hidden from student endpoints
- Academic records only include published grades

## Capacity Rules

| Rule | Implementation |
|------|----------------|
| Capacity is a positive integer | Database constraint + validation |
| Occupied seats = non-dropped enrollments | `ENROLLED` + `COMPLETED` statuses |
| Cannot exceed capacity | Checked in transaction with row lock |
| Cannot reduce capacity below occupied | Validation on offering update |

## Enrollment Rules

| Rule | Implementation |
|------|----------------|
| Unique student/offering pair | Composite unique constraint in database |
| Student must be ACTIVE | Checked in EnrollmentService |
| Offering must be OPEN | Checked in EnrollmentService |
| Term must be OPEN | Checked in EnrollmentService |
| Instructor must be INSTRUCTOR role + ACTIVE | Validated on offering creation |
| Duplicate enrollment returns 409 | Database constraint + service check |
| Dropped enrollment can be restored | Updates existing record, rechecks capacity |
| Graded enrollment cannot be dropped | Policy prevents status change to DROPPED |

## Grade Rules

| Rule | Implementation |
|------|----------------|
| One grade per enrollment | Unique constraint on `enrollment_id` |
| Grade range 0–100 | Validation in Form Request |
| Instructor must teach the offering | Policy via enrollment → offering → instructor |
| No grades for dropped enrollments | Validation in GradeService |
| Publication requires final grade | Validation in GradeService |
| Published grades immutable | Policy prevents modification of published grades |
| Pass/fail derived from scale | Computed in GradeResource |

## Academic Record Rules

| Rule | Implementation |
|------|----------------|
| Grouped by academic term | AcademicRecordService groups by term |
| Includes: term, course, offering, enrollment, grade | Resource transformation |
| Missing grades shown as null (not zero) | Resource returns null for unpublished |
| No GPA calculation | Not implemented (requires institutional policy) |
| Paginated by term | Bounded response size |
| Students see only published grades | Scoped query in service |

## Deactivation vs Deletion

| Resource | Behavior |
|----------|----------|
| **Users** | Status → INACTIVE (tokens revoked) |
| **Students** | Status → INACTIVE (preserved for history) |
| **Programs** | Status → INACTIVE (preserved for history) |
| **Courses** | Status → INACTIVE (preserved for history) |
| **Academic Terms** | Status → CLOSED (preserved for history) |
| **Course Offerings** | Status → CANCELLED (preserved for history) |
| **Enrollments** | Status → DROPPED (preserved for history) |
| **Grades** | Hard delete (admin only, with caution) |

## Referential Integrity

| Relationship | Constraint |
|--------------|------------|
| User → Student | One-to-one, nullable `user_id` on students |
| Program → Students | One-to-many, `program_id` on students |
| Course → Offerings | One-to-many, `course_id` on offerings |
| Term → Offerings | One-to-many, `academic_term_id` on offerings |
| User (Instructor) → Offerings | One-to-many, `instructor_id` on offerings |
| Student → Enrollments | One-to-many, `student_id` on enrollments |
| Offering → Enrollments | One-to-many, `course_offering_id` on enrollments |
| Enrollment → Grade | One-to-one, `enrollment_id` on grades (unique) |

## Validation Rules Summary

### Programs
- `code`: required, unique, max 20 chars
- `name`: required, max 100 chars
- `status`: required, in: ACTIVE, INACTIVE

### Courses
- `course_code`: required, unique, max 20 chars
- `title`: required, max 150 chars
- `units`: required, numeric, min 0.5, max 6
- `status`: required, in: ACTIVE, INACTIVE

### Academic Terms
- `academic_year`: required, format YYYY-YYYY
- `semester`: required, in: 1st, 2nd, Summer
- `start_date`: required, date
- `end_date`: required, date, after start_date
- `status`: required, in: PLANNED, OPEN, CLOSED
- Unique: academic_year + semester

### Students
- `student_number`: required, unique, format YYYY-NNNNN
- `first_name`: required, max 50 chars
- `last_name`: required, max 50 chars
- `email`: nullable, email, unique
- `program_id`: required, exists:programs
- `year_level`: required, integer 1–6
- `status`: required, in: ACTIVE, INACTIVE, GRADUATED
- `user_id`: nullable, unique, exists:users, role=STUDENT

### Course Offerings
- `course_id`: required, exists:courses
- `academic_term_id`: required, exists:academic_terms
- `instructor_id`: required, exists:users, role=INSTRUCTOR, status=ACTIVE
- `section`: required, string
- `capacity`: required, integer, min 1
- `status`: required, in: OPEN, CLOSED, CANCELLED
- Unique: course_id + academic_term_id + section

### Enrollments
- `student_id`: required, exists:students, status=ACTIVE
- `course_offering_id`: required, exists:course_offerings, status=OPEN
- `enrollment_date`: required, date
- `status`: in: ENROLLED, DROPPED, COMPLETED
- Unique: student_id + course_offering_id

### Grades
- `enrollment_id`: required, unique, exists:enrollments, status!=DROPPED
- `midterm_grade`: nullable, numeric 0–100
- `final_grade`: nullable, numeric 0–100
- `remarks`: nullable, string
- `status`: required, in: DRAFT, PUBLISHED
- Publication requires final_grade

## Error Response Standards

| Status | When | Response Format |
|--------|------|-----------------|
| 400 | Malformed JSON | `{ "message": "Malformed request" }` |
| 401 | Missing/invalid/expired token | `{ "message": "Unauthenticated" }` |
| 403 | Authenticated but not authorized | `{ "message": "Forbidden" }` |
| 404 | Resource not found | `{ "message": "Not found" }` |
| 409 | Business conflict (duplicate, full) | `{ "message": "Conflict", "error": "..." }` |
| 422 | Validation failure | `{ "message": "Validation failed", "errors": {...} }` |
| 500 | Unexpected server error | `{ "message": "Internal server error" }` |

## Configuration Notes

- Grading scale (0–100, passing 75) should be confirmed with institution
- Token lifetime: 24 hours (configurable in `config/sanctum.php`)
- Rate limiting: 60 requests/minute on auth endpoints
- Pagination: default 20, max 100 per page