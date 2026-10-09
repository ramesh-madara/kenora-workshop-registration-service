# Workshop Registration Service

> ## 🌐 LIVE DEMO
> # 👉 [https://kenora-workshop-registration-service-9h52n0mkd.vercel.app/](https://kenora-workshop-registration-service-9h52n0mkd.vercel.app/)
> ### Test Accounts — Password for all: `pw123`
> | Role | Username |
> |------|----------|
> | **Admin** | `admin` |
> | **Manager** | `manager` |
> | **Staff** | `staff` |

---


A full-stack, internal staff-facing web application for managing community training centre workshops and attendee registrations. Built with Next.js, Tailwind CSS, and Neon Serverless PostgreSQL.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL Database

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure you have PostgreSQL installed on your local machine.
   Create a new database named `workshop-db` with the username `postgres` and password `postgres`.

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workshop-db"
   SESSION_SECRET="your-very-secure-random-32-char-secret-key"
   ```
   *(Alternatively, if using Neon Serverless Postgres, simply run `npx neon login` and `npx neon link` to inject the database URL automatically).*

4. **Database Setup & Seeding**
   Initialize the database schema and seed mock data:
   ```bash
   npm run db:setup
   ```

5. **Run the Development Server**
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