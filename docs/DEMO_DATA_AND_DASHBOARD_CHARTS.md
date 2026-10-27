# Development demonstration dataset & overview charts

This update **does not replace your existing internship, students, mentors, mentor allocations, reports, or evaluations**. It adds a repeatable development-only seed that creates 30 fictional students, 11 fictional mentors, 30 application records, up to 18 assigned internships, weekly reports and some mentor assessments. The original Dr Meera Shah / Ananya Rao relationship is preserved. If you already have your original mentor, this produces **12 mentors**; if you already have the two original students, this produces **32 students**.

## Why the 'selected application' dropdown was empty

The dropdown deliberately excludes applications with an active mentor allocation. Ananya is already assigned. Rohan is currently unassigned but lacks a selected application. The additional demo data creates selected applications for some unassigned students, so you can demonstrate allocation without changing Ananya's records. The counts of assigned/unassigned students represent ALL student accounts, not necessarily all allocation-eligible students.

## Instructions — local development only

1. BACK UP your Atlas database before adding test records.
2. Confirm the *new project* `server/.env` includes `NODE_ENV=development`, `MONGODB_URI` and a unique `SEED_DEMO_PASSWORD` of 10+ characters. Do not share secrets.
3. Ensure network/DNS configuration works. If you require a Google DNS resolver workaround, apply it to `server/src/config/db.js` **only on your development machine**, not as an unconditional production change.
4. From root: `npm install`, `npm run seed:opportunities`, `npm run seed:demo-reporting`, `npm run dev`.
5. Log in as `admin@internsphere.demo`, open Allocations and Reports. Students with selected applications but without allocations will now be available in the assignment dropdown.
6. Log in as `mentor@internsphere.demo`. The original Dr Meera Shah account will still see Ananya's reports. The 11 new demo mentors have additional demo allocations; log in to them using `demo.faculty01@internsphere.demo` and the SEED_DEMO_PASSWORD to see their datasets.

The new generated accounts use emails such as `demo.student01@internsphere.demo` and `demo.faculty01@internsphere.demo`, all with the local demo seed password. Only use these for development.

The seed uses `$setOnInsert` for **add-only/idempotent** behavior: repeated runs do not update or reset existing records. It refuses to run unless NODE_ENV explicitly equals `development`. Existing evaluation data is never modified; newly added scores and chart points are **synthetic test examples**, not real student performance. To avoid misleading presentation, disclose in your college demonstration that these are seeded demonstration records.

The Mentor and Admin Overview dashboards now show compact Recharts previews using the same authenticated `/api/v1/reporting/mentor` and `/api/v1/reporting/admin` endpoints already powering their dedicated Reports pages. There are no hardcoded chart metric series. Empty charts display explanatory messages.

## Known limits

- The `Average Student Progress` KPI remains unavailable because there is no trusted percentage completion field in the current schema.
- Completion status remains based on actual allocation statuses, so the demo seed does not force completed internships or issue certificates.
- Adding demo data to your current Atlas database is an intentional write. Make a backup and do not run this against a production or institution live database.
- No live Atlas integration was available to validate the newly seeded records. Test the commands locally.
