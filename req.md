## 1. Business Context & Workflow

* **Environment:** A community training centre with three physical locations and approximately 15 non-technical staff members.


* **Workflow:** Staff process all workshop registrations manually via phone calls and walk-ins. There is no public-facing signup interface.


* **Core Problem:** The current shared spreadsheet system causes accidental overbooking during simultaneous registrations and loses historical data when attendees cancel.



## 2. User Roles & Access Control

The system utilizes three distinct roles. **Crucially, all permissions must be strictly enforced on the backend API, not just hidden in the frontend interface**. The first Admin account must be seeded, as Admins create all subsequent accounts.

| Action | Admin | Manager | Staff |
| --- | --- | --- | --- |
| **Create user accounts & set roles** | Yes

 | No

 | No

 |
| **Add & edit workshops** | No

 | Yes

 | No

 |
| **Register & cancel attendees** | No

 | Yes

 | Yes

 |
| **View workshops, registrations & history** | No

 | Yes

 | Yes

 |

## 3. Workshop Data Model

Each workshop record must track the following fields:

* **Workshop Code**

* **Title**

* **Instructor**

* **Date & Time**

* **Capacity** (Maximum number of seats)


* **Current Status**

* **Location** *(Added based on operational requirements to distinguish between the three centres)*


## 4. Registration Rules & Concurrency

* **Attendee Data:** Attendees do not have user accounts. Staff input a simple Name and Email Address for each registration.


* **Strict Capacity Enforcement:** A workshop must never hold more active registrations than its capacity. The backend must successfully handle concurrent requests (race conditions) to prevent overbooking when multiple staff attempt to register attendees for the final seat simultaneously.


* **Cancellations & Immutable History:** When an attendee cancels, their seat becomes available again, but their registration record is never deleted.


* **Auditability:** The system must display the full history of every registration and cancellation, explicitly showing which staff member made the change and at what time.



## 5. Search & Filtering Interface

Staff must be able to quickly locate workshops without excessive scrolling. The frontend must include filters for:

* Date range


* Current status


* Seats currently available



## 6. Technical Constraints & Deliverables

* **Scope & Time:** Full-stack connected application (frontend + backend API) built within a 3-hour limit.


* **Code Submission:** GitHub repository (preferred) or zipped files.


* **Deployment (Optional):** Free hosting is acceptable if deploying.


* **Documentation Required:**
* **README / Setup:** Clear local setup instructions, dev-only credentials for the seeded Admin, and a database seeding script/mechanism for sample workshops.


* **1-Page Write-up:** Must detail stack choices, design decisions, trade-offs, assumptions, explicit explanation of how over-registration (race conditions) is prevented, and a list of skipped features.





## 7. Development Priorities

If time is running short, prioritize features in this exact order:

1. Backend access control enforcement.


2. Strict capacity rule handling and registration history tracking.


3. End-to-end connected frontend.


4. Workshop search and filtering.


5. Remaining features.



## 8. Bonus Features (Optional)

* **Audit Trail:** Track changes to workshop details, accounts, and user roles (who did what and when).


* **Waitlist System:** Automatically queue attendees when a workshop is full and offer freed seats sequentially.