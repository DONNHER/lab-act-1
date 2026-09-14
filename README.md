# Student Services Portal

## Project Overview

This repository contains two integrated activities:

1. **Previous Activity (TypeScript)**: A modular TypeScript application for student services management with code formatting, linting, and development workflow.
2. **Current Activity (Laravel)**: A database-backed REST API for Student Information Management built with Laravel 13, providing authentication, authorization, academic transactions, and comprehensive documentation.

---

## Activity 1: TypeScript Student Services Portal

### Project Description

A modular TypeScript application designed to streamline student services management, processing data workflows efficiently with built-in code formatting, strict linting standards, and a professional development environment.

### Requirements

* **Node.js** (v18.x or higher)
* **npm** or **pnpm**
* **TypeScript** (^5.8.2)
* **ESLint**
* **Prettier**
* **Git** and **GitHub account**

### Installation Instructions

```bash
git clone https://github.com/DONNHER/act-1.git
cd act-1
npm install
```

### How to Run the Project

```bash
npm run dev
```

### How to Run Linting

```bash
npm run lint
```

### How to Format Code

```bash
npm run format
```

### Development Workflow

1. Create a feature branch (e.g., `git switch -c feature/student-status`)
2. Write or modify source code inside the `src/` directory
3. Run `npm run format` to ensure proper code formatting
4. Run `npm run lint` to verify that there are no critical code quality errors
5. Commit changes with meaningful messages and push safely to GitHub:
   ```bash
   git add .
   git commit -m "feat: add student status formatter"
   git push -u origin feature/student-status
   ```
6. Open a Pull Request for code review and merge upon approval

---

## Activity 2: Laravel Student Information Management REST API

### Technology Stack

| Component | Choice | Purpose |
|-----------|--------|---------|
| Backend | Laravel 13 | REST API framework |
| PHP | PHP 8.4 | Consistent development and deployment runtime |
| Dependency Management | Composer | PHP packages and locked dependencies |
| Database | MySQL with InnoDB | Relational storage and transactions |
| Authentication | Laravel Sanctum | Bearer tokens for external API clients |
| Authorization | Laravel Policies + Role Enum | Role-based and record-level permissions |
| Validation | Form Requests | Server-side input validation |
| Responses | Laravel API Resources | Controlled JSON representations |
| Testing | PHPUnit | Automated feature and business-rule tests |
| PHP Formatting | Laravel Pint | PHP code style |
| Documentation | OpenAPI 3.0 + Swagger UI | Client-facing API contract |
| API Demonstration | Postman Collection | Repeatable successful and failed requests |

### Prerequisites

* **PHP** 8.3+ (8.4 recommended)
* **Composer** 2.x
* **MySQL** 8.0+ (or MariaDB 10.6+)
* **Git**

### Installation & Environment Configuration

```bash
# Clone the repository (creates 'act-1' directory)
git clone https://github.com/DONNHER/act-1.git
cd act-1

# Install PHP dependencies
cd backend
composer install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials:
# DB_DATABASE=studentservicesapi
# DB_USERNAME=studentapiuser
# DB_PASSWORD=yourpassword

# Generate application key
php artisan key:generate

# Run migrations and seeders
php artisan migrate:fresh --seed

# Start the development server
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api/v1`

### Database Creation

Create a dedicated development database and user:

```sql
CREATE DATABASE studentservicesapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'studentapiuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON studentservicesapi.* TO 'studentapiuser'@'localhost';
FLUSH PRIVILEGES;
```

### Running the API

```bash
cd backend
php artisan serve
```

The API runs at `http://127.0.0.1:8000` with API routes prefixed at `/api/v1`.

### Authentication & Bearer Token Usage

1. **Login** to obtain a token:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password"}'
   ```

2. **Use the token** in subsequent requests:
   ```bash
   curl -X GET http://127.0.0.1:8000/api/v1/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Logout** to revoke the token:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/auth/logout \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

### Default Demonstration Accounts

After running `php artisan migrate:fresh --seed`:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Administrator | admin@example.com | password | Full access |
| Registrar | registrar@example.com | password | Student/catalog management |
| Instructor 1 | instructor1@example.com | password | Assigned offerings only |
| Instructor 2 | instructor2@example.com | password | Assigned offerings only |
| Student 1 | student1@example.com | password | Linked to student profile |
| Student 2 | student2@example.com | password | Linked to student profile |

### API Documentation

* **Swagger UI**: `http://127.0.0.1:8000/api/documentation`
* **OpenAPI Spec (JSON)**: `http://127.0.0.1:8000/docs/api-docs.json`
* **OpenAPI Spec (YAML)**: `http://127.0.0.1:8000/docs/api-docs.yaml`
* **Postman Collection**: `docs/postman/student-services-api.postman_collection.json`
* **Postman Environment Template**: `docs/postman/student-services-api.postman_environment.json`

### Automated Test Commands

```bash
cd backend

# Run all tests
php artisan test

# Check code style
./vendor/bin/pint --test

# Validate composer.json
composer validate

# Security audit
composer audit
```

### Architecture & Business Rules

* [Architecture](docs/architecture.md)
* [Business Rules](docs/business-rules.md)
* [Authorization Matrix](docs/authorization-matrix.md)
* [Entity Relationship Diagram](docs/erd.md)
* [Requirements](docs/requirements.md)

### AI Usage & Verification

See [AI Usage Documentation](docs/ai-usage.md) for details on AI-assisted contributions and verification process.

### Demonstration Checklist

See [Demo Checklist](docs/demo-checklist.md) for the 20-step mandatory demonstration sequence.

---

## AI Usage Policy

> AI tools may be used to assist development. All AI-generated code must be reviewed, modified when necessary, tested, and verified before commit.
