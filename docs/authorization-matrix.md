# Authorization Matrix

## Overview

This document defines the authorization rules for each role and resource in the Student Information Management REST API.

## Role Hierarchy

```
ADMIN (highest)
  │
  ├── REGISTRAR
  │
  ├── INSTRUCTOR
  │
  └── STUDENT (lowest)
```

## Resource Access Matrix

| Resource | ADMIN | REGISTRAR | INSTRUCTOR | STUDENT |
|----------|-------|-----------|------------|---------|
| **Authentication** | | | | |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ |
| **Users** | | | | |
| GET /users | ✅ | ❌ | ❌ | ❌ |
| POST /users | ✅ | ❌ | ❌ | ❌ |
| GET /users/{id} | ✅ | ❌ | ❌ | Own only |
| PATCH /users/{id} | ✅ | ❌ | ❌ | Own only* |
| DELETE /users/{id} | ✅ | ❌ | ❌ | ❌ |
| **Programs** | | | | |
| GET /programs | ✅ | ✅ | ✅ | ✅ |
| POST /programs | ✅ | ✅ | ❌ | ❌ |
| GET /programs/{id} | ✅ | ✅ | ✅ | ✅ |
| PATCH /programs/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE /programs/{id} | ✅ | ✅ | ❌ | ❌ |
| **Courses** | | | | |
| GET /courses | ✅ | ✅ | ✅ | ✅ |
| POST /courses | ✅ | ✅ | ❌ | ❌ |
| GET /courses/{id} | ✅ | ✅ | ✅ | ✅ |
| PATCH /courses/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE /courses/{id} | ✅ | ✅ | ❌ | ❌ |
| **Academic Terms** | | | | |
| GET /academic-terms | ✅ | ✅ | ❌ | ❌ |
| POST /academic-terms | ✅ | ✅ | ❌ | ❌ |
| GET /academic-terms/{id} | ✅ | ✅ | ❌ | ❌ |
| PATCH /academic-terms/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE /academic-terms/{id} | ✅ | ✅ | ❌ | ❌ |
| **Course Offerings** | | | | |
| GET /course-offerings | ✅ | ✅ | Assigned only | ✅ |
| POST /course-offerings | ✅ | ✅ | ❌ | ❌ |
| GET /course-offerings/{id} | ✅ | ✅ | Assigned only | ✅ |
| PATCH /course-offerings/{id} | ✅ | ✅ | Assigned only | ❌ |
| DELETE /course-offerings/{id} | ✅ | ✅ | ❌ | ❌ |
| **Enrollments** | | | | |
| GET /enrollments | ✅ | ✅ | Assigned only | Own only |
| POST /enrollments | ✅ | ✅ | ❌ | ❌ |
| GET /enrollments/{id} | ✅ | ✅ | Assigned only | Own only |
| PATCH /enrollments/{id} | ✅ | ✅ | Assigned only | ❌ |
| DELETE /enrollments/{id} | ✅ | ✅ | ❌ | ❌ |
| GET /students/{id}/enrollments | ✅ | ✅ | Assigned only | Own only |
| GET /course-offerings/{id}/students | ✅ | ✅ | Assigned only | ❌ |
| **Grades** | | | | |
| GET /grades | ✅ | ✅ | Assigned only | Own published only |
| POST /grades | ✅ | ✅ | Assigned only | ❌ |
| GET /grades/{id} | ✅ | ✅ | Assigned only | Own published only |
| PATCH /grades/{id} | ✅ | ✅ | Assigned only | ❌ |
| GET /students/{id}/grades | ✅ | ✅ | Assigned only | Own published only |
| **Academic Records** | | | | |
| GET /students/{id}/academic-record | ✅ | ✅ | Assigned only | Own only |

*Students can only update their own profile (name, contact info), not role/status.

## Detailed Permission Rules

### ADMIN
- Full access to all resources
- Can manage user accounts (create, update roles, deactivate)
- Can override business rules (with caution)
- Subject to data integrity constraints (foreign keys, unique constraints)

### REGISTRAR
- Student management: create, read, update, deactivate
- Catalog management: programs, courses, terms, offerings
- Enrollment management: create, read, update, drop
- Grade management: read all, create/update for any enrollment
- Academic records: read all
- Cannot: manage user accounts, assign ADMIN role

### INSTRUCTOR
- Can only access offerings where they are the assigned instructor
- Can view roster (students) for assigned offerings
- Can create/update grades for enrollments in assigned offerings
- Cannot: create offerings, manage students, access other instructors' data
- Cannot: drop enrollments, publish grades without final grade

### STUDENT
- Can only access own profile
- Can view own enrollments
- Can view own published grades
- Can view own academic record
- Cannot: create/update/delete any resource
- Cannot: access other students' data
- Cannot: see draft grades

## Policy Implementation

Each resource has a corresponding Policy class:

```
app/Policies/
├── UserPolicy.php
├── ProgramPolicy.php
├── CoursePolicy.php
├── AcademicTermPolicy.php
├── CourseOfferingPolicy.php
├── EnrollmentPolicy.php
├── GradePolicy.php
└── StudentPolicy.php
```

### Policy Methods

| Method | Purpose |
|--------|---------|
| `viewAny` | Authorize listing resources |
| `view` | Authorize viewing single resource |
| `create` | Authorize creating resource |
| `update` | Authorize updating resource |
| `delete` | Authorize deleting resource |

### Scoped Queries

Collection endpoints apply authorization scope before filtering:

```php
// Example: Enrollment index
$query = Enrollment::query();

// Apply role-based scope
if (auth()->user()->role === 'INSTRUCTOR') {
    $query->whereHas('courseOffering', fn($q) => $q->where('instructor_id', auth()->id()));
}

if (auth()->user()->role === 'STUDENT') {
    $query->where('student_id', auth()->user()->student?->id);
}

// Then apply filters, pagination
```

## Special Cases

### User Self-Management
- Students can update own profile (name, email, phone, address)
- Students cannot change role, status, or password via profile endpoint
- Password change requires separate endpoint (not implemented)

### Grade Publication
- Only instructors of the offering can publish grades
- Publication requires valid final_grade
- Once published, grades cannot be modified by instructor
- Admin/Registrar can modify published grades (audit trail recommended)

### Enrollment Dropping
- Students cannot drop themselves (requires registrar/admin)
- Instructors cannot drop students
- Dropped enrollments preserve grade if exists
- Graded enrollments cannot be dropped without correction process

### Academic Record Access
- Students: own record only
- Instructors: records of students in their offerings
- Registrar/Admin: all records
- Record excludes draft grades for students

## Testing Authorization

Each policy method has corresponding tests:

```bash
# Run authorization tests
php artisan test --filter="Authorization"
php artisan test --filter="Policy"
```

Test coverage includes:
- Admin allowed for all operations
- Student denied for management operations
- Instructor denied for unrelated offerings
- Another student's record denied
- Scoped collection totals correct