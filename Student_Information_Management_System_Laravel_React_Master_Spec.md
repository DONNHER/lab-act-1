# Student Information Management System
## Laravel Backend + React Frontend
### Master Project Requirements, Architecture, Workflow, and AI Agent Prompt

---

## 0. PURPOSE OF THIS FILE

This file is the **single source of truth** for implementing the Student Information Management System (SIMS) required by the two laboratory activities:

1. **Backend Laboratory Activity** — AI-Assisted Framework-Based REST API Development
2. **Frontend Laboratory Activity** — AI-Assisted Frontend Framework Integration with an Existing REST API

The implementation choice is fixed for this project:

- **Backend:** Laravel REST API
- **Database:** Relational database; PostgreSQL is recommended
- **Frontend:** React web application
- **Frontend language:** TypeScript
- **Frontend build tool:** Vite
- **API communication:** HTTP/JSON
- **API style:** RESTful, versioned under `/api/v1`
- **API documentation:** OpenAPI/Swagger
- **API testing:** Postman or equivalent
- **Automated backend testing:** Pest/PHPUnit
- **Automated frontend testing:** Vitest + Testing Library and an E2E tool such as Playwright when supported
- **Version control:** Git

The laboratory requirements remain authoritative. Technology choices may be implemented using framework conventions, but the system must preserve the required modules, REST design, security rules, validation, role behavior, testing, documentation, and client-server separation.

---

# 1. PROJECT OVERVIEW

## Project Title

**Student Information Management System**

## Backend Title

**Student Information Management REST API**

## Frontend Title

**Student Information Management System — React Web Client**

## System Goal

Build a complete, secure, documented Student Information Management System in which:

- Laravel provides the authoritative REST API.
- Laravel communicates with the relational database.
- React consumes the Laravel API over HTTP.
- React never connects directly to the database.
- The backend remains responsible for authentication, authorization, validation, business rules, and authoritative academic data.
- The frontend provides the user interface, navigation, forms, tables, client-side usability validation, loading/error states, responsive design, and role-aware user experience.

The two applications must remain logically separate.

---

# 2. NON-NEGOTIABLE ARCHITECTURE

The system must follow this architecture:

```text
                 STUDENT INFORMATION
                 MANAGEMENT SYSTEM
                         |
              +----------+----------+
              |                     |
              v                     v
       React Frontend        Laravel REST API
       Web Application             |
              |                    |
              | HTTP/JSON          |
              +---------->---------+
                                   |
                                   v
                           Relational Database
```

Detailed frontend flow:

```text
Browser
  |
  v
React Router / Layout
  |
  v
Pages / Views
  |
  v
Reusable Components
  |
  v
Forms / Validation
  |
  v
State / Query Management
  |
  v
API Client / Service Layer
  |
  v
Laravel REST API
  |
  v
Database
```

## Forbidden architecture

Do NOT implement any of these:

```text
React -> PostgreSQL
React -> MySQL
React -> SQLite database
React -> database credentials
React -> direct ORM/database access
React -> its own replacement backend
React -> local mock data as the authoritative source
React -> embedded server routes that bypass Laravel
```

The React application must consume the existing Laravel REST API.

---

# 3. USER ROLES

The system must support these four required roles:

1. Administrator
2. Registrar / Staff
3. Instructor
4. Student

## Administrator

Minimum responsibility:

- Full system administration
- Access to all managed resources, subject to the implemented permission rules

## Registrar / Staff

Minimum responsibility:

- Manage students
- Manage academic records as permitted
- Manage programs
- Manage courses
- Manage enrollments
- Manage academic terms as permitted

## Instructor

Minimum responsibility:

- View assigned course offerings
- View enrolled students in authorized offerings
- Manage grades for authorized enrollments

## Student

Minimum responsibility:

- View own profile
- View own enrollments
- View own grades
- View own academic record

## Security rule

Frontend role-aware navigation is for user experience only.

Hiding a button or blocking a frontend route is NOT authorization.

Laravel must enforce all protected permissions server-side.

A student must never access another student's confidential academic record simply by changing an ID in a URL.

---

# 4. REQUIRED DOMAIN MODULES

The backend and frontend must cover these major modules:

1. Authentication
2. Users and Roles
3. Students
4. Programs
5. Courses
6. Academic Terms
7. Course Offerings
8. Enrollments
9. Grades
10. Academic Record
11. Profile / Account
12. Dashboard

---

# 5. DATABASE REQUIREMENTS

Use a relational database.

Recommended implementation:

- PostgreSQL
- Laravel migrations
- Eloquent ORM
- Laravel seeders/factories

The schema must be reproducible from project files.

## 5.1 Required tables

```text
users
students
programs
courses
academic_terms
course_offerings
enrollments
grades
```

Additional tables may be added only when justified by the design.

---

# 6. MINIMUM DATA MODEL

## users

```text
id
name
email
password_hash
role / role_id
status
created_at
updated_at
```

## students

```text
id
student_number
first_name
middle_name
last_name
suffix
birth_date
email
contact_number
address
program_id
year_level
status
created_at
updated_at
```

## programs

```text
id
code
name
description
status
created_at
updated_at
```

## courses

```text
id
course_code
course_title
description
units
status
created_at
updated_at
```

## academic_terms

```text
id
academic_year
semester / term
start_date
end_date
status
created_at
updated_at
```

## course_offerings

```text
id
course_id
academic_term_id
instructor_id
section
schedule
room
capacity
status
created_at
updated_at
```

## enrollments

```text
id
student_id
course_offering_id
enrollment_date
status
created_at
updated_at
```

## grades

```text
id
enrollment_id
midterm_grade
final_grade / final_rating
remarks
created_at
updated_at
```

---

# 7. REQUIRED DATABASE RELATIONSHIPS

```text
Program 1 ---- N Students

Course 1 ---- N Course Offerings

Academic Term 1 ---- N Course Offerings

Instructor/User 1 ---- N Course Offerings

Student 1 ---- N Enrollments

Course Offering 1 ---- N Enrollments

Enrollment 1 ---- 1 Grade
```

## Data integrity

Required:

- `student_number` unique
- `course_code` unique
- valid foreign keys
- duplicate enrollment prevented
- appropriate indexes
- schema changes through migrations
- seed data generated by seeders/factories/fixtures

Recommended database rule for duplicate enrollment:

```text
UNIQUE(student_id, course_offering_id)
```

---

# 8. DEMONSTRATION SEED DATA

Minimum demonstration records:

```text
Users             5
Programs          3
Students        100
Courses          20
Academic Terms    2
Course Offerings 20
Enrollments     200
Grades          100
```

Do not manually insert every record.

Use:

- Laravel seeders
- factories
- Faker
- deterministic relationships where practical

Seeded users should represent the four roles, with at least one additional demonstration account as appropriate.

Do not commit real credentials.

---

# 9. REST API REQUIREMENTS

All API resources must use:

```text
/api/v1
```

Use nouns and HTTP methods.

Do NOT create action-style routes such as:

```text
/getStudents
/createStudent
/deleteStudent
```

Prefer:

```text
GET    /api/v1/students
POST   /api/v1/students
GET    /api/v1/students/{id}
PATCH  /api/v1/students/{id}
DELETE /api/v1/students/{id}
```

---

# 10. REQUIRED API ENDPOINTS

## Authentication

```http
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Students

```http
GET    /api/v1/students
POST   /api/v1/students
GET    /api/v1/students/{id}
PUT    /api/v1/students/{id}
PATCH  /api/v1/students/{id}
DELETE /api/v1/students/{id}
```

## Programs

```http
GET    /api/v1/programs
POST   /api/v1/programs
GET    /api/v1/programs/{id}
PUT    /api/v1/programs/{id}
PATCH  /api/v1/programs/{id}
DELETE /api/v1/programs/{id}
```

## Courses

```http
GET    /api/v1/courses
POST   /api/v1/courses
GET    /api/v1/courses/{id}
PUT    /api/v1/courses/{id}
PATCH  /api/v1/courses/{id}
DELETE /api/v1/courses/{id}
```

## Academic Terms

```http
GET    /api/v1/academic-terms
POST   /api/v1/academic-terms
GET    /api/v1/academic-terms/{id}
PUT    /api/v1/academic-terms/{id}
PATCH  /api/v1/academic-terms/{id}
DELETE /api/v1/academic-terms/{id}
```

## Course Offerings

```http
GET    /api/v1/course-offerings
POST   /api/v1/course-offerings
GET    /api/v1/course-offerings/{id}
PUT    /api/v1/course-offerings/{id}
PATCH  /api/v1/course-offerings/{id}
DELETE /api/v1/course-offerings/{id}
```

## Enrollments

```http
GET    /api/v1/enrollments
POST   /api/v1/enrollments
GET    /api/v1/enrollments/{id}
PATCH  /api/v1/enrollments/{id}
DELETE /api/v1/enrollments/{id}

GET /api/v1/students/{id}/enrollments
GET /api/v1/course-offerings/{id}/students
```

## Grades

```http
GET    /api/v1/grades
POST   /api/v1/grades
GET    /api/v1/grades/{id}
PUT    /api/v1/grades/{id}
PATCH  /api/v1/grades/{id}

GET /api/v1/students/{id}/grades
```

## Academic Record

```http
GET /api/v1/students/{id}/academic-record
```

---

# 11. HTTP STATUS CODES

Use consistently:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
500 Internal Server Error
```

---

# 12. API RESPONSE FORMAT

Use a predictable JSON structure.

## Success

```json
{
  "success": true,
  "message": "Student retrieved successfully.",
  "data": {
    "id": 1,
    "student_number": "2026-00001"
  }
}
```

## Validation

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": [
      "A valid email address is required."
    ]
  }
}
```

The exact Laravel implementation can use Laravel conventions, but the frontend must have a predictable way to interpret errors.

---

# 13. BACKEND VALIDATION

At minimum:

## Students

```text
student_number -> required + unique
first_name      -> required
last_name       -> required
email           -> valid email when supplied
program_id      -> existing program
year_level      -> valid documented value
status          -> valid documented value
```

## Related IDs

These must reference valid records:

```text
program_id
course_id
academic_term_id
instructor_id
student_id
course_offering_id
enrollment_id
```

## Grades

Grades must follow the grading range/rules defined by the implementation.

Server-side validation is authoritative.

---

# 14. SEARCH, FILTERING, SORTING, PAGINATION

Student collection endpoint must support:

## Search

```http
GET /api/v1/students?search=dela
```

## Filters

```http
GET /api/v1/students?program_id=1&year_level=3&status=ACTIVE
```

## Sort

```http
GET /api/v1/students?sort=last_name
```

## Pagination

```http
GET /api/v1/students?page=2&per_page=20
```

A combined request may look like:

```http
GET /api/v1/students?search=dela&program_id=1&year_level=3&page=2&per_page=20
```

Pagination response must contain enough metadata to navigate results, such as:

```text
current_page
per_page
total
last_page
```

or equivalent cursor metadata.

Collection endpoints must not return unbounded datasets.

---

# 15. AUTHENTICATION AND SECURITY

Laravel backend must:

- hash passwords securely
- protect private endpoints
- identify the current authenticated user
- implement logout/token invalidation where supported
- enforce server-side role permissions
- enforce object-level authorization
- use environment variables for secrets
- never commit actual `.env`
- never expose passwords or password hashes
- never expose authentication secrets
- use Eloquent ORM/query builder or parameterized queries
- avoid SQL injection vulnerabilities
- avoid raw stack traces in normal API responses
- configure CORS deliberately
- never log passwords or private tokens

Recommended Laravel implementation:

- Laravel Sanctum for token-based API authentication
- Form Request validation
- Policies / Gates / middleware for authorization
- API Resources or consistent response transformers
- Eloquent relationships
- dedicated service classes where business logic becomes complex

Do not add unnecessary architecture just to make the project look complicated.

---

# 16. FRONTEND REQUIREMENTS

The frontend is a pure React client.

Recommended stack:

```text
React
TypeScript
Vite
React Router
Axios or fetch
React Hook Form
Zod or equivalent
TanStack Query or a justified alternative
Tailwind CSS or another professional UI system
```

The frontend must:

- consume the real Laravel API
- authenticate through the backend
- manage protected routes
- display role-aware navigation
- consume CRUD endpoints
- consume search/filter/sort/pagination endpoints
- display backend validation errors
- handle 401/403/404/409/422/500
- handle network failure
- provide loading states
- provide empty states
- provide success feedback
- provide responsive design
- avoid direct database access

---

# 17. REQUIRED FRONTEND ROUTES/PAGES

Recommended structure:

```text
/login

/dashboard

/students
/students/create
/students/:id
/students/:id/edit

/programs
/programs/create
/programs/:id/edit

/courses
/courses/create
/courses/:id/edit

/academic-terms
/academic-terms/create
/academic-terms/:id/edit

/course-offerings
/course-offerings/create
/course-offerings/:id/edit

/enrollments
/enrollments/:id

/grades
/grades/:id/edit

/students/:id/academic-record

/profile

/403
/404
```

Exact page names can vary, but all required modules must be represented.

---

# 18. FRONTEND MODULE REQUIREMENTS

## Authentication

Must provide:

- login
- logout
- current-user identity
- invalid credential feedback
- session/token expiry handling

## Dashboard

Must provide:

- summary cards or useful overview
- quick navigation to major modules
- real backend-derived information where practical

## Students

Must provide:

- list
- search
- at least two filters
- pagination
- sorting where supported
- details
- create
- edit
- delete/deactivate
- backend validation feedback

## Programs

Must provide:

- list
- maintain/create/edit/delete as authorized

## Courses

Must provide:

- list
- create/edit/delete as authorized
- course code
- title
- units
- status

## Academic Terms

Must provide:

- list
- create/manage
- academic year
- term/semester
- dates
- status

## Course Offerings

Must provide:

- course
- academic term
- instructor
- section
- schedule
- room
- capacity
- status

## Enrollments

Must provide:

- enroll students
- view enrollments
- update status
- handle duplicate enrollment
- display backend conflict/error messages

## Grades

Must provide:

- authorized grade entry
- authorized update
- grade viewing

## Academic Record

Must present the aggregated academic record in a clear, readable format.

## Profile

Must show:

- authenticated user's identity
- role
- appropriate account details

---

# 19. FRONTEND AUTHENTICATION FLOW

Recommended:

```text
Login Form
   |
   v
POST /api/v1/auth/login
   |
   +---- failure ----> show error
   |
   v
credential/session state
   |
   v
GET /api/v1/auth/me
   |
   v
current user + role
   |
   v
protected application shell
```

Required behavior:

- public login page
- protected application layout
- current-user loading
- logout
- 401 handling
- 403 handling
- protected routing
- role-aware navigation

If the backend uses a credential mechanism different from the example, React must follow the actual backend contract.

---

# 20. ROLE-AWARE FRONTEND NAVIGATION

## Administrator

```text
Dashboard
Students
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Grades
Users/Roles if implemented
Profile
Logout
```

## Registrar / Staff

```text
Dashboard
Students
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Academic Records
Profile
Logout
```

## Instructor

```text
Dashboard
My Course Offerings
My Students
Grades
Profile
Logout
```

## Student

```text
Dashboard
My Profile
My Enrollments
My Grades
My Academic Record
Profile
Logout
```

Do not assume permissions that the backend does not grant.

---

# 21. FRONTEND API CLIENT

Create one centralized API layer.

Recommended:

```text
src/api/
  client.ts
  authApi.ts
  studentsApi.ts
  programsApi.ts
  coursesApi.ts
  termsApi.ts
  offeringsApi.ts
  enrollmentsApi.ts
  gradesApi.ts
```

The API client should provide:

- central base URL
- authorization headers/credentials
- JSON parsing
- common error normalization
- 401 handling
- 403 handling
- reusable service functions
- cancellation/stale-request handling where useful
- no repeated raw endpoint strings
- no duplicated request boilerplate

Pages/components should call service/query functions rather than manually recreating API requests.

---

# 22. FRONTEND ENVIRONMENT

For Vite:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Commit:

```text
.env.example
```

Do not commit:

```text
.env
database passwords
backend private keys
JWT signing secrets
service-account secrets
```

The production API URL must not be hardcoded throughout the application.

---

# 23. FRONTEND STATE MANAGEMENT

Separate, where practical:

```text
Server/API state
UI state
Authentication state
Form state
```

Rules:

- avoid storing the same backend record in multiple disconnected stores
- refresh/invalidate stale data after mutations
- preserve filters/search state where useful
- browser storage must never become the authoritative database
- do not use localStorage as the source of truth for academic records

---

# 24. REQUIRED UI/UX

The application should look like a professional information management system.

Required:

- consistent layout
- consistent spacing
- consistent typography
- clear navigation
- readable tables
- predictable actions
- useful forms
- labels
- required indicators where appropriate
- help text where useful
- inline validation
- confirmation for destructive actions
- loading indicators or skeletons
- useful empty states
- non-blocking success/error notifications
- responsive behavior
- keyboard-friendly controls where practical
- semantic labels
- do not rely on color alone for status meaning

---

# 25. STUDENT TABLE REQUIREMENTS

Student management is a major demonstration feature.

Recommended columns:

```text
Student Number
Name
Email
Program
Year Level
Status
Actions
```

Required controls:

```text
Search
Program filter
Year level filter
Status filter
Sort
Pagination
```

Required actions:

```text
View
Create
Edit
Delete/Deactivate
```

Required states:

```text
Loading
Empty
Success
Validation Error
Conflict
Not Found
Forbidden
Network Error
```

---

# 26. FRONTEND VALIDATION

Client-side validation is for usability.

Backend validation is authoritative.

## Client can handle

```text
required fields
basic formats
obviously incomplete forms
basic input constraints
```

## Backend must handle

```text
uniqueness
authorization
database relationships
business rules
authoritative validation
```

React must map backend 422 messages to the correct form fields.

---

# 27. ERROR HANDLING MATRIX

Frontend must interpret:

```text
200 -> update UI
201 -> show creation success
204 -> complete action without expecting body
400 -> meaningful request error
401 -> re-authenticate or execute documented refresh
403 -> access denied
404 -> not found
409 -> conflict explanation
422 -> map validation errors
500+ -> safe general error + retry where appropriate
Network -> server unreachable/offline feedback
```

Never leave users stuck behind an infinite loader.

---

# 28. RECOMMENDED PROJECT STRUCTURE

## Entire repository

```text
student-information-system/
|
+-- backend/
|   +-- app/
|   +-- routes/
|   +-- database/
|   |   +-- migrations/
|   |   +-- seeders/
|   |   +-- factories/
|   +-- tests/
|   +-- .env.example
|   +-- README.md
|
+-- frontend/
|   +-- src/
|   |   +-- app/
|   |   +-- pages/
|   |   +-- components/
|   |   +-- api/
|   |   +-- hooks/
|   |   +-- stores/
|   |   +-- types/
|   |   +-- utils/
|   |   +-- styles/
|   +-- tests/
|   +-- .env.example
|   +-- README.md
|
+-- docs/
|   +-- ERD.png
|   +-- API-Integration-Map.xlsx
|   +-- Architecture.md
|   +-- AI-Development-Log.md
|   +-- screenshots/
|
+-- postman/
|   +-- student-information-api.json
|
+-- README.md
```

---

# 29. BACKEND DEVELOPMENT PHASES

## Phase 1 — Project Setup

Tasks:

1. Create Laravel project.
2. Initialize Git.
3. Configure environment.
4. Configure database.
5. Start Laravel.
6. Verify database connection.

Checkpoint:

- API server starts.
- Database connection succeeds.

---

## Phase 2 — Database Design

Tasks:

1. Create ERD.
2. Create migrations.
3. Create Eloquent models.
4. Define relationships.
5. Add foreign keys.
6. Add unique constraints.
7. Add indexes.
8. Create factories.
9. Create seeders.

Checkpoint:

- Fresh database can be recreated from project files.
- Seed data is available.

---

## Phase 3 — Authentication

Tasks:

1. Configure Laravel authentication suitable for an API.
2. Implement login.
3. Hash passwords.
4. Implement current-user endpoint.
5. Implement logout/token invalidation.
6. Protect private routes.

Checkpoint:

```text
Unauthenticated request -> 401
Authenticated request -> succeeds
```

---

## Phase 4 — Core Resources

Implement:

```text
Programs
Students
Courses
Academic Terms
```

For each resource:

```text
Migration
Model
Factory/Seeder
Request validation
Controller
Resource/response transformer
Routes
Authorization
Tests
Documentation
```

Checkpoint:

- CRUD works with real database data.
- Invalid input is rejected.

---

## Phase 5 — Academic Transactions

Implement:

```text
Course Offerings
Enrollments
Grades
Academic Record
```

Business flow:

```text
Program
  ->
Student
  ->
Course
  ->
Academic Term
  ->
Course Offering
  ->
Enrollment
  ->
Grade
  ->
Academic Record
```

Checkpoint:

- Relationships work.
- Duplicate enrollments are prevented.
- Grades are linked to enrollments.
- Academic record can be retrieved.

---

## Phase 6 — Advanced API Features

Implement:

```text
Search
Filtering
Sorting
Pagination
Consistent Errors
```

Checkpoint:

- Collections support required query parameters.
- No unbounded collection results.

---

## Phase 7 — Authorization

Implement Laravel:

- policies
- gates
- middleware
- permission rules
- object-level checks

Checkpoint:

- unauthorized roles receive 403 or equivalent
- students cannot access another student's protected record

---

## Phase 8 — Documentation

Complete:

```text
README.md
OpenAPI/Swagger
ERD
Postman collection
Architecture note
AI development notes
```

Checkpoint:

- another developer can understand and run the backend

---

## Phase 9 — Testing

Run:

- positive tests
- negative tests
- validation tests
- authentication tests
- authorization tests
- enrollment tests
- grade tests
- search/filter/sort/pagination tests

Minimum automated coverage should include:

```text
authentication
student creation
validation
authorization
enrollment
grade submission/update
```

---

## Phase 10 — Backend Demonstration

Demonstrate:

1. Start API.
2. Connect database.
3. Login.
4. Show protected endpoint rejecting unauthenticated access.
5. Create program.
6. Create valid student.
7. Show invalid/duplicate student validation.
8. Retrieve/update student.
9. Search/filter student.
10. Show sorting/pagination.
11. Create course.
12. Create academic term.
13. Create course offering.
14. Enroll student.
15. Prevent duplicate enrollment.
16. Enter/update grade.
17. Retrieve academic record.
18. Show forbidden request.
19. Show 404.
20. Show API documentation.
21. Run tests.
22. Explain one AI contribution.

---

# 30. FRONTEND DEVELOPMENT PHASES

## Phase 1 — Review the Existing Laravel API

Before building React pages, inspect:

```text
API base URL
Swagger/OpenAPI
Postman collection
Authentication mechanism
Routes
HTTP methods
Request bodies
Responses
Validation structure
Roles
Permissions
Pagination metadata
Search parameters
```

Do not guess the API contract.

---

## Phase 2 — React Setup

Tasks:

1. Create React + TypeScript project.
2. Configure Vite.
3. Configure environment variables.
4. Install React Router.
5. Create base layout.
6. Configure UI system.
7. Create global styles/theme.
8. Configure linting/formatting.
9. Configure tests.

Checkpoint:

- React app starts.
- Login page loads.

---

## Phase 3 — API Client and Authentication

Implement:

```text
API client
Login
Logout
Current user
Auth state
Protected routes
Role-aware routing
401 handling
403 handling
```

Checkpoint:

```text
Login -> current user -> dashboard
```

---

## Phase 4 — Reference Data

Implement:

```text
Programs
Courses
Academic Terms
```

Each should support authorized list and CRUD actions.

---

## Phase 5 — Student Management

Implement:

```text
Student list
Search
Filters
Sorting
Pagination
Details
Create
Edit
Delete/deactivate
Validation
```

This must use the real Laravel API.

---

## Phase 6 — Academic Transactions

Implement:

```text
Course Offerings
Enrollments
Grades
```

Verify:

- duplicate enrollment error is visible
- unauthorized grade action is blocked by Laravel
- forms reflect actual backend validation

---

## Phase 7 — Academic Record and Role Views

Implement:

```text
Academic Record
Role-aware dashboards
Role-aware navigation
Role-aware action visibility
Profile
```

---

## Phase 8 — UX Hardening

Review every screen for:

```text
Loading
Empty
Success
Validation
401
403
404
409
422
500
Network Error
Confirmation
Responsive layout
Accessibility
```

---

## Phase 9 — Frontend Testing

Minimum automated tests:

1. authentication-flow test
2. API-integrated list/component test
3. form validation/error test
4. protected-route or authorization test
5. one critical E2E flow when supported

Also perform manual negative tests against the actual Laravel backend.

---

## Phase 10 — Documentation and Defense

Complete:

```text
README.md
API Integration Map
AI Development Log
Architecture Note
Screenshots
Test Evidence
Git History
Production Build
```

---

# 31. FRONTEND TEST MATRIX

## Authentication

```text
valid login
invalid credentials
logout
protected route without authentication
expired/invalid session
```

## Students

```text
load list
search
filter
paginate
create
edit
duplicate/validation failure
delete/deactivate
```

## Authorization

```text
restricted role attempts forbidden action
backend returns 403
```

## Enrollments

```text
successful enrollment
duplicate enrollment
invalid reference
status change
```

## Grades

```text
authorized update
validation failure
unauthorized update
```

## Networking

```text
backend unavailable
slow request
loading state
500 response
```

## Routing

```text
protected navigation
nested route refresh
404 route
```

## Responsive UI

```text
desktop
tablet
narrow/mobile
```

---

# 32. FRONTEND API INTEGRATION MAP

Maintain a document with:

| Page/Feature | Endpoint | Method | Role/Permission |
|---|---|---|---|
| Login | `/auth/login` | POST | Public |
| Current User | `/auth/me` | GET | Authenticated |
| Logout | `/auth/logout` | POST | Authenticated |
| Students List | `/students` | GET | Admin/Staff/other permitted |
| Create Student | `/students` | POST | Admin/Staff |
| Update Student | `/students/{id}` | PATCH | Authorized |
| Programs | `/programs` | GET/POST/etc. | Authorized |
| Courses | `/courses` | GET/POST/etc. | Authorized |
| Terms | `/academic-terms` | GET/POST/etc. | Authorized |
| Offerings | `/course-offerings` | GET/POST/etc. | Authorized |
| Enrollments | `/enrollments` | GET/POST/etc. | Authorized |
| Grades | `/grades` | GET/POST/PATCH/etc. | Authorized |
| Academic Record | `/students/{id}/academic-record` | GET | Authorized |

Update the roles/permissions column to match the actual Laravel authorization implementation.

---

# 33. DOCUMENTATION REQUIREMENTS

## Backend README

Must explain:

- project purpose
- technology stack
- prerequisites
- installation
- environment configuration
- database setup
- migration
- seeding
- server startup
- authentication
- API docs
- tests
- test accounts without real credentials
- AI usage and verification

## Frontend README

Must explain:

- project purpose
- framework
- prerequisites
- installation
- environment configuration
- API connection
- development server
- build
- tests
- role behavior
- architecture
- AI usage

---

# 34. REQUIRED PROJECT OUTPUTS

## Backend

```text
Complete Laravel source
Migrations
Seeders/factories
.env.example
ERD
OpenAPI/Swagger
Postman collection
Automated test suite/evidence
README.md
Git repository
Architecture/security documentation
AI development documentation
```

## Frontend

```text
Complete React source
Real Laravel API integration
.env.example
README.md
API Integration Map
AI Development Log
Tests/evidence
Screenshots
Git repository
Production build/distributable output when applicable
```

---

# 35. FINAL END-TO-END BUSINESS FLOW

The finished system should demonstrate this flow:

```text
ADMINISTRATOR
    |
    +-- Login
    +-- Create Program
    +-- Create Course
    +-- Create Academic Term
    +-- Configure authorized users/instructors
              |
              v
REGISTRAR / STAFF
    |
    +-- Create Student
    +-- Assign Program
    +-- Create Course Offering
              |
              v
STUDENT
    |
    +-- Enrollment
              |
              v
INSTRUCTOR
    |
    +-- View assigned offering
    +-- View enrolled students
    +-- Enter/update grades
              |
              v
STUDENT
    |
    +-- View enrollment
    +-- View grades
    +-- View academic record
```

---

# 36. FINAL DEMONSTRATION FLOW

Use the actual React frontend + actual Laravel backend + actual database.

Recommended defense sequence:

```text
1. Show architecture
2. Start Laravel API
3. Confirm database
4. Open Swagger/Postman
5. Start React
6. Show configured API base URL
7. Invalid login
8. Successful login
9. Show current authenticated role
10. Open protected route
11. Load Students
12. Search
13. Apply at least two filters
14. Show pagination
15. Create student
16. Trigger backend validation
17. Edit student
18. Delete/deactivate student
19. Open Programs/Courses
20. Open Academic Terms
21. Create/manage Course Offering
22. Enroll student
23. Trigger duplicate enrollment conflict
24. Enter/update grade
25. Open Academic Record
26. Demonstrate restricted role
27. Show 403
28. Stop backend
29. Show controlled network-error state
30. Show responsive design
31. Run frontend/backend tests
32. Explain architecture
33. Explain authentication
34. Explain API client
35. Explain one AI-assisted contribution
36. Modify/debug one feature if requested
```

---

# 37. CRITICAL DEFICIENCIES TO AVOID

Major deductions should be expected if any of these occur:

```text
No working Laravel API
No real database
No authentication
Plaintext passwords
No server-side authorization
No object-level authorization
Static/hardcoded core data
React directly accesses database
React contains replacement backend
Authentication is simulated only in UI
No API demonstration
No validation
Critical errors are unhandled
Secrets are embedded in frontend
Student cannot explain AI-generated code
```

---

# 38. AI-ASSISTED DEVELOPMENT POLICY

AI is allowed and encouraged.

Use AI for:

- requirements decomposition
- architecture planning
- Laravel scaffolding
- migrations
- model relationships
- validation
- API controllers
- authorization
- tests
- Swagger/OpenAPI
- React components
- forms
- API clients
- debugging
- accessibility
- documentation
- refactoring

But the developer remains responsible for:

- correctness
- security
- architecture
- testing
- maintainability
- explanation
- modifications

Never submit code that cannot be explained.

Do not give AI real passwords, private keys, tokens, or confidential credentials.

Run tests after meaningful AI-generated changes.

Prefer small prompts and reviewable commits.

---

# 39. AI WORKFLOW

For every feature:

```text
UNDERSTAND
   ->
PLAN
   ->
PROMPT
   ->
GENERATE
   ->
REVIEW
   ->
INTEGRATE
   ->
TEST
   ->
DEBUG
   ->
IMPROVE
   ->
DOCUMENT
```

---

# 40. AI DEVELOPMENT LOG

Maintain:

```text
docs/AI-Development-Log.md
```

Each major entry should contain:

```text
Task
AI Tool
Prompt Summary
Result
Human Review
Evidence
```

Do not document private chain-of-thought.

Document engineering decisions and verification instead.

---

# 41. GIT WORKFLOW

Use meaningful commits.

Examples:

```text
feat: initialize Laravel REST API
feat: create student database schema
feat: add student relationships
feat: implement authentication
feat: add student CRUD endpoints
feat: add role authorization
test: add student validation tests
docs: add OpenAPI documentation

feat: initialize React frontend
feat: create API client
feat: implement login flow
feat: add protected routes
feat: add student management UI
feat: add pagination and filters
fix: map backend validation errors
test: add protected route test
docs: add API integration map
```

Avoid meaningless commit messages such as:

```text
update
fix
final
latest
final2
```

---

# 42. DEFINITION OF DONE

## Backend is DONE when:

```text
[ ] Laravel API starts
[ ] Database connects
[ ] Migrations run
[ ] Seeders work
[ ] Required data exists
[ ] Authentication works
[ ] Protected routes work
[ ] Roles work
[ ] Object-level authorization works
[ ] Students CRUD works
[ ] Programs CRUD works
[ ] Courses CRUD works
[ ] Academic Terms CRUD works
[ ] Course Offerings work
[ ] Enrollments work
[ ] Duplicate enrollment is prevented
[ ] Grades work
[ ] Academic Record works
[ ] Search works
[ ] Filtering works
[ ] Sorting works
[ ] Pagination works
[ ] Validation works
[ ] Status codes are correct
[ ] Error responses are safe
[ ] Swagger/OpenAPI works
[ ] Postman collection works
[ ] Tests pass
[ ] README complete
[ ] ERD complete
[ ] AI log complete
```

## Frontend is DONE when:

```text
[ ] React starts
[ ] API base URL is configurable
[ ] Actual Laravel API is used
[ ] Login works
[ ] Logout works
[ ] Current user works
[ ] Protected routes work
[ ] 401 handled
[ ] 403 handled
[ ] Role-aware navigation works
[ ] Dashboard works
[ ] Students works
[ ] Programs works
[ ] Courses works
[ ] Academic Terms works
[ ] Course Offerings works
[ ] Enrollments works
[ ] Grades works
[ ] Academic Record works
[ ] Search works
[ ] Filters work
[ ] Pagination works
[ ] Backend validation displayed
[ ] Loading states work
[ ] Empty states work
[ ] Network errors work
[ ] 404 works
[ ] 409 works
[ ] 422 works
[ ] Responsive UI works
[ ] Accessibility basics implemented
[ ] Tests exist
[ ] API Integration Map complete
[ ] AI Development Log complete
[ ] README complete
[ ] Screenshots complete
[ ] Production build works
```

---

# 43. OPTIONAL ENHANCEMENTS

Only implement these after all core requirements are complete:

```text
Refresh tokens / session rotation
Email verification
Password reset
Rate limiting
Soft delete/recovery
Audit trail
Docker
CI/CD
Redis caching
CSV import/export
PDF academic record generation
Health/readiness endpoints
Role and permission administration
Integration tests
Performance tests
Accessibility automation
Optimistic updates with rollback
Advanced query caching/invalidation
Offline read-only support
Charts/analytics
Dark mode
Internationalization
Generated OpenAPI client
Performance profiling
Bundle optimization
```

Bonus features must never replace incomplete required features.

---

# 44. MASTER AI CODING AGENT PROMPT

Copy the prompt below into the coding agent.

---

You are the primary software-engineering agent for this project.

Your task is to build a **Student Information Management System** consisting of:

1. a **Laravel REST API backend**
2. a **React + TypeScript frontend web application**

This project is governed exclusively by the requirements in the attached/source specification file you were given.

## SOURCE-OF-TRUTH RULE

Treat the project specification file as the **primary source of truth**.

Do not silently replace, remove, weaken, or invent requirements.

When requirements are ambiguous:

1. preserve the required terminology and modules;
2. prefer the simplest implementation that satisfies the stated requirement;
3. follow Laravel/React conventions;
4. keep backend authorization authoritative;
5. do not bypass the REST API;
6. do not add unnecessary architecture or dependencies.

Do not replace the Student Information Management System with another domain.

---

## FIXED TECHNOLOGY CHOICE

### Backend

Use:

- Laravel
- PHP version supported by the current project/environment
- Eloquent ORM
- relational database
- PostgreSQL recommended
- Laravel API authentication suitable for a REST client
- Form Request validation
- Policies/Gates/middleware for authorization
- OpenAPI/Swagger documentation
- Pest/PHPUnit tests

### Frontend

Use:

- React
- TypeScript
- Vite
- React Router
- Axios or a clean fetch abstraction
- React Hook Form or equivalent
- Zod or equivalent validation if justified
- TanStack Query or an appropriately justified state/query strategy
- Tailwind CSS or another consistent professional UI system

Do not introduce a second backend.

---

## SYSTEM ARCHITECTURE

Implement this architecture:

```text
React Frontend
      |
      | HTTP/JSON
      v
Laravel REST API
      |
      v
Relational Database
```

The React application must never connect directly to PostgreSQL, MySQL, SQLite, or another database.

Laravel is the authoritative source for:

- authentication
- authorization
- validation
- business rules
- database access
- academic data

The React application is responsible for:

- presentation
- navigation
- forms
- UI state
- API consumption
- user feedback
- responsive design
- role-aware UX

Do not use local mock data as the authoritative source for required functionality.

---

## REQUIRED ROLES

Implement:

- Administrator
- Registrar / Staff
- Instructor
- Student

Backend authorization must enforce actual permissions.

Frontend navigation may adapt to roles, but frontend checks are not the security boundary.

Implement object-level authorization.

A Student must not be able to access another student's protected academic record simply by changing a URL ID.

---

## REQUIRED MODULES

Implement all:

- Authentication
- Users and Roles
- Students
- Programs
- Courses
- Academic Terms
- Course Offerings
- Enrollments
- Grades
- Academic Record
- Profile / Account
- Dashboard

Do not mark the project complete while required modules are missing.

---

## REQUIRED DATABASE ENTITIES

Implement:

```text
users
students
programs
courses
academic_terms
course_offerings
enrollments
grades
```

Respect the minimum field requirements in the source specification.

Implement proper:

- primary keys
- foreign keys
- relationships
- unique constraints
- indexes
- timestamps
- migrations
- seeders/factories

At minimum:

```text
student_number UNIQUE
course_code UNIQUE
UNIQUE(student_id, course_offering_id)
```

where appropriate and consistent with the final schema.

---

## REQUIRED REST API VERSION

Use:

```text
/api/v1
```

Use resource-oriented URLs and correct HTTP methods.

Required endpoints include:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/students
POST   /api/v1/students
GET    /api/v1/students/{id}
PUT    /api/v1/students/{id}
PATCH  /api/v1/students/{id}
DELETE /api/v1/students/{id}

GET/POST              /api/v1/programs
GET/PUT/PATCH/DELETE  /api/v1/programs/{id}

GET/POST              /api/v1/courses
GET/PUT/PATCH/DELETE  /api/v1/courses/{id}

GET/POST              /api/v1/academic-terms
GET/PUT/PATCH/DELETE  /api/v1/academic-terms/{id}

GET/POST              /api/v1/course-offerings
GET/PUT/PATCH/DELETE  /api/v1/course-offerings/{id}

GET/POST              /api/v1/enrollments
GET/PATCH/DELETE      /api/v1/enrollments/{id}
GET                    /api/v1/students/{id}/enrollments
GET                    /api/v1/course-offerings/{id}/students

GET/POST              /api/v1/grades
GET/PUT/PATCH         /api/v1/grades/{id}
GET                    /api/v1/students/{id}/grades

GET                    /api/v1/students/{id}/academic-record
```

Do not create RPC-style endpoints when normal REST resources are sufficient.

---

## REQUIRED QUERY FEATURES

Students collection must support:

- search
- at least two filters
- sorting
- pagination

Example:

```text
GET /api/v1/students?search=dela&program_id=1&year_level=3&page=2&per_page=20
```

Return sufficient pagination metadata for the React application.

Do not return unbounded datasets.

---

## REQUIRED STATUS CODES

Use:

```text
200
201
204
400
401
403
404
409
422
500
```

Use them consistently and document them.

---

## REQUIRED VALIDATION

At minimum:

```text
student_number -> required + unique
first_name      -> required
last_name       -> required
email           -> valid email when supplied
program_id      -> existing program
course_id       -> existing course
academic_term_id -> existing term
instructor_id   -> valid instructor/user
student_id      -> existing student
course_offering_id -> existing offering
year_level      -> valid documented values
status          -> valid documented values
grades          -> valid grading rules
```

Backend validation is authoritative.

React may validate for usability but must correctly render server validation errors.

---

## REQUIRED API RESPONSE BEHAVIOR

Use a predictable response structure such as:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Validation:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field": [
      "Validation message"
    ]
  }
}
```

Keep response handling consistent throughout the API.

Do not leak:

- passwords
- password hashes
- tokens
- private secrets
- raw stack traces
- unnecessary internal exception details

---

## BACKEND SECURITY

Use:

- secure password hashing
- protected routes
- server-side authorization
- object-level authorization
- environment variables for secrets
- Eloquent/query builder or parameterized queries
- deliberate CORS configuration
- safe production error responses

Never put real secrets in source code.

Do not commit `.env`.

---

## REQUIRED SEED DATA

Seed at least:

```text
5 users
3 programs
100 students
20 courses
2 academic terms
20 course offerings
200 enrollments
100 grades
```

Use factories/seeders rather than manual entry.

---

## REQUIRED REACT APPLICATION

Create these pages/features:

```text
Login
Dashboard
Students
Student Create
Student Details
Student Edit
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Grades
Academic Record
Profile
403
404
```

Adapt page names when necessary, but do not remove required functionality.

---

## REACT AUTHENTICATION

Implement:

- login
- logout
- current-user state
- protected routes
- role-aware navigation
- automatic 401 handling
- explicit 403 handling
- session/token expiry handling

The React application must use the actual Laravel authentication mechanism.

Do not simulate login with a fake boolean.

---

## CENTRALIZED API CLIENT

Create a reusable API layer.

Expected structure:

```text
src/api/
  client.ts
  authApi.ts
  studentsApi.ts
  programsApi.ts
  coursesApi.ts
  termsApi.ts
  offeringsApi.ts
  enrollmentsApi.ts
  gradesApi.ts
```

Centralize:

- API base URL
- authorization
- common headers
- JSON parsing
- error normalization
- 401 handling
- reusable resource requests

Do not duplicate raw API request code throughout components.

---

## REACT STATE/DATA RULES

Separate:

- server/API state
- authentication state
- form state
- temporary UI state

After successful create/update/delete:

- invalidate/refetch stale data
- update UI correctly
- preserve useful filters/search state

Do not use browser storage as an academic database.

---

## REQUIRED UI STATES

Every important API-driven page must deliberately handle:

```text
loading
empty
success
validation error
unauthorized (401)
forbidden (403)
not found (404)
conflict (409)
validation (422)
server error (500)
network/unreachable
```

Do not leave infinite loaders.

---

## STUDENT MANAGEMENT IS A PRIORITY FEATURE

Make the Students module the strongest demonstration of API integration.

Implement:

- list
- search
- at least two filters
- sorting
- pagination
- details
- create
- edit
- delete/deactivate
- API validation feedback
- loading state
- empty state
- error state

The controls must send actual backend query parameters.

---

## RESPONSIVE UI

The React interface must work on:

- desktop
- laptop
- tablet
- narrow/mobile widths

Use consistent:

- navigation
- typography
- spacing
- buttons
- tables
- dialogs
- forms
- notifications

Do not ship a default unstyled framework interface.

---

## DOCUMENTATION

Create:

```text
README.md
docs/ERD.png
docs/Architecture.md
docs/API-Integration-Map.xlsx or equivalent
docs/AI-Development-Log.md
postman/student-information-api.json
```

Also provide:

- OpenAPI/Swagger
- setup instructions
- environment instructions
- migration instructions
- seed instructions
- test commands
- frontend startup instructions
- backend startup instructions

---

## TESTING

Backend automated tests must cover at least:

- authentication
- student creation
- validation
- authorization
- enrollment
- grade submission/update

Frontend automated tests must cover at least:

- authentication flow
- API-integrated list/component
- form validation/error
- protected route/authorization
- critical E2E flow when supported

Also perform manual negative tests against the real Laravel backend.

---

## AI USAGE

Use AI incrementally.

Correct workflow:

```text
UNDERSTAND
PLAN
PROMPT
GENERATE
REVIEW
INTEGRATE
TEST
DEBUG
IMPROVE
DOCUMENT
```

For every meaningful AI-generated feature:

1. inspect the generated code
2. compare with actual backend requirements
3. test it
4. fix hallucinated code
5. remove unnecessary dependencies
6. record the contribution in the AI Development Log

Never generate the entire project in one uncontrolled step.

Prefer bounded feature-by-feature work.

Never assume an AI answer is correct without testing.

Never expose real secrets to AI.

---

# 45. AGENT DEVELOPMENT STRATEGY

Work in this order.

## STEP 1 — Inspect project

Determine:

- whether backend already exists
- whether frontend already exists
- current Laravel version/project structure
- current React/Vite setup if present
- current database configuration
- existing authentication implementation
- existing routes/models/migrations
- existing tests

Do not destroy existing working code unnecessarily.

## STEP 2 — Compare existing project against this specification

Create a gap analysis:

```text
Requirement
Current state
Missing
Required action
Priority
```

## STEP 3 — Build backend first

Complete:

```text
Database
Models
Relationships
Seeders
Authentication
Core CRUD
Academic transactions
Search/filter/sort/pagination
Authorization
Validation
Documentation
Tests
```

## STEP 4 — Verify backend independently

Use:

```text
Swagger
Postman
Automated tests
```

The backend must be demonstrably usable before frontend integration is considered complete.

## STEP 5 — Build React frontend

Complete:

```text
API client
Authentication
Protected routes
Role navigation
Dashboard
Reference data
Students
Offerings
Enrollments
Grades
Academic record
UX hardening
Testing
```

## STEP 6 — Perform real integration testing

Test React against the actual Laravel API and actual database.

No mock data for core features.

## STEP 7 — Complete documentation

Update all required documentation based on the actual final implementation.

## STEP 8 — Prepare final demo

Follow the required end-to-end demonstration flow.

---

# 46. AGENT BEHAVIOR RULES

The coding agent must:

1. Make small, reviewable changes.
2. Preserve existing working features.
3. Follow this specification as the primary project requirement.
4. Avoid unnecessary dependencies.
5. Avoid overengineering.
6. Use Laravel and React conventions.
7. Keep backend and frontend responsibilities separate.
8. Test every meaningful backend change.
9. Test every meaningful frontend integration change.
10. Explain important architectural decisions in documentation.
11. Never hardcode secrets.
12. Never bypass backend authorization.
13. Never use direct database access from React.
14. Never replace required API behavior with frontend mock behavior.
15. Never mark a feature complete without verifying the actual request/response behavior.
16. Keep API endpoint definitions centralized.
17. Keep role rules synchronized with backend authorization.
18. Update documentation when contracts change.

---

# 47. CHANGE MANAGEMENT RULE

When modifying an API contract:

1. update Laravel route/controller/request/resource behavior;
2. update OpenAPI;
3. update Postman collection;
4. update React API service/types;
5. update affected pages/components;
6. update tests;
7. update API Integration Map;
8. verify end-to-end behavior.

Do not silently change the API contract only on one side.

---

# 48. FINAL AGENT COMPLETION CHECK

Do not say the project is complete until all applicable items are verified:

```text
Backend
[ ] Laravel server works
[ ] Database works
[ ] Migrations reproducible
[ ] Seed data generated
[ ] Authentication works
[ ] Authorization works
[ ] Object-level authorization works
[ ] CRUD works
[ ] Academic transactions work
[ ] Search/filter/sort/pagination work
[ ] Validation works
[ ] Error handling works
[ ] Swagger/OpenAPI works
[ ] Postman works
[ ] Tests pass

Frontend
[ ] React starts
[ ] API base URL configurable
[ ] Login works
[ ] Logout works
[ ] Current user works
[ ] Protected routes work
[ ] Role-aware UI works
[ ] Dashboard works
[ ] Students works
[ ] Programs works
[ ] Courses works
[ ] Academic Terms works
[ ] Course Offerings works
[ ] Enrollments works
[ ] Grades works
[ ] Academic Record works
[ ] Search/filter/pagination works
[ ] Validation feedback works
[ ] Loading/empty/error states work
[ ] 401/403/404/409/422/500 handled
[ ] Network error handled
[ ] Responsive UI works
[ ] Tests pass

Documentation
[ ] README
[ ] ERD
[ ] OpenAPI/Swagger
[ ] Postman collection
[ ] API Integration Map
[ ] Architecture note
[ ] AI Development Log
[ ] Screenshots/evidence
[ ] Git history
[ ] Production build where applicable
```

---

# 49. FINAL PRINCIPLE

The final system must demonstrate:

```text
                 REAL CLIENT-SERVER APPLICATION
                           |
          +----------------+----------------+
          |                                 |
          v                                 v
   Laravel REST API                    React Web App
   Authentication                     User Interface
   Authorization                      Navigation
   Validation                         Forms
   Business Rules                     Tables
   Database Access                    State
   Academic Data                      API Consumption
          |                                 |
          +---------------+-----------------+
                          |
                          v
                    Integrated SIMS
```

The backend is authoritative.

The frontend is an independent client.

AI accelerates development.

The developer owns the final architecture, code, security, testing, documentation, and understanding.

END OF MASTER PROJECT SPECIFICATION
