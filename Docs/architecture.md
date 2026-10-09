# Workshop Registration Service Architecture

## Overview
The Workshop Registration Service is a full-stack web application designed for internal staff to manage community training center workshops and attendee registrations. It provides a robust, real-time dashboard for managing workshops, handling registrations, and viewing system audits.

## Technology Stack
- **Framework**: Next.js 15 (React 19) with App Router
- **Styling**: Tailwind CSS (via PostCSS/Pico)
- **Database**: PostgreSQL (Neon Serverless Postgres / Local Postgres)
- **Authentication**: JWT-based session tokens using `jose`, injected securely on the client-side to overcome edge-middleware restrictions.
- **Data Access**: `pg` node-postgres library, wrapping raw SQL with optimized connection pooling.

## Key Features & Design Patterns

### Role-Based Access Control (RBAC)
The application defines three strictly enforced roles:
- **Admin**: Has full access to the system, including a dedicated `/admin` dashboard to view system-wide audit logs.
- **Manager**: Can view the main dashboard, create new workshops, edit existing workshops, and manage attendee registrations (register/cancel).
- **Staff**: Can view the main dashboard and manage attendee registrations, but cannot create or edit workshops.

Middleware and layout-level session checks ensure that users cannot access routes they are unauthorized for. 

### Server Actions & Data Mutations
All data mutations (login, registering attendees, cancelling registrations, creating workshops) are handled securely via React Server Actions. This eliminates the need for standalone API routes while ensuring server-side validation and immediate caching invalidation via `revalidatePath`.

### Session Management & The Edge Runtime
A major architectural hurdle in Next.js 15 Server Actions on Vercel Edge involves the stripping of cookies during specific redirects. To overcome this, the application generates a signed JWT session payload on the server, passes the token back in the payload body, and leverages a client-side `document.cookie` assignment followed by `window.location.href` to trigger a hard refresh. This guarantees that session cookies are persisted reliably across server components.

### Audit Trails & Data Immutability
- **Registration History**: Attendee registrations are never deleted. Instead, their status is toggled (e.g., `active`, `waitlisted`, `cancelled`), and every action is recorded in the `registration_history` table, tying the action directly to the staff member who performed it.
- **System Audit Logs**: Broad system actions, such as the creation or modification of a workshop, are logged in the `system_audit_logs` table. Admins can review these logs to trace actions back to specific managers.

## Database Schema Highlights
- `users`: Stores staff credentials and roles.
- `workshops`: Stores workshop details (capacity, instructor, schedule, status).
- `workshop_types`: Normalizes workshop categories and names.
- `registrations`: Associates attendees with workshops. Uses an `active`, `cancelled`, or `waitlisted` status.
- `registration_history` / `system_audit_logs`: Immutable append-only tables for auditing.
