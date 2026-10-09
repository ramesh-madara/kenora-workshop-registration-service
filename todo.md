# Workshop Registration Service - Pending Features

Based on `req.md` and `ui.md`, the following items are missing or incomplete and need to be built/fixed:

1. **Dashboard Filter Controls**: Wire up the existing `FilterBar.tsx` into `src/app/page.tsx` so staff can filter workshops by Date range, Status, Availability, and Location.
2. **Registration Component on Dashboard**: Move the high-speed "Attendee Registration Component" directly into the Dashboard (`/`) as a Modal or Accordion (currently isolated in `/workshops/[id]`).
3. **Brand Aesthetics (Theming)**: Replace default Tailwind colors with the specific hex codes requested in `ui.md` (e.g., Background `#E8C5A5`, Primary `#794022`, Dark Mode `#040202`).
4. **Database Seeding**: Create a seeder to inject an admin, manager, and staff user for evaluation purposes automatically on DB migrate.
5. **Update Login Helpers**: Display quick-reference credentials for all three roles on the `/login` screen.
