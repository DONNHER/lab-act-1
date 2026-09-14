# Demo Checklist

## Overview

This document provides the 20-step mandatory demonstration sequence for the Student Information Management REST API. Each step corresponds to a laboratory requirement and should be executable in order.

## Prerequisites

```bash
# 1. Clone repository
git clone https://github.com/DONNHER/act-1.git
cd act-1

# 2. Install PHP dependencies
cd backend
composer install

# 3. Configure environment
cp .env.example .env
# Edit .env with database credentials

# 4. Generate key and setup database
php artisan key:generate
php artisan migrate:fresh --seed

# 5. Start server
php artisan serve
```

Server runs at: `http://127.0.0.1:8000`
API base URL: `http://127.0.0.1:8000/api/v1`

---

## Demonstration Sequence

### 1. Start API & Demonstrate Database Connectivity

```bash
# Terminal 1: Start server
cd backend && php artisan serve

# Terminal 2: Verify database
php artisan migrate:status
php artisan tinker --execute="echo 'Users: ' . App\Models\User::count();"
```

**Expected**: Server starts on port 8000, migrations show all tables, tinker shows seeded data.

---

### 2. Authenticate Successfully

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

**Expected**: 200 OK with token in response. Save token as `ADMIN_TOKEN`.

```bash
# Repeat for other roles
curl -X POST ... -d '{"email": "registrar@example.com", "password": "password"}'  # REGISTRAR_TOKEN
curl -X POST ... -d '{"email": "instructor1@example.com", "password": "password"}'  # INSTRUCTOR_TOKEN
curl -X POST ... -d '{"email": "student1@example.com", "password": "password"}'  # STUDENT_TOKEN
```

---

### 3. Show Protected Request Failing Without Authentication

```bash
curl -X GET http://127.0.0.1:8000/api/v1/auth/me
```

**Expected**: 401 Unauthenticated

```json
{
  "message": "Unauthenticated"
}
```

---

### 4. Create a Program

```bash
curl -X POST http://127.0.0.1:8000/api/v1/programs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "BSCS", "name": "Bachelor of Science in Computer Science", "status": "ACTIVE"}'
```

**Expected**: 201 Created with program data. Save `id` as `PROGRAM_ID`.

---

### 5. Create a Valid Student

```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_number": "2026-00001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "program_id": '$PROGRAM_ID',
    "year_level": 1,
    "status": "ACTIVE"
  }'
```

**Expected**: 201 Created with student data. Save `id` as `STUDENT_ID`.

---

### 6. Reject Invalid or Duplicate Student

**Duplicate student number:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/students \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_number": "2026-00001",
    "first_name": "Jane",
    "last_name": "Smith",
    "program_id": '$PROGRAM_ID',
    "year_level": 1,
    "status": "ACTIVE"
  }'
```

**Expected**: 422 Validation failed - "The student number has already been taken."

**Invalid email:**
```bash
curl -X POST ... -d '{"student_number": "2026-00002", "first_name": "Jane", "last_name": "Smith", "email": "invalid", "program_id": '$PROGRAM_ID', "year_level": 1, "status": "ACTIVE"}'
```

**Expected**: 422 Validation failed - "The email must be a valid email address."

---

### 7. Retrieve and Update a Student

**Retrieve:**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/$STUDENT_ID \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Expected**: 200 OK with student data.

**Update:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/students/$STUDENT_ID \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1-555-0123", "address": "123 Main St"}'
```

**Expected**: 200 OK with updated student data.

---

### 8. Search and Filter Students

**Search by name:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?search=John" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Filter by program:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?program_id=$PROGRAM_ID" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Filter by year level:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?year_level=1" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Filter by status:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?status=ACTIVE" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Expected**: 200 OK with filtered results in each case.

---

### 9. Demonstrate Sorting and Pagination

**Sort by last name (ascending):**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?sort=last_name" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Sort by last name (descending):**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?sort=-last_name" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Pagination:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/students?page=1&per_page=5" \
  -H "Authorization: Bearer $REGISTRAR_TOKEN"
```

**Expected**: 200 OK with `data`, `links`, `meta` in response. Meta shows `current_page`, `per_page`, `total`, `last_page`.

---

### 10. Create a Course and Academic Term

**Create Course:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/courses \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_code": "CS101", "title": "Introduction to Programming", "units": 3, "status": "ACTIVE"}'
```

Save `id` as `COURSE_ID`.

**Create Academic Term:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/academic-terms \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"academic_year": "2024-2025", "semester": "1st", "start_date": "2024-08-01", "end_date": "2024-12-15", "status": "OPEN"}'
```

Save `id` as `TERM_ID`.

---

### 11. Create a Course Offering

```bash
curl -X POST http://127.0.0.1:8000/api/v1/course-offerings \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": '$COURSE_ID',
    "academic_term_id": '$TERM_ID',
    "instructor_id": 3,
    "section": "A",
    "schedule": "MWF 10:00-11:00",
    "room": "Room 101",
    "capacity": 30,
    "status": "OPEN"
  }'
```

Save `id` as `OFFERING_ID`.

---

### 12. Enroll a Student

```bash
curl -X POST http://127.0.0.1:8000/api/v1/enrollments \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id": '$STUDENT_ID', "course_offering_id": '$OFFERING_ID', "enrollment_date": "2024-08-15"}'
```

**Expected**: 201 Created with enrollment data. Save `id` as `ENROLLMENT_ID`.

---

### 13. Reject Duplicate Enrollment

```bash
curl -X POST http://127.0.0.1:8000/api/v1/enrollments \
  -H "Authorization: Bearer $REGISTRAR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id": '$STUDENT_ID', "course_offering_id": '$OFFERING_ID', "enrollment_date": "2024-08-15"}'
```

**Expected**: 409 Conflict - "Student is already enrolled in this offering."

---

### 14. Encode/Update Authorized Grade

**As instructor (instructor1):**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/grades \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enrollment_id": '$ENROLLMENT_ID', "midterm_grade": 85, "final_grade": 90, "remarks": "Excellent work", "status": "PUBLISHED"}'
```

Save `id` as `GRADE_ID`.

**Expected**: 201 Created with grade data.

---

### 15. Retrieve Student's Academic Record

**As student (student1):**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/$STUDENT_ID/academic-record \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Expected**: 200 OK with academic record grouped by term, showing course, offering, enrollment status, and published grade.

---

### 16. Show Forbidden Request

**Student trying to access another student's record:**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/999 \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Expected**: 403 Forbidden - "You can only view your own academic record."

**Instructor trying to grade unrelated enrollment:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/grades \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enrollment_id": 999, "final_grade": 80, "status": "PUBLISHED"}'
```

**Expected**: 403 Forbidden - "You can only grade enrollments in your assigned offerings."

---

### 17. Show Not-Found Response

```bash
curl -X GET http://127.0.0.1:8000/api/v1/students/99999 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: 404 Not Found - "Not found"

---

### 18. Display API Documentation

**Open in browser:**
```
http://127.0.0.1:8000/api/documentation
```

**Or view raw specs:**
```bash
curl http://127.0.0.1:8000/docs/api-docs.json | jq .
curl http://127.0.0.1:8000/docs/api-docs.yaml
```

**Expected**: Swagger UI loads with all endpoints documented. JSON/YAML specs valid.

---

### 19. Run Automated Tests

```bash
cd backend
php artisan test
./vendor/bin/pint --test
composer validate
composer audit
```

**Expected**: 
- 118 tests pass (389 assertions)
- Code style passes
- Composer validation passes
- No security vulnerabilities

---

### 20. Explain AI-Assisted Contribution

**Example**: "The EnrollmentService.createEnrollment() method was AI-assisted. The AI generated the transaction logic with row locking for capacity checking. I verified it by:
1. Reviewing the code for correct SELECT FOR UPDATE usage
2. Running enrollment tests including concurrent enrollment scenarios
3. Testing duplicate enrollment rejection (409)
4. Testing full offering rejection (409)
5. Confirming dropped enrollment restoration rechecks capacity"

---

## Cleanup

```bash
# Logout to revoke tokens
curl -X POST http://127.0.0.1:8000/api/v1/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Verify token revoked
curl -X GET http://127.0.0.1:8000/api/v1/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 401 Unauthenticated
```

---

## Notes

- All IDs (PROGRAM_ID, STUDENT_ID, etc.) are captured from previous step responses
- Use disposable demonstration records - the sequence is repeatable
- Run `php artisan migrate:fresh --seed` to reset between demonstrations
- Browser CORS must be tested separately from Postman/curl