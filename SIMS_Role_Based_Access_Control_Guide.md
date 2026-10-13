POST

## Purpose

This guide defines the final role behavior for the SIMS and provides a phased implementation plan across the Laravel backend and React frontend.

```text
ADMINISTRATOR
    ↓
Full administrative control

REGISTRAR / STAFF
    ↓
Manage students
Manage programs
Manage courses
Manage academic terms
Manage course offerings
Manage enrollments
Manage authorized academic records

INSTRUCTOR
    ↓
View assigned course offerings
View enrolled students
Enter/update grades
View authorized student academic information

STUDENT
    ↓
View own profile
View own enrollments
View own grades
View own academic record
```

Laravel is the final security authority. React role-aware UI improves usability but is never the security boundary.

---

# PHASE 0 — DEFINE THE FINAL ROLE MODEL

Required roles:

```text
ADMIN
REGISTRAR
INSTRUCTOR
STUDENT
```

Use canonical role names consistently throughout the database, backend, API, frontend, seeders, and tests.

Do not mix values such as `Admin`, `administrator`, `admin`, or `staff` without an explicit centralized mapping.

---

# PHASE 1 — MASTER PERMISSION MATRIX

Permission legend:

```text
C = Create
R = Read
U = Update
D = Delete
A = Authorized/assigned records only
O = Own record only
F = Full access
```

| Resource | Administrator | Registrar | Instructor | Student |
|---|---|---|---|---|
| Users | CRUD/F | R/U authorized | - | R own |
| Students | CRUD/F | CRUD | R assigned/authorized | R own |
| Programs | CRUD/F | CRUD | R | R |
| Courses | CRUD/F | CRUD | R | R |
| Academic Terms | CRUD/F | CRUD | R | R |
| Course Offerings | CRUD/F | CRUD | R assigned | R relevant |
| Enrollments | CRUD/F | CRUD | R assigned | R own |
| Grades | CRUD/F | CRUD authorized | C/R/U assigned | R own |
| Academic Records | CRUD/F | CRUD authorized | R authorized | R own |
| Profile | CRUD | CRUD own/authorized | CRUD own | R own |
| Dashboard | Full | Registrar dashboard | Instructor dashboard | Student dashboard |

This matrix is the authority for Laravel policies, API permissions, React navigation, action buttons, and authorization tests.

---

# PHASE 2 — ADMINISTRATOR WORKFLOW

Administrator is the highest-privilege application role.

Administrator can manage:

```text
Users / roles
Students
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Grades
Authorized Academic Records
System administration features that are explicitly part of the project
```

Expected administrator actions on managed resources:

```text
View
Create
Edit / Update
Delete / Deactivate
```

## Administrator Navigation

```text
Dashboard
Users
Students
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Grades
Academic Records
Profile
Logout
```

Administrator must be able to perform the complete administrative workflow against the real API and database.

---

# PHASE 3 — REGISTRAR WORKFLOW

Registrar is the operational academic-management role.

## Registrar permissions

### Students

```text
Create
Read
Update
Delete / Deactivate
```

### Programs

```text
Create
Read
Update
Delete
```

### Courses

```text
Create
Read
Update
Delete
```

### Academic Terms

```text
Create
Read
Update
Delete
```

### Course Offerings

```text
Create
Read
Update
Delete
```

### Enrollments

```text
Read
Validate/Approve instructor enrollments
View enrollment reports
```

### Academic Records

```text
View authorized records
Maintain authorized records
Correct/update records according to business rules
```

Registrar should not automatically receive unrestricted user/security/system administration unless explicitly required.

## Registrar Navigation

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

---

# PHASE 4 — INSTRUCTOR WORKFLOW

Instructor is restricted to assigned academic work.

## Course Offerings

Instructor can **READ only assigned offerings**.

Example:

```text
Instructor A
  ├── IT101 Section A → assigned → visible
  ├── IT205 Section B → assigned → visible
  └── CS301 Section C → not assigned → hidden / 403
```

## Enrollments

Instructor can **CREATE and READ** enrollments for assigned course offerings across all year levels (1st year to 4th year).

Example:

```text
Instructor A
    ↓
IT101 Section A (assigned, 1st year)
IT205 Section B (assigned, 2nd year)
CS301 Section C (assigned, 3rd year)
CS401 Section D (assigned, 4th year)
    ↓
Enroll students in any assigned offering (1st-4th year)
    ↓
Students enrolled in assigned offerings
```

Instructor must not be able to enroll students in unassigned course offerings.

## Enrolled Students

Instructor can view students enrolled in assigned course offerings.

```text
Instructor A
    ↓
IT101 Section A
    ↓
Students enrolled in IT101-A only
```

Instructor must not be able to use an ID change to browse unrelated students.

---

# PHASE 5 — INSTRUCTOR GRADE WORKFLOW

Grades are the primary Instructor write operation.

Instructor may:

```text
Create grade
Read grade
Update grade
```

Only when all relationships are valid:

```text
Instructor
    ↓
Assigned Course Offering
    ↓
Student enrolled in Course Offering
    ↓
Enrollment
    ↓
Grade
```

Authorization decision:

```text
Role = Instructor
AND instructor is assigned to offering
AND student is enrolled in offering
AND grade belongs to that enrollment
    ↓
ALLOW
```

Otherwise:

```text
403 Forbidden
```

Instructor does not have general administrative CRUD over programs, courses, enrollments, or other unrelated academic records.

---

# PHASE 6 — INSTRUCTOR STUDENT INFORMATION ACCESS

Instructor should receive only information necessary for legitimate academic work, such as:

```text
Student Name
Student Number
Program
Year Level
Enrollment
Course Offering
Grades
Relevant academic information
```

Do not automatically expose:

```text
All university students
Unrelated academic records
Administrative-only information
Unnecessary private account information
```

Use a need-to-know principle.

---

# PHASE 7 — STUDENT WORKFLOW

Student has the most restricted access.

Student can view:

```text
Own profile
Own enrollments
Own grades
Own academic record
```

Student cannot administer academic data.

## Student profile

The student may view:

```text
Name
Email
Student Number
Program
Year Level
Status
```

A student must never be able to read another student's private record simply by changing an ID.

---

# PHASE 8 — STUDENT ENROLLMENT ACCESS

Student can:

```text
READ own enrollments
```

Student cannot:

```text
Create arbitrary enrollment
Update another student's enrollment
Delete another student's enrollment
```

Ownership rule:

```text
authenticated_user.student_id == enrollment.student_id
```

Otherwise:

```text
403 Forbidden
```

---

# PHASE 9 — STUDENT GRADE ACCESS

Student can:

```text
READ own grades
```

Student cannot:

```text
Create grade
Update grade
Delete grade
```

Authorization relationship:

```text
Grade
 ↓
Enrollment
 ↓
Student
 ↓
Authenticated Student
```

Example:

```http
GET /api/v1/students/25/grades
```

If the authenticated student is Student #25 → allow.

If the authenticated student is Student #20 → deny with an appropriate authorization response, normally 403.

---

# PHASE 10 — STUDENT ACADEMIC RECORD

Student can **VIEW only their own academic record**.

Typical information:

```text
Course Code
Course Title
Units
Academic Term
Instructor
Grade
Remarks
```

The Student does not directly modify the academic record.

Workflow:

```text
Student Login
  ↓
Authenticated User
  ↓
Student ID
  ↓
Enrollments
  ↓
Grades
  ↓
Academic Record
  ↓
Display
```

---

# PHASE 11 — BACKEND AUTHORIZATION ARCHITECTURE

Implement authorization in Laravel first.

Recommended structure:

```text
app/
 ├── Models/
 ├── Policies/
 ├── Http/
 │   ├── Controllers/
 │   ├── Middleware/
 │   └── Requests/
 └── Services/
```

Potential policies:

```text
UserPolicy
StudentPolicy
ProgramPolicy
CoursePolicy
AcademicTermPolicy
CourseOfferingPolicy
EnrollmentPolicy
GradePolicy
AcademicRecordPolicy
```

---

# PHASE 12 — ROLE CHECKING

Use one consistent role-checking mechanism, for example:

```php
$user->hasRole('administrator');
$user->hasRole('registrar');
$user->hasRole('instructor');
$user->hasRole('student');
```

Do not scatter inconsistent checks such as:

```php
$user->role === 'Admin'
$user->role === 'administrator'
$user->role_id === 1
$user->is_staff === true
```

unless those values are centrally normalized.

---

# PHASE 13 — POLICIES

Policies should implement resource actions such as:

```text
viewAny()
view()
create()
update()
delete()
```

Example StudentPolicy concept:

```text
Administrator → all students
Registrar → authorized students
Instructor → assigned/authorized students only
Student → own student record only
```

Apply equivalent resource rules to programs, courses, terms, offerings, enrollments, grades, and academic records.

---

# PHASE 14 — COURSE OFFERING AUTHORIZATION

| Role | Access |
|---|---|
| Administrator | CRUD all offerings |
| Registrar | CRUD authorized offerings |
| Instructor | READ assigned offerings |
| Student | READ relevant/enrolled offerings |

---

# PHASE 15 — ENROLLMENT AUTHORIZATION

| Role | Access |
|---|---|
| Administrator | CRUD all |
| Registrar | CRUD authorized enrollments |
| Instructor | CREATE and READ enrollments for assigned offerings |
| Student | READ own enrollments |

Relationships used for authorization:

```text
Enrollment
   ↓
Course Offering
   ↓
Instructor
```

and:

```text
Enrollment
   ↓
Student
   ↓
Authenticated Student
```

---

# PHASE 16 — GRADE AUTHORIZATION

| Role | Access |
|---|---|
| Administrator | CRUD |
| Registrar | CRUD authorized grades |
| Instructor | CREATE / READ / UPDATE assigned grades |
| Student | READ own grades |

Instructor grade mutation must verify the offering assignment and enrollment relationship.

Student grade data must be read-only.

---

# PHASE 17 — OBJECT-LEVEL AUTHORIZATION

A role check alone is insufficient.

Bad:

```php
if ($user->role === 'instructor') {
    allow();
}
```

This could accidentally give an instructor access to every student.

Instead verify:

```text
Instructor
+ assigned Course Offering
+ student enrolled in that offering
+ requested action
= authorization decision
```

For students:

```text
Student
+ record belongs to authenticated student
+ requested action is allowed
= authorization decision
```

Object-level authorization is mandatory for:

```text
Students
Course Offerings
Enrollments
Grades
Academic Records
```

---

# PHASE 18 — API AUTHORIZATION MATRIX

Maintain a documented matrix like:

| Resource / Operation | Admin | Registrar | Instructor | Student |
|---|---|---|---|---|
| Students | Full CRUD | CRUD | Read assigned/authorized | Read own |
| Programs | Full CRUD | CRUD | Read | Read |
| Courses | Full CRUD | CRUD | Read | Read |
| Academic Terms | Full CRUD | CRUD | Read | Read |
| Course Offerings | Full CRUD | CRUD | Read assigned | Read relevant |
| Enrollments | Full CRUD | CRUD | Create/Read assigned | Read own |
| Grades | Full CRUD | CRUD authorized | Create/Read/Update assigned | Read own |
| Academic Records | Full CRUD | CRUD authorized | Read authorized | Read own |

The matrix must match the actual Laravel policies, middleware, controllers, and routes.

---

# PHASE 19 — FRONTEND ROUTE GUARDS

React should enforce role-aware navigation for UX.

Conceptually:

```text
ProtectedRoute
    ↓
Authenticated?
    ↓
Role allowed?
    ↓
Render page
```

Recommended role areas:

```text
/admin/*       → ADMIN
/registrar/*   → ADMIN + REGISTRAR
/instructor/*  → ADMIN + INSTRUCTOR
/student/*     → ADMIN + STUDENT
```

These frontend checks are not the security boundary. Laravel must still enforce authorization.

---

# PHASE 20 — ROLE-AWARE NAVIGATION

## Administrator

```text
Dashboard
Users
Students
Programs
Courses
Academic Terms
Course Offerings
Enrollments
Grades
Academic Records
Profile
Logout
```

## Registrar

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
Academic Information
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

---

# PHASE 21 — ROLE-AWARE CRUD BUTTONS

The UI must show only appropriate actions.

## Students

Administrator:

```text
View / Create / Edit / Delete
```

Registrar:

```text
View / Create / Edit / Delete
```

Instructor:

```text
View assigned/authorized
```

Student:

```text
View own
```

## Grades

Administrator:

```text
View / Create / Edit / Delete
```

Registrar:

```text
View / Create / Edit / Delete
```

Instructor:

```text
View / Enter Grade / Edit Grade
```

Student:

```text
View only
```

## Enrollments

Administrator:

```text
View / Create / Edit / Delete
```

Registrar:

```text
View / Create / Edit / Delete
```

Instructor:

```text
View assigned enrollments
```

Student:

```text
View own enrollment
```

---

# PHASE 22 — ROLE-AWARE DASHBOARDS

## Administrator

```text
Total Students
Total Programs
Total Courses
Active Terms
Course Offerings
Enrollments
Users
Academic activity
```

## Registrar

```text
Students
Programs
Courses
Current Term
Course Offerings
Enrollment activity
Academic record activity
```

## Instructor

```text
Assigned Courses
Number of Students
Pending Grade Entry
Recent Grades
Current Term
```

## Student

```text
Current Program
Year Level
Current Enrollments
Recent Grades
Academic Record shortcut
GPA/summary if supported
```

---

# PHASE 23 — API DATA SCOPING

Do not return more records than a role should see.

Bad:

```text
Instructor GET /students
→ returns every university student
```

Correct:

```text
Instructor
    ↓
Only students belonging to assigned offerings
```

For students:

```text
Student
    ↓
Only authenticated student's data
```

Scoping must happen on the server, not only in React.

---

# PHASE 24 — QUERY-SCOPING STRATEGY

Recommended conceptual scopes:

```text
Student::visibleToInstructor($instructor)
Student::visibleToStudent($student)
CourseOffering::assignedToInstructor($instructor)
Enrollment::forInstructor($instructor)
Enrollment::forStudent($student)
Grade::forInstructor($instructor)
Grade::forStudent($student)
```

These scopes reduce repeated authorization logic and the risk of accidental data leakage.

---

# PHASE 25 — PREVENT URL / ID BYPASS

Test requests such as:

```text
Student #20 logged in
    ↓
GET /api/v1/students/15
```

Expected:

```text
403 Forbidden
```

Also test:

```text
GET /api/v1/students/{other}/grades
GET /api/v1/students/{other}/academic-record
GET /api/v1/enrollments/{other}
GET /api/v1/grades/{other}
```

A user must not gain access by changing IDs in the URL.

---

# PHASE 26 — 401 VS 403 HANDLING

## 401 Unauthorized

Means the request is not authenticated.

Recommended frontend behavior:

```text
Clear invalid session/token
Redirect to login
Show appropriate message
```

## 403 Forbidden

Means the user is authenticated but not authorized.

Recommended behavior:

```text
Show Access Denied state
Do not expose protected data
Do not retry indefinitely
```

---

# PHASE 27 — ROLE-BASED TEST ACCOUNTS

Create representative development accounts:

```text
Administrator
Registrar
Instructor
Student
```

Never commit real production credentials.

Create representative relationships:

```text
Instructor A
    ↓
IT101 Section A
    ↓
Student 001
Student 002
Student 003
```

and:

```text
Student 001
    ↓
Enrollment
    ↓
Grade
    ↓
Academic Record
```

---

# PHASE 28 — BACKEND AUTHORIZATION TESTING

## Administrator tests

```text
Can view students
Can create student
Can update student
Can delete/deactivate student
Can manage courses
Can manage enrollments
Can manage grades
```

## Registrar tests

```text
Can CRUD students
Can CRUD programs
Can CRUD courses
Can CRUD terms
Can CRUD offerings
Can CRUD enrollments
Can manage authorized records
Cannot perform restricted system administration unless explicitly allowed
```

## Instructor tests

```text
Can view assigned offering
Can view assigned students
Can create grade for assigned enrollment
Can update assigned grade
Cannot view unrelated offering
Cannot modify enrollment
Cannot manage programs
Cannot manage courses
```

## Student tests

```text
Can view own profile
Can view own enrollment
Can view own grades
Can view own academic record
Cannot view another student
Cannot create grade
Cannot update grade
Cannot delete enrollment
Cannot manage courses
```

---

# PHASE 29 — FRONTEND ROLE TESTING

## Administrator

Verify:

```text
All management menus visible
All allowed CRUD actions available
```

## Registrar

Verify:

```text
Registrar modules visible
Unauthorized system modules hidden
Unauthorized actions hidden
```

## Instructor

Verify:

```text
My Course Offerings visible
My Students visible
Grades visible
Administrative CRUD hidden
```

## Student

Verify:

```text
My Profile visible
My Enrollments visible
My Grades visible
My Academic Record visible
Admin controls absent
Registrar controls absent
Instructor grade-entry controls absent
```

---

# PHASE 30 — NEGATIVE SECURITY TESTING

Test what users must NOT be able to do.

Examples:

```text
Student → another student's student record
Instructor → unrelated student record
Instructor → modify enrollment
Student → POST /grades
Student → PATCH /grades/{id}
Student → modify academic record
Registrar → restricted system administration
```

Expected result is normally:

```text
403 Forbidden
```

or another deliberately controlled authorization-safe response.

---

# PHASE 31 — FINAL CRUD / ACCESS VERIFICATION MATRIX

| Role | Students | Programs | Courses | Terms | Offerings | Enrollments | Grades | Academic Records |
|---|---|---|---|---|---|---|---|---|
| Admin | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| Registrar | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD authorized | CRUD authorized |
| Instructor | R assigned | R | R | R | R assigned | CR assigned | CRU assigned | R authorized |
| Student | R own | R | R | R | R relevant | R own | R own | R own |

This is the final behavioral contract.

---

# PHASE 32 — IMPLEMENTATION ORDER

Implement in this sequence:

```text
1. Define roles
       ↓
2. Define permission matrix
       ↓
3. Implement backend role model
       ↓
4. Implement middleware/policies
       ↓
5. Implement object-level authorization
       ↓
6. Secure API endpoints
       ↓
7. Seed role-based test data
       ↓
8. Write backend authorization tests
       ↓
9. Implement React authentication
       ↓
10. Implement frontend role guards
       ↓
11. Implement role navigation
       ↓
12. Implement role-aware CRUD actions
       ↓
13. Implement role-specific dashboards
       ↓
14. Test positive workflows
       ↓
15. Test negative workflows
       ↓
16. Fix authorization issues
       ↓
17. Document final permissions
       ↓
18. Perform end-to-end demonstration
```

---

# PHASE 33 — DEFINITION OF DONE

## Backend

```text
[ ] Four roles exist
[ ] Role names are consistent
[ ] Policies exist
[ ] Middleware/guards exist where appropriate
[ ] Object-level authorization exists
[ ] API endpoints enforce roles
[ ] API endpoints enforce ownership/assignment
[ ] Administrator can perform full administration
[ ] Registrar can perform registrar functions
[ ] Instructor is limited to authorized academic data
[ ] Student is limited to own data
[ ] 401 is handled
[ ] 403 is handled
[ ] Authorization tests pass
```

## Frontend

```text
[ ] Protected routes exist
[ ] Role-aware navigation exists
[ ] CRUD controls are role-aware
[ ] Instructor sees assigned courses
[ ] Instructor sees assigned students
[ ] Instructor can enter/update grades
[ ] Student sees only own information
[ ] Student cannot see grade-entry controls
[ ] Student cannot see administrative modules
[ ] Registrar sees registrar modules
[ ] Administrator sees full administrative modules
[ ] 403 page/state exists
```

## Security

```text
[ ] Student cannot access another student
[ ] Instructor cannot access unrelated students
[ ] Instructor cannot modify enrollments
[ ] Student cannot modify grades
[ ] Student cannot modify academic records
[ ] URL/ID changes cannot bypass authorization
[ ] API remains authoritative
```

---

# PHASE 34 — FINAL END-TO-END WORKFLOWS

## ADMINISTRATOR

```text
Login
  ↓
Administrator Dashboard
  ↓
Students
  ↓
Create/Edit/Delete Student
  ↓
Programs
  ↓
Courses
  ↓
Academic Terms
  ↓
Course Offerings
  ↓
Enrollments
  ↓
Grades
  ↓
Academic Records
```

Administrator has full administrative control.

## REGISTRAR

```text
Login
  ↓
Registrar Dashboard
  ↓
Students
  ↓
Manage Student Records
  ↓
Programs
  ↓
Courses
  ↓
Academic Terms
  ↓
Course Offerings
  ↓
Enrollments
  ↓
Authorized Academic Records
```

Registrar performs operational academic administration.

## INSTRUCTOR

```text
Login
  ↓
Instructor Dashboard
  ↓
My Course Offerings
  ↓
Select Assigned Course
  ↓
View Enrolled Students
  ↓
Select Student
  ↓
View Authorized Academic Information
  ↓
Enter Grade
  ↓
Update Grade
```

Instructor cannot move outside assigned academic scope.

## STUDENT

```text
Login
  ↓
Student Dashboard
  ↓
My Profile
  ↓
My Enrollments
  ↓
My Grades
  ↓
My Academic Record
```

Student is read-only for academic records.

---

# PHASE 35 — FINAL SECURITY PRINCIPLE

Use this authorization model:

```text
ROLE
  +
RESOURCE
  +
OWNERSHIP / ASSIGNMENT
  +
ACTION
  =
AUTHORIZATION DECISION
```

Example:

```text
Instructor
+
Grade
+
Assigned Course Offering
+
Update
=
ALLOW
```

But:

```text
Instructor
+
Grade
+
Unrelated Course Offering
+
Update
=
DENY
```

Student example:

```text
Student
+
Academic Record
+
Own Record
+
Read
=
ALLOW
```

But:

```text
Student
+
Academic Record
+
Another Student's Record
+
Read
=
DENY
```

Never rely only on:

```text
if role == instructor
```

Also verify:

```text
Is this instructor assigned to this course offering?
```

For students verify:

```text
Does this record belong to the authenticated student?
```

---

# FINAL ACCEPTANCE CRITERIA

The RBAC system is complete only when it works against the **real Laravel API and real database**:

```text
ADMINISTRATOR
    → can manage the complete system

REGISTRAR
    → can manage academic operations

INSTRUCTOR
    → can only work with assigned academic data
    → can enter/update grades

STUDENT
    → can only view their own academic information
```

The complete security model is:

```text
React UI restrictions
        +
Laravel API authorization
        +
Object-level authorization
        +
Automated authorization tests
        =
COMPLETE ROLE-BASED SIMS
```

## Final CRUD / Access Summary

```text
ADMINISTRATOR
    Students         → CRUD
    Programs         → CRUD
    Courses          → CRUD
    Terms            → CRUD
    Offerings        → CRUD
    Enrollments      → CRUD
    Grades           → CRUD
    Academic Records → CRUD

REGISTRAR
    Students         → CRUD
    Programs         → CRUD
    Courses          → CRUD
    Terms            → CRUD
    Offerings        → CRUD
    Enrollments      → CRUD
    Grades           → CRUD authorized
    Academic Records → CRUD authorized

INSTRUCTOR
    Students         → READ assigned/authorized
    Programs         → READ
    Courses          → READ
    Terms            → READ
    Offerings        → READ assigned
    Enrollments      → READ assigned
    Grades            → CREATE / READ / UPDATE assigned
    Academic Records → READ authorized

STUDENT
    Students         → READ own
    Programs         → READ
    Courses          → READ
    Terms            → READ
    Offerings        → READ relevant
    Enrollments      → READ own
    Grades           → READ own
    Academic Records → READ own
```

This role model should be implemented before declaring role-based functionality complete.
