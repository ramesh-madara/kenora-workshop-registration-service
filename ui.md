Here is the complete breakdown of every User Interface (screen, view, and modal) required to satisfy all operational rules and role boundaries within your 3-hour build window.

---

### 1. Authentication Screen (`/login`)

*Available to: Unauthenticated visitors*

* **Purpose:** Single entry point for all staff members; redirects to the user's role-permitted view upon sign-in.
* **Key Elements:**
* Clean centered form (`<article>` in Pico.css).
* Email input (`type="email"`).
* Password input (`type="password"`).
* Dev credential quick-reference callout (for easy evaluation).
* Inline validation/error banner for failed logins.



---

### 2. Staff & Manager Workshop Dashboard (`/` or `/workshops`)

*Available to: **Manager**, **Staff** (Blocked for Admin)*

* **Purpose:** Central operational view for processing phone/walk-in queries without excessive scrolling.
* **Key Elements:**
* **Top Navigation Bar:** Logged-in user badge (`email` and `role`), logout button, and "Create Workshop" button (visible **only** to Managers).
* **Search & Filter Control Bar (Horizontal `<fieldset>` or grid):**
* *Date Range:* From Date and To Date pickers (`type="date"`).
* *Status:* Dropdown (`All`, `published`, `draft`, `cancelled`).
* *Availability:* Toggle or dropdown (`All Workshops`, `Has Available Seats Only`).
* *Location:* Dropdown (`All Locations`, `Downtown Campus`, `Westside Workshop`, `North Annex`).


* **Workshop Cards / Table:**
* Workshop code badge, title, instructor, location, and date/time.
* **Live Seat Indicator:** Displays `X remaining of Y total` or a distinct `FULL` badge.
* **Actions:** "Register Attendee" button (disabled or hidden when full) and "View Attendees & History" button.





---

### 3. Attendee Registration Component (Modal or Accordion)

*Available to: **Manager**, **Staff***

* **Purpose:** High-speed intake form for phone calls and walk-ins.
* **Key Elements:**
* Read-only banner showing selected workshop title, code, and remaining seats.
* Inputs:
* `attendee_name` (Text input, required).
* `attendee_email` (Email input, required).


* "Confirm Registration" submit button.
* Real-time feedback alerts:
* *Success:* "Registration confirmed for [Name]."
* *Concurrency/Full Error:* "Booking failed: workshop reached full capacity."





---

### 4. Attendee Roster & Audit History View (Dedicated Page or Drawer)

*Available to: **Manager**, **Staff***

* **Purpose:** Displays active attendees, handles cancellations, and renders the immutable audit log.
* **Key Elements:**
* Workshop metadata header (Title, code, capacity, instructor).
* **Active Attendees Table:**
* Columns: Name, Email, Booked By (Staff Email), Booked Date/Time.
* Action: "Cancel Seat" button per active attendee.


* **Immutable Cancellation & Audit History Table:**
* Chronological timeline of all operations on this workshop.
* Columns: Attendee Name, Action (`registered` vs. `cancelled`), Performed By (`staff@center.org` | `Role`), Timestamp.
* Strikethrough or distinct badge styling for cancelled entries.





---

### 5. Workshop Management Form (`/workshops/new` or `/workshops/[id]/edit`)

*Available to: **Manager ONLY** (403 Forbidden for Staff and Admin)*

* **Purpose:** Setup and maintenance of workshop listings and schedules.
* **Key Elements:**
* `code` (Unique alphanumeric string, e.g., `WS-104`).
* `title` (Text input).
* `instructor` (Text input).
* `schedule_date` (Datetime picker).
* `capacity` (Number input, `min="1"`).
* `location` (Select dropdown: `Downtown Campus`, `Westside Workshop`, `North Annex`).
* `status` (Select dropdown: `published`, `draft`, `cancelled`).
* Submit button ("Save Workshop") and "Cancel" redirect.



---

### 6. Admin User Management View (`/admin/users`)

*Available to: **Admin ONLY** (403 Forbidden for Manager and Staff)*

* **Purpose:** User provisioning. Per Section 2, the Admin does not access workshops or registrations.
* **Key Elements:**
* **Create Account Form:**
* Email address.
* Password field.
* Role selection (`manager` or `staff`).
* "Create Staff Account" button.


* **User Directory Table:**
* Columns: User ID, Email, Role, Created Date.





---

### Summary Layout Architecture for Next.js App Router

```text
src/app/
├── login/
│   └── page.tsx              --> [UI 1] Auth Form
├── (staff-manager)/
│   ├── layout.tsx            --> Role check (Manager & Staff allowed; Admin blocked)
│   ├── page.tsx              --> [UI 2] Dashboard + Filter Bar + [UI 3] Registration Modal
│   ├── workshops/
│   │   ├── new/page.tsx      --> [UI 5] Create Workshop Form (Manager only)
│   │   └── [id]/page.tsx     --> [UI 4] Attendee Roster & Audit Trail
└── admin/
    ├── layout.tsx            --> Role check (Admin allowed only)
    └── page.tsx              --> [UI 6] User Creation & Account Management




    **Light Mode UI**

* Background: `#E8C5A5`

* Surface / Card Background: `#C5B5A6`

* Secondary Surface: `#C5AC94`

* Primary Text: `#040202`

* Secondary / Muted Text: `#591F0B`

* Border / Divider: `#C6A988`


**Dark Mode UI**

* Background: `#040202`

* Surface / Card Background: `#0B0D0C`

* Secondary Surface: `#2C2221`

* Primary Text: `#E8C5A5`

* Secondary / Muted Text: `#C5AC94`

* Border / Divider: `#2D0C05`


**Brand & Interactive Elements**

* Primary Brand / Button: `#794022`

* Primary Button Hover: `#6B372B`

* Secondary Button / Accent: `#DEAC76`

* Accent / Highlight: `#D99937`

* Link / Action Item: `#B57537`

* Active / Focus Ring: `#9D673A`


**System & Feedback Messages**

* Warning / Alert: `#D99937`

* Error / Danger: `#724641`

* Info / Neutral Notice: `#9E7148`

```