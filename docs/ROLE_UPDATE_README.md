# InternSphere — three-role modification notes

This archive is a modification of the supplied Phase 8 project, not a rebuilt project. Existing `.env` files and MongoDB data were not included or changed.

## Before running

1. **Back up your MongoDB Atlas database** before using the modified application. Do not run destructive migrations.
2. Extract this ZIP to a new folder. Copy your existing `server/.env` into the new `server/` directory; never upload `.env` publicly. Check `MONGODB_URI`, JWT secrets and `CLIENT_URL`.
3. Run `npm install` at the root (internet needed for first installation).
4. Run `npm run seed:opportunities` once. This is a **development-only** idempotent upsert script, creates 20 fictional demo listings and company metadata, and does not overwrite existing opportunities. It refuses to run with `NODE_ENV=production`.
5. Run `npm run dev` and open the URL printed by Vite. Keep the Express backend running.

## Roles and historical data

Only Student, Mentor and Admin are allowed to log in or refresh sessions. Existing Company and Coordinator accounts are retained in MongoDB for historical reference; they are not deleted or converted. New Company registration is removed. Company records remain as internship metadata, and historical company evaluations remain valid. Admin can submit the institution evaluation for new completions.

## New endpoints

- `GET /api/v1/reporting/mentor` — current mentor's assigned students and report/evaluation aggregates.
- `GET /api/v1/reporting/admin` — institution-level counts, trends, allocations and workload.
- `GET /api/v1/allocations-admin/overview` — students, mentors, selected applications and allocations.
- `PATCH /api/v1/allocations-admin/:id/clear` — soft-deactivate an allocation without deleting reports/evaluations.
- `GET /api/v1/internships` — now supports `search`, `category`, `location`, `mode`, `minStipend`, `page`, `limit`.

## Notes and known limitations

- The original database did not store an objective percentage-complete field for each student. The mentor dashboard displays `—` for average progress rather than inventing a metric. Weekly approved/submitted counts are available instead.
- The database does not have a `not_started` allocation state. Completion charts use existing allocation states (active/completed/discontinued/reassigned) rather than fabricate that state.
- Admin internship creation uses an existing approved Company metadata record; it does not require a Company account. Admin editing/publishing is available through the existing API, while the new Admin form currently covers creation.
- The existing database and Atlas connectivity cannot be accessed from this build environment. Node server syntax checks and ten existing Node tests pass; **MongoDB integration, Vite build, and browser E2E tests were not run** because dependencies were unavailable offline.
- Legacy role-specific backend helper code and unused historical data models remain in source where removal could affect historical references. They are not exposed as active roles.
- There is no automatic database migration or deletion. Existing user accounts, applications, reports, allocations, and certificates are not reset.

## Manual acceptance checklist

1. Test all three role logins and mismatched role selection.
2. Verify legacy role login and refresh fail.
3. Run the opportunity seed twice and check that the second run inserts zero new records.
4. Test server-side search, category, mode, stipend, location and pagination.
5. Test new student application and admin progression from applied -> under_review -> shortlisted -> selected.
6. Test mentor allocation, reassignment and soft clear; confirm old weekly reports remain intact.
7. Test mentor weekly report approval, mentor and admin evaluations, completion and certificates.
8. Confirm reporting KPIs against MongoDB records and check chart empty states.
9. Confirm student and mentor cannot access admin allocation/report endpoints.
10. Test responsive navigation on mobile and desktop.
