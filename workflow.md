Build the Laravel API as the next module of your existing Student Services Portal, rather than replacing the previous TypeScript activity.

Your previous README establishes a development workflow, but it does not yet describe a database-backed API. This activity adds the actual backend: persistent records, authentication, permissions, academic transactions, tests, and documentation.

The plan below follows the laboratory requirements and gives you an implementation order with a clear completion checkpoint for every phase.

Project direction and technology choices

Use the following stack to keep the project manageable.

| Component | Recommended choice | Purpose |
|---|---|---|
| Backend | Laravel 13 | REST API framework |
| PHP | PHP 8.4 | Consistent development and deployment runtime |
| Dependency management | Composer | PHP packages and locked dependencies |
| Database | MySQL with InnoDB | Relational storage and transactions |
| Authentication | Laravel Sanctum | Bearer tokens for external API clients |
| Authorization | Laravel Policies and a role enum | Role-based and record-level permissions |
| Validation | Form Requests | Server-side input validation |
| Responses | Laravel API Resources | Controlled JSON representations |
| Testing | PHPUnit | Automated feature and business-rule tests |
| PHP formatting | Laravel Pint | PHP code style |
| Documentation | OpenAPI specification and Swagger UI | Client-facing API contract |
| API demonstration | Postman collection | Repeatable successful and failed requests |

Laravel 13 requires at least PHP 8.3; PHP 8.4 is a suitable project baseline. Record the actual PHP and database versions used in your README and commit composer.lock. Laravel

Keep the scope backend-only. You do not need Vue, React, Blade screens, a student dashboard, or an administrative interface to complete this laboratory.

How this continues your previous activity

Keep the existing TypeScript files and tooling intact. Put Laravel in a separate backend/ directory.

``text
act-1/
├── README.md
├── package.json
├── src/                         # Previous TypeScript activity
├── ...existing configuration...
├── backend/                     # New Laravel application
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── composer.json
│   └── composer.lock
└── docs/
    ├── previous-activity.md
    ├── requirements.md
    ├── architecture.md
    ├── business-rules.md
    ├── authorization-matrix.md
    ├── erd.md
    ├── openapi.yaml
    ├── ai-usage.md
    ├── demo-checklist.md
    └── postman/
`

Do not create another Git repository inside backend/. Use the existing repository and preserve its history.

Your existing npm run lint and npm run format remain for TypeScript. Laravel will use separate PHP commands.

Phase 0: Freeze the requirements and business rules

Before generating controllers, define exactly what the API must do. Several requirements depend on decisions that the laboratory leaves to the implementation.

Required modules

Track these ten modules in docs/requirements.md:

Authentication.
Users and roles.
Students.
Programs.
Courses.
Academic terms.
Course offerings.
Enrollments.
Grades.
Academic records.

For every requirement, record its implementation location and its verification:

| Requirement | Implementation | Verification |
|---|---|---|
| Unique student number | Validation and database unique constraint | Duplicate creation test |
| Student privacy | Policy and scoped queries | Another student's record is denied |
| Duplicate enrollment prevention | Composite unique constraint and service | Repeated enrollment returns conflict |
| Complete documentation | OpenAPI and Postman | Documented requests execute successfully |

Recommended business rules

These are proposed project decisions, not additional rules imposed by the PDF. Record them so code, tests, and documentation agree.

| Area | Proposed decision |
|---|---|
| Roles | ADMIN, REGISTRAR, INSTRUCTOR, STUDENT |
| User status | ACTIVE, INACTIVE |
| Student status | ACTIVE, INACTIVE, GRADUATED |
| Year level | Integer from 1 to 6 |
| Catalog status | Programs and courses use ACTIVE, INACTIVE |
| Term status | PLANNED, OPEN, CLOSED |
| Offering status | OPEN, CLOSED, CANCELLED |
| Enrollment status | ENROLLED, DROPPED, COMPLETED |
| Grade scale | Example: 0–100, with passing at 75 |
| Grade status | DRAFT, PUBLISHED |
| Student-visible grades | Published grades only |
| Capacity | Positive integer; occupied seats count non-dropped enrollments |
| Enrollment deletion | Change status to DROPPED; preserve the record |
| Catalog deletion | Deactivate the resource; preserve academic history |

Confirm the grading scale with your instructor before implementing it. Do not assume a 0–100 scale is the institution's official scale.

Also document these rules:

• Only active instructor accounts can be assigned to offerings.
• Students must be active to receive a new enrollment.
• New enrollments require an open term and an open offering.
• A student cannot have two enrollment rows for the same offering.
• Restoring a dropped enrollment updates the existing row and rechecks capacity.
• An offering's capacity cannot be reduced below its occupied seats.
• An enrollment with a published grade cannot be dropped without an explicitly defined correction process.
• Grades belong to enrollments, not directly to students or courses.

Checkpoint: You can explain the entire enrollment-to-grade workflow without referring to code.

Phase 1: Initialize Laravel inside the existing repository

Run these commands from the root of your existing project:

`bash
git switch -c feature/laravel-api-setup

php -v
composer --version

composer create-project laravel/laravel backend "^13.0"

cd backend
php artisan install:api
`

Laravel's install:api command installs Sanctum and creates routes/api.php. Routes in that file already receive an /api prefix, so add only a v1 group to produce /api/v1/.... Laravel

Configure the local database

Create a dedicated development database and database user. Then configure backend/.env:

`dotenv
APPNAME="Student Services Portal API"
APPENV=local
APPDEBUG=true
APPURL=http://127.0.0.1:8000

DBCONNECTION=mysql
DBHOST=127.0.0.1
DBPORT=3306
DBDATABASE=studentservicesapi
DBUSERNAME=studentapiuser
DBPASSWORD=replacewithyourlocalpassword
`

Keep actual credentials out of Git. Use safe placeholders in .env.example.

Then run:

`bash
php artisan key:generate
php artisan migrate
php artisan migrate:status
php artisan route:list --path=api
php artisan serve
`

These are development commands. php artisan serve is not the production deployment server.

Repository hygiene

Verify that Git excludes:

• Actual .env files and private credentials.
• vendor/ and nodemodules/.
• Application logs and local database dumps.
• Postman environment files containing live tokens.

Commit dependency lockfiles. Do not replace an existing application's APPKEY during routine deployment.

Checkpoint: Laravel starts, migrations run against MySQL, and API routes are registered.

Phase 2: Design the schema, relationships, and seeders

Build migrations before building CRUD endpoints.

Essential schema decisions

The PDF's student fields do not explicitly connect a student record to a login account. Add students.userid so ownership authorization is possible.

| Table | Important fields and constraints |
|---|---|
| users | Name, unique email, hashed password, role, status |
| students | Unique student number, unique nullable userid, names, contact information, program, year level, status |
| programs | Unique code, name, description, status |
| courses | Unique course code, title, decimal units, description, status |
| academicterms | Academic year, semester, dates, status; unique year/semester pair |
| courseofferings | Course, term, instructor user, section, schedule, room, capacity, status |
| enrollments | Student, offering, enrollment date, status; unique student/offering pair |
| grades | Unique enrollment reference, nullable midterm/final grades, remarks, publication status |

Use Laravel's conventional users.password field to store a hash, rather than introducing passwordhash unnecessarily.

A nullable students.userid allows the registrar to create a student before issuing an account. Whenever a student account is linked, enforce that the account has the STUDENT role.

Relationship diagram

`mermaid
erDiagram
    USERS o|--o| STUDENTS : "has student profile"
    PROGRAMS ||--o{ STUDENTS : contains
    USERS ||--o{ COURSEOFFERINGS : teaches
    COURSES ||--o{ COURSEOFFERINGS : offeredas
    ACADEMICTERMS ||--o{ COURSEOFFERINGS : contains
    STUDENTS ||--o{ ENROLLMENTS : receives
    COURSEOFFERINGS ||--o{ ENROLLMENTS : contains
    ENROLLMENTS ||--o| GRADES : receives
`

Role restrictions such as “the instructor must be an instructor account” require application validation; a foreign key alone does not enforce them.

Integrity rules to implement
• Add foreign keys for every relationship.
• Add the unique enrollment pair at the database level, not just in request validation.
• Make grades.enrollmentid unique.
• Use a unique offering identity such as course, term, and section.
• Use decimal columns for units and grades.
• Validate that a term's end date follows its start date.
• Prefer restricted deletion over cascading away academic records.
• Index frequently filtered fields such as program, student status, academic term, and instructor.

Seed data

Meet or exceed the laboratory's exact minimums:

| Entity | Minimum records |
|---|---:|
| Users | 5 |
| Programs | 3 |
| Students | 100 |
| Courses | 20 |
| Academic terms | 2 |
| Course offerings | 20 |
| Enrollments | 200 |
| Grades | 100 |

For useful access-control demonstrations, seed at least six users: one administrator, one registrar, two instructors, and two students linked to different student profiles.

Generate related data in dependency order:

`text
Users and programs
    → Students and courses and terms
    → Offerings
    → Enrollments
    → Grades
`

Use deterministic fixtures for important test scenarios, including a full offering, two different instructors' offerings, and published versus draft grades. Avoid random seed logic that sometimes violates capacity.

`bash
php artisan migrate:fresh --seed
`

Warning: This command deletes all tables in the configured database. Use it only against a disposable development or test database.

Checkpoint: A fresh database rebuild succeeds and a count check confirms all minimum demonstration records.

Phase 3: Establish the application structure and API contract

Set the conventions once, then reuse them across modules.

Laravel structure

`text
backend/app/
├── Enums/
├── Models/
├── Policies/
├── Services/
│   ├── EnrollmentService.php
│   ├── GradeService.php
│   └── AcademicRecordService.php
└── Http/
    ├── Controllers/Api/V1/
    ├── Middleware/
    ├── Requests/
    └── Resources/
`

Use a small, conventional architecture:

• Controllers coordinate requests and responses.
• Form Requests validate input.
• Policies authorize actions on actual records.
• Services implement multi-record business transactions.
• Models define relationships and query behavior.
• API Resources control the information returned.

A repository layer is unnecessary unless it solves a specific problem.

Response convention

Use Laravel-style resource responses instead of maintaining two competing response systems.

Single resource:

`json
{
  "data": {
    "id": 1,
    "studentnumber": "2026-00001",
    "firstname": "Sample",
    "lastname": "Student"
  }
}
`

Validation failure:

`json
{
  "message": "Validation failed.",
  "errors": {
    "studentnumber": [
      "The student number has already been taken."
    ]
  }
}
`

Paginated collections should use data, links, and meta. Document the actual fields your implementation returns.

Status-code policy

| Status | Usage |
|---|---|
| 200 | Successful retrieval or update |
| 201 | Created resource |
| 204 | Successful operation with no response body |
| 400 | Malformed JSON or equivalent malformed request |
| 401 | Missing, invalid, expired, or revoked authentication |
| 403 | Authenticated but forbidden |
| 404 | Resource not found |
| 409 | Business conflict, such as a full offering or duplicate enrollment |
| 422 | Field validation failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error with a safe public message |

Configure API exception handling so /api/* failures return JSON, not HTML pages or redirects. Never return a body with 204.

Checkpoint: Validation, unauthorized, forbidden, not-found, and unexpected-error responses follow documented conventions.

Phase 4: Implement authentication and authorization together

Do not build all endpoints first and leave security until the end.

Authentication endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/auth/login | Validate credentials and issue a token |
| POST | /api/v1/auth/logout | Revoke the current token |
| GET | /api/v1/auth/me | Return the authenticated user's safe profile |

Use Sanctum's HasApiTokens trait, protect routes with auth:sanctum, and send tokens through Authorization: Bearer .... Sanctum supports token revocation by deleting the relevant token record. Laravel

Implement:

• Framework password hashing and verification.
• Generic invalid-credential messages.
• Active-account checks at login and on protected requests.
• An explicit token lifetime.
• Current-token revocation on logout.
• Revocation of existing tokens when an account is disabled.
• Login throttling.
• Safe user responses without password hashes or token records.

For a future first-party browser SPA, use Sanctum's cookie-based SPA authentication rather than treating browser local storage as the default place for bearer tokens. This plan's bearer-token flow targets external clients and the API demonstration. Laravel

Proposed permission matrix

| Role | Allowed scope | Important restriction |
|---|---|---|
| Administrator | All managed resources and user accounts | Still subject to data-integrity rules |
| Registrar | Students, catalogs, terms, offerings, enrollments, academic records, grades | Cannot grant administrative roles |
| Instructor | Assigned offerings, roster information, grades for assigned enrollments | No unrelated offerings or student records |
| Student | Own profile, enrollments, published grades, academic record | No management operations or other students' records |

Implement both record policies and scoped collection queries.

For example:

• GET /grades must not expose everyone's grades to students.
• GET /course-offerings must restrict instructors to assigned offerings.
• GET /students/{id}/academic-record must verify ownership or staff permission.
• POST /grades must authorize access to the enrollment supplied in the body.
• Pagination totals must count only records the caller is authorized to see.

An instructor may need student names and student numbers for a roster, but should not automatically receive birth dates, addresses, and unrelated academic history.

User account management

Add administrator-only account operations, such as:

`text
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
DELETE /api/v1/users/{id}
`

Treat account deletion as deactivation. Reject client attempts to assign roles through unrelated student or profile endpoints.

Checkpoint: Two different student accounts cannot retrieve each other's records, and two instructors cannot edit each other's grades.

Phase 5: Build core resource CRUD

Implement these resources in dependency order:

Programs.
Courses.
Academic terms.
Students.

For each module, complete the entire vertical slice before moving on:

`text
Model and relationships
    → Form Requests
    → Policy
    → Controller
    → API Resource
    → Routes
    → Feature tests
    → OpenAPI entry
    → Postman requests
`

Endpoint pattern

Each core resource needs:

`text
GET    /api/v1/{resource}
POST   /api/v1/{resource}
GET    /api/v1/{resource}/{id}
PATCH  /api/v1/{resource}/{id}
DELETE /api/v1/{resource}/{id}
`

Use PATCH for partial updates. If you also expose PUT, document and test its behavior rather than leaving its semantics unclear.

Validation details
• Programs: required unique code, required name, valid status.
• Courses: required unique course code, title, valid positive units, status.
• Academic terms: valid year format, semester, date ordering, unique year/semester.
• Students: unique student number, required names, valid optional email, existing program, valid year level and status.
• Updates: uniqueness checks must ignore the resource being updated.
• Every write: accept only validated fields; never persist $request->all() blindly.

For DELETE, implement the deactivation behavior defined in Phase 0. State whether deactivated resources remain available through historical references and explicit status filters.

Checkpoint: Every module passes create, retrieve, update, deactivate, invalid-input, forbidden, and not-found tests.

Phase 6: Build academic transactions

This phase contains the most important business logic.

Course offerings

Implement CRUD for:

`text
/api/v1/course-offerings
/api/v1/course-offerings/{id}
`

Validate the course, term, instructor role/status, section, capacity, and offering status.

For the minimum submission, a documented schedule string is acceptable. Do not claim schedule-conflict detection unless you model structured meeting times and actually implement it.

Enrollments

Required routes:

`text
GET    /api/v1/enrollments
POST   /api/v1/enrollments
GET    /api/v1/enrollments/{id}
PATCH  /api/v1/enrollments/{id}
DELETE /api/v1/enrollments/{id}

GET    /api/v1/students/{id}/enrollments
GET    /api/v1/course-offerings/{id}/students
`

Implement enrollment creation in an atomic transaction:

Authorize the caller.
Lock the relevant offering row.
Verify the student, offering, and term are eligible.
Check for an existing enrollment.
Count occupied seats.
Reject a full offering.
Insert the enrollment.
Commit and return 201.

All seat-changing operations, including restoring a dropped enrollment and changing capacity, must follow the same locking convention.

Validation alone is not concurrency protection. Two requests can both pass an initial check. The database unique constraint protects against duplicates; consistent transaction locking protects capacity.

Do not allow PATCH /enrollments/{id} to silently move a graded enrollment to another student or offering.

Grades

Required routes:

`text
GET    /api/v1/grades
POST   /api/v1/grades
GET    /api/v1/grades/{id}
PATCH  /api/v1/grades/{id}
GET    /api/v1/students/{id}/grades
`

Implement:

• One grade record per enrollment.
• Grade-range validation.
• Instructor authorization through enrollment → offering → instructor.
• No grade entry for dropped enrollments.
• Draft and published states.
• Publication requiring a valid final grade.
• No client-supplied reassignment of an existing grade to another enrollment.
• Consistent derivation of pass/fail remarks if your grading policy uses them.

Academic record

Implement:

`text
GET /api/v1/students/{id}/academic-record
`

Return the student's authorized academic information grouped by term, including:

• Term identification.
• Course code, title, and units.
• Offering section.
• Enrollment status.
• Applicable final grade and remarks.

Do not treat missing grades as zero. Do not include a GPA unless you define its formula, treatment of incomplete grades, and repeat-course rules.

Paginate by term or apply a documented bounded strategy so the response does not become an unlimited nested dataset. Students must not receive draft grades through this endpoint.

Checkpoint: The API completes the full flow: create offering → enroll student → encode grade → publish grade → retrieve academic record.

Phase 7: Finish collection features and security hardening

Build basic pagination into the first collection endpoint, then standardize it across all modules here.

Collection contract

For students, support:

`http
GET /api/v1/students?search=dela&programid=1&yearlevel=3&status=ACTIVE&sort=lastname&page=1&perpage=20
`

Recommended conventions:

| Feature | Convention |
|---|---|
| Search | search=... |
| Ascending sort | sort=lastname |
| Descending sort | sort=-lastname |
| Default page size | 20 |
| Maximum page size | 100 |
| Invalid filter or sort | 422 |
| Empty authorized collection | 200 with an empty data array |

Use an allowlist for sort columns. Query parameter binding does not make arbitrary user-selected column names safe.

Also:

• Group search OR conditions so they cannot bypass ownership constraints.
• Apply authorization scope before filtering and pagination.
• Add a stable secondary sort, such as id.
• Eager-load relationships to prevent repeated per-record queries.
• Paginate nested lists, including offering rosters and student enrollments.
• Allow only documented query parameters and valid filter values.

Security review

Verify that:

• Responses exclude secrets and unnecessary personal information.
• Account role/status changes are administrator-controlled.
• Database errors never reveal SQL, credentials, or stack traces.
• Logs omit passwords and bearer tokens.
• Browser CORS uses an explicit allowed-origin list.
• Preflight requests work for configured browser clients.
• Non-local deployment uses HTTPS and APPDEBUG=false.

CORS is not authorization. A client outside a browser can still call the API, so every permission must be enforced by the backend.

Checkpoint: Every collection is bounded, filtered correctly, and protected against cross-user information disclosure.

Phase 8: Complete automated tests

Write tests during each phase; this phase is the final coverage and regression pass.

Use a separate testing database. Never run database-resetting tests against development records you need to preserve or against production.

Minimum test coverage

| Area | Tests to include |
|---|---|
| Authentication | Valid login, invalid password, missing token, invalid token, logout revocation, expired token |
| Account status | Inactive user cannot log in or continue using an existing token |
| Students | Create, retrieve, update, duplicate number, invalid email, invalid program, missing record |
| Authorization | Administrator allowed, student denied, instructor denied, another student's record denied |
| Offerings | Invalid instructor role, invalid capacity, duplicate section identity |
| Enrollments | Valid enrollment, invalid references, duplicate, full offering, dropped-enrollment restoration |
| Grades | Valid submission, out-of-range values, duplicate grade, dropped enrollment, unrelated instructor denied |
| Academic records | Correct term grouping, ownership, draft-grade exclusion, missing-grade handling |
| Collections | Search, filters, sort, page metadata, page-size limits, scoped totals |
| Error handling | JSON errors, correct statuses, no sensitive details |

Include a real token lifecycle test using login and the issued bearer token. Tests that only impersonate users do not prove login and logout actually work.

Test locking and capacity behavior against MySQL as well; SQLite-only tests do not establish MySQL concurrency correctness.

Run from backend/:

`bash
php artisan test
./vendor/bin/pint --test
composer validate
composer audit
`

Review relevant dependency findings rather than treating a completed audit command as proof that everything is safe.

Checkpoint: The full test suite passes from a clean checkout and clean test database.

Phase 9: Finish documentation and external-client verification

Documentation must describe the implementation you built, not an earlier plan.

OpenAPI and Swagger UI

Maintain docs/openapi.yaml and expose a Swagger UI page at a documented location such as /api/docs.

For every endpoint, document:

• HTTP method, path, purpose, and permitted roles.
• Authentication requirements.
• Path parameters.
• Query parameters and pagination limits.
• Required and optional request fields.
• Allowed status and enum values.
• Successful response schemas and examples.
• Validation, authorization, not-found, and conflict examples.
• Deactivation, dropped-enrollment, and grade-publication behavior.

Define HTTP bearer authentication without incorrectly describing Sanctum tokens as JWTs.

Postman collection

Create folders for all resource groups, including Users and Academic Records.

Use environment variables such as:

`text
baseurl
admintoken
registrartoken
instructortoken
studenttoken
programid
studentid
courseid
academictermid
courseofferingid
enrollmentid
gradeid
`

Capture IDs and tokens from responses so the sequence does not depend on guessed database IDs. Export a sanitized environment template with no real tokens.

Include negative requests, not just successful ones.

Update the existing README

Your root README should explain both activities:

• Previous activity: TypeScript tooling and development workflow.
• Current activity: Laravel Student Information Management REST API.
• Exact prerequisites.
• Installation and environment configuration.
• Database creation, migration, and seeding.
• Running the API.
• Login and bearer-token usage.
• Documentation URL and Postman collection location.
• Automated test commands.
• Disposable demonstration accounts.
• Architecture and business-rule links.
• AI usage and verification process.

Fix the existing clone-directory mismatch: cloning act-1.git normally creates act-1/, not student-services-portal/, unless you supply that destination explicitly.

Verify actual external consumption

Use Postman or curl, not only Laravel tests:

Log in.
Read the returned token.
Call /api/v1/auth/me using the token.
Create and retrieve a student as staff.
Retrieve that student's permitted records with the linked student account.
Log out.
Confirm the revoked token no longer works.

Browser CORS must be checked separately; success in Postman does not prove browser access is configured correctly.

Checkpoint: Another person can follow the README and execute the documented API requests without asking you how the project works.

Phase 10: Rehearse the mandatory demonstration

Prepare docs/demo-checklist.md in the laboratory's required order:

Start the API and demonstrate database connectivity.
Authenticate successfully.
Show a protected request failing without authentication.
Create a program.
Create a valid student.
Reject an invalid or duplicate student.
Retrieve and update a student.
Search and filter students.
Demonstrate sorting and pagination.
Create a course and academic term.
Create a course offering.
Enroll a student.
Reject duplicate enrollment.
Encode or update an authorized grade.
Retrieve the student's academic record.
Show a forbidden request.
Show a not-found response.
Display the API documentation.
Run the automated tests.
Explain one AI-assisted contribution and how you verified it.

Use disposable demonstration records and ensure the sequence can be repeated.

Checkpoint: You can run all 20 cases and explain the corresponding controller, policy, validation, relationships, and tests.

Git and AI workflow for every phase

Continue the branching, review, and meaningful-commit workflow from your previous activity.

Suggested branch sequence:

`text
feature/laravel-api-setup
feature/database-schema-seeders
feature/authentication-authorization
feature/core-resources
feature/academic-transactions
feature/collection-features
feature/api-tests
docs/api-documentation
`

For each small implementation slice:

Define the behavior and expected failure cases.
Ask AI for one bounded task.
Review the generated code.
Run formatting and tests.
Update the matching API documentation.
Commit the verified change.

A useful prompt template is:

`text
Context:
This is a Laravel Student Information Management REST API.
Use the project's installed Laravel version and existing conventions.

Task:
Implement only [specific operation or resource].

Business rules:
[List the exact rules.]

Authorization:
[Who may perform the action and which records they may access.]

Requirements:
• Use Form Requests, Policies, and API Resources.
• Accept only validated fields.
• Use transactions where multiple writes must succeed together.
• Include positive, negative, and authorization feature tests.
• Update the relevant OpenAPI operation.
• Do not modify unrelated modules.

Explain:
• Files changed.
• Important design decisions.
• How to run and interpret the tests.
`

In docs/ai-usage.md`, record the task, generated contribution, corrections you made, and tests executed. Do not claim tests passed unless you actually ran them.

Final completion gate

The project is ready when a fresh checkout can be configured, migrated, seeded, started, tested, and consumed through the documented API, with all required modules and all four roles working correctly.

Prioritize in this order:

Reproducible database → secure access → correct CRUD → reliable academic transactions → bounded collections → verified documentation and tests.

Leave dashboards, caching, CSV export, PDF reports, and other bonus features until that complete path works.