# EduCore School Management System

EduCore is a multi-tenant school management platform for managing daily academic and administrative operations. It provides role-based workspaces for directors, administrators, teachers, students, and parents, backed by Supabase and Next.js API routes.

## Features

- Role-based authentication and dashboards for directors, administrators, teachers, students, and parents
- Multi-school tenant isolation using school context and `X-School-ID`
- Student, teacher, parent, and user management
- Courses, subjects, academic years, sections, and subject assignments
- Attendance tracking and academic records
- Assignments, submissions, grading, exams, gradebook analytics, and report cards
- Timetables, schedule settings, and time-slot generation
- Curriculum documents, sharing, lesson plans, and uploads
- Announcements, messaging, parent feedback, payments, fees, and registrations
- Supabase database, authentication, and storage integration
- Optional standalone NestJS backend for multi-tenant API services

## Technology Stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth, and Storage
- NestJS 10 standalone backend
- Recharts, Lucide React, and Motion

## Project Structure

```text
app/       Next.js pages and API route handlers
backend/   Optional standalone NestJS API
lib/       Supabase, tenant context, cache, and performance utilities
src/       Shared React components, contexts, views, and API clients
backend/supabase/  Database schema, seed data, and migrations
assets/    Static project assets
```

## Prerequisites

- Node.js 18.18 or newer
- npm
- A Supabase project
- Optional Brevo credentials for password-reset email delivery

## Configuration

Copy the example environment file and replace its placeholders with local values. Never commit `.env` or real credentials.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Required variables are documented in [.env.example](.env.example):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
- `FRONTEND_RESET_PASSWORD_URL`

Configure the `BREVO_*` variables when password-reset email delivery is enabled. Service-role and email keys must remain server-side.

## Run the Next.js Application

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For production:

```powershell
npm run build
npm start
```

`npm start` requires a successful `npm run build` first.

## Optional NestJS Backend

The `backend` directory contains a separate NestJS API. It uses the same Supabase configuration, defaults to port `4000`, and exposes routes under `/api`.

```powershell
Set-Location backend
npm install
npm run start:dev
```

The backend accepts the `X-School-ID` tenant header. For production:

```powershell
npm run build
npm run start:prod
```

Set `BACKEND_PORT` to use a different port.

## Database Setup

Database assets are located in `backend/supabase`:

- `schema.sql` defines the schema
- `seed.sql` contains development seed data
- `migrations/` contains incremental changes

Apply the scripts to the intended Supabase project using the Supabase SQL editor or Supabase CLI. Review seed data before using it outside development.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create the optimized production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run the configured lint command |
| `npm --prefix backend run start:dev` | Start the NestJS backend in watch mode |
| `npm --prefix backend run build` | Compile the NestJS backend |

## Security Notes

- Keep `.env` local and use placeholders in `.env.example`.
- Rotate credentials immediately if they are committed or exposed.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, or `BREVO_SMTP_KEY` to the browser.
- Restrict CORS origins before deploying the standalone backend.
- Review tenant authorization on every school-scoped endpoint.
- Use Argon2 or bcrypt for any custom password storage in production.

## License

This project is private and intended for authorized EduCore use.
