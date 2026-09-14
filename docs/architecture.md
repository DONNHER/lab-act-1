# System Architecture

## Overview

This document describes the architecture of the Laravel Student Information Management REST API.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Postman, curl, Browser SPA, Mobile Apps, External Systems)    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Laravel API Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Routes    │  │ Middleware  │  │  Controllers │             │
│  │  (api.php)  │  │ (auth, cors)│  │  (Api/V1)    │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
└────────────────────────────────────────────┼────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────┐
                    ▼                        ▼                    ▼
           ┌───────────────┐         ┌───────────────┐    ┌───────────────┐
           │  Form Requests│         │   Policies    │    │   Services    │
           │  (Validation) │         │ (Authorization)│   │ (Business     │
           └───────────────┘         └───────────────┘    │  Logic)       │
                                                          └───────┬───────┘
                                                                  │
                    ┌────────────────────────┼────────────────────┐
                    ▼                        ▼                    ▼
           ┌───────────────┐         ┌───────────────┐    ┌───────────────┐
           │    Models     │         │ API Resources │    │  Database     │
           │ (Eloquent ORM)│         │ (Response     │    │  (MySQL       │
           └───────────────┘         │  Transformation)│   │   InnoDB)     │
                                     └───────────────┘    └───────────────┘
```

## Directory Structure

```
backend/
├── app/
│   ├── Enums/                    # PHP 8.1+ Enums for status/role values
│   ├── Http/
│   │   ├── Controllers/Api/V1/   # API Controllers (one per resource)
│   │   ├── Middleware/           # Custom middleware
│   │   ├── Requests/             # Form Requests (validation)
│   │   └── Resources/            # API Resources (response transformation)
│   ├── Models/                   # Eloquent Models
│   ├── Observers/                # Model observers
│   ├── Policies/                 # Authorization policies
│   ├── Providers/                # Service providers
│   └── Services/                 # Business logic services
├── bootstrap/
├── config/
├── database/
│   ├── factories/                # Model factories for testing/seeding
│   ├── migrations/               # Database schema migrations
│   └── seeders/                  # Database seeders
├── routes/
│   ├── api.php                   # API routes (prefixed with /api)
│   ├── web.php                   # Web routes (not used)
│   └── console.php               # Console commands
├── storage/
│   └── api-docs/                 # Generated OpenAPI documentation
├── tests/
│   ├── Feature/                  # Feature tests
│   └── Unit/                     # Unit tests
└── vendor/
```

## Key Architectural Decisions

### 1. API Versioning
- All API routes are prefixed with `/api/v1/`
- Versioning in URL path for explicit client control
- Future versions can be added as `/api/v2/`

### 2. Controller Organization
- One controller per resource (RESTful)
- Controllers extend `ApiController` base class
- Base class provides standardized response methods:
  - `success()` - Single resource response
  - `paginated()` - Paginated collection response
  - `created()` - 201 Created response
  - `noContent()` - 204 No Content response
  - `forbidden()` - 403 Forbidden response

### 3. Validation Layer
- Form Requests for all write operations
- Separate request classes for create vs update
- Validation rules centralized in request classes
- Automatic 422 response on validation failure

### 4. Authorization Layer
- Laravel Policies for record-level authorization
- Role-based access control via `role` enum
- Scoped queries for collection endpoints
- Policy methods: `viewAny`, `view`, `create`, `update`, `delete`

### 5. Business Logic Layer
- Services encapsulate multi-record transactions
- `EnrollmentService` - Enrollment creation, dropping, restoration
- `GradeService` - Grade upsert, publication
- `AcademicRecordService` - Academic record generation
- Services use database transactions for consistency

### 6. Response Transformation
- API Resources for all responses
- Consistent JSON structure:
  ```json
  {
    "data": { ... },
    "links": { ... },
    "meta": { ... }
  }
  ```
- Resources control field exposure per role

### 7. Database Design
- InnoDB for transaction support
- Foreign keys for all relationships
- Unique constraints for business rules
- Indexes on frequently queried columns
- Soft deletes not used (explicit status fields)

## Data Flow

### Request Flow
1. Client sends HTTP request to `/api/v1/{resource}`
2. Route matches controller method
3. Middleware: `auth:sanctum` validates bearer token
4. Form Request validates input (for write operations)
5. Policy authorizes action on resource
6. Controller calls Service (for complex operations) or Model directly
7. Service executes business logic in transaction
8. Controller returns API Resource response

### Response Flow
1. Model/Collection returned from controller
2. API Resource transforms data
3. Base controller wraps in standard envelope
3. JSON response sent to client

## Security Architecture

### Authentication
- Laravel Sanctum with API tokens
- Tokens stored in `personal_access_tokens` table
- Token revocation on logout and account deactivation
- Token expiration configurable

### Authorization
- Role enum: `ADMIN`, `REGISTRAR`, `INSTRUCTOR`, `STUDENT`
- Status enum: `ACTIVE`, `INACTIVE` (users), `ACTIVE`, `INACTIVE`, `GRADUATED` (students)
- Policies enforce record-level permissions
- Scoped queries prevent cross-user data access

### Data Protection
- Passwords hashed with bcrypt (cost 12)
- No sensitive data in API responses
- CORS configured for specific origins
- Rate limiting on authentication endpoints

## Scalability Considerations

- Stateless API design (token-based auth)
- Database indexes on foreign keys and filter columns
- Eager loading to prevent N+1 queries
- Pagination on all collection endpoints
- Services designed for transactional integrity

## Deployment Architecture

```
Production:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Load       │────▶│  Laravel    │────▶│  MySQL      │
│  Balancer   │     │  (PHP-FPM)  │     │  (InnoDB)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌─────────┐   ┌─────────┐
              │  Redis  │   │  Queue  │
              │ (Cache) │   │ Workers │
              └─────────┘   └─────────┘
```

## Monitoring & Observability

- Laravel Telescope (development)
- Structured logging to `storage/logs/`
- Database query logging (debug mode)
- Exception handling with JSON responses