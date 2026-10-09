# Workshop Registration Service

A full-stack, internal staff-facing web application for managing community training centre workshops and attendee registrations. Built with Next.js, Tailwind CSS, and Neon Serverless PostgreSQL.

---

## 🚀 1. Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- A PostgreSQL Database (Optimized for [Neon](https://neon.tech))

### Installation
1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   **Option A: Using Neon (Recommended)**
   If you are using Neon Serverless Postgres, use the Neon CLI to link your project. It will automatically authenticate and inject your `DATABASE_URL`:
   ```bash
   npx neon login
   npx neon link
   ```

   **Option B: Local PostgreSQL**
   Create a `.env.local` file in the root of your project:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=verify-full"
   SESSION_SECRET="your-very-secure-random-32-char-secret-key"
   ```

3. **Database Setup & Seeding**
   Run the setup script to build the core schema, apply necessary constraints for the waitlist feature, and populate mock workshops and default user accounts:
   ```bash
   npm run db:setup
   ```
   *(This sequentially runs `db:migrate`, `alter-waitlist.ts`, and `seed-workshops.ts`)*

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 2. Dev-Only Credentials

The `npm run db:migrate` command automatically provisions three default accounts for testing the Role-Based Access Control (RBAC).

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `pw123` | Can create & manage staff accounts. No dashboard access. |
| **Manager** | `manager` | `pw123` | Can CRUD workshops, view rosters, and register/cancel attendees. |
| **Staff** | `staff` | `pw123` | Can only view workshops and register/cancel attendees. |

---

## 📄 3. Architectural Write-up

### Stack Choices
- **Frontend/Backend:** Next.js 16 (App Router) using React 19.
- **Styling:** Tailwind CSS 4 for rapid, utility-first, high-density UI development.
- **Database:** PostgreSQL hosted on Neon (Serverless Postgres).
- **Authentication:** `jose` for Edge-compatible JSON Web Token (JWT) stateless sessions.
- **Driver:** Raw `pg` node postgres package.

### Design Decisions
- **Server Actions over API Routes:** Utilized Next.js Server Actions for all form submissions and database mutations. This removes the need for boilerplate REST APIs and tightly couples frontend interactions with secure backend execution.
- **Role-Based Access Control (RBAC):** Permissions are strictly enforced at the *server layer*. If a user manipulates the client to reveal the "Delete Workshop" button, the Server Action will still reject the request by checking the decrypted JWT session cookie.
- **Client-Side Pagination:** Since workshop capacities are generally small (10–150 attendees), rosters are fetched entirely on the server and paginated instantly on the client using React state. This eliminates network waterfalls when staff flip through pages.
- **Immutable History:** Registrations are never `DELETE`d. They are updated to `status = 'cancelled'`. A dedicated `registration_history` table logs the exact timestamp and the staff member responsible for every booking or cancellation.

### Trade-offs & Assumptions
- **Raw SQL vs. ORM:** Chose the raw `pg` driver over an ORM like Prisma or Drizzle. *Trade-off:* We lose strict type-safety on query results, but gain granular, low-level control over SQL transaction locks (crucial for concurrency) without fighting an ORM abstraction layer.
- **Waitlist Schema Integration:** Instead of creating a separate `waitlist` table, we merged it into the `registrations` table utilizing a `waitlisted` status. *Assumption:* Attendees on the waitlist share the exact same data shape as active attendees, so combining them reduces schema complexity and makes auto-promotion easier.

### Preventing Race Conditions (Over-registration)
The most critical requirement was preventing overbooking when multiple staff attempt to register for the final seat simultaneously. This is solved at the **Database level using Row-Level Locking**.

Inside the `registerAttendee` Server Action:
1. We open a `BEGIN` transaction.
2. We execute `SELECT capacity FROM workshops WHERE id = $1 FOR UPDATE`.
3. The `FOR UPDATE` clause places an exclusive write lock on that specific workshop row.
4. **The Scenario:** If Staff A and Staff B click "Register" at the exact same millisecond for the 20th/20 seat, the database forces them into a queue. Staff A acquires the lock, calculates `active = 19`, successfully claims the seat, and commits. Only *then* is Staff B granted the lock. Staff B recalculates `active = 20`, determines the workshop is full, and their attendee is safely routed to the waitlist. 
5. *(Note: We applied this same `FOR UPDATE` lock to the cancellation auto-promotion flow so concurrent cancellations don't accidentally promote the exact same waitlisted user twice).*

- **Broad System Audit Trail:** Along with registration history, we also implemented a system-wide `system_audit_logs` table that tracks administrative actions (like Admins creating staff accounts) and managerial actions (like Managers editing or deleting workshop details), fulfilling the final bonus requirement.