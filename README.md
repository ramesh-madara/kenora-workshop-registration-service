# Workshop Registration Service

A full-stack, internal staff-facing web application for managing community training centre workshops and attendee registrations. Built with Next.js, Tailwind CSS, and Neon Serverless PostgreSQL.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL Database (Optimized for Neon)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=verify-full"
   SESSION_SECRET="your-very-secure-random-32-char-secret-key"
   ```
   *(Alternatively, if using Neon Serverless Postgres, simply run `npx neon login` and `npx neon link` to inject the database URL automatically).*

3. **Database Setup & Seeding**
   Initialize the database schema and seed mock data:
   ```bash
   npm run db:setup
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

---

**Test Accounts:** 
- **Admin**: `admin`
- **Manager**: `manager`
- **Staff**: `staff`
*(Password for all accounts is `pw123`)*