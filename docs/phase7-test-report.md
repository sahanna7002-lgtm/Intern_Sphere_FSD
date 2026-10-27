# Phase 7 testing and debugging report

## Changes made

- Added `PATCH /api/v1/weekly-reports/:id/resubmit` for a student to revise a mentor-returned report without violating the unique (allocation, week) index. Checks owner, active allocation, revision state, and document ownership. The frontend shows a resubmission form on reports marked `revision_requested`.
- Added institution ownership checks to administrator/coordinator reads and sensitive mutations, plus scoped analytics, application reports, company reports, and mentor selection.
- Persisted `institutionId` on new mentor allocations. Existing database records must be migrated/backfilled before multi-institution deployment; see warning below.
- Added regression tests for the new route and security guard presence.

## Execution and limitations

- `find server/src -name '*.js' -exec node --check {} \;`: passed.
- `npm run test -w server`: passed 10/10 (six existing unit tests plus four source-level regression assertions).
- `npm install --no-audit --no-fund --prefer-offline`: timed out in this environment. Consequently, frontend Vite build and Vitest tests were not executed; no claim of successful browser or MongoDB integration is made.
- Source-level regression tests assert guard presence, **not** HTTP authorization outcomes. Live DB integration and malicious-user access tests are still required.

## Important unresolved risks

1. **Existing data migration:** Phase 6 mentor allocations lack `institutionId`. Backfill this field from the internship/student institution before using a multi-institution database. The Phase 7 seed creates single-institution (`null`) demo data.
2. **Incomplete institution isolation:** Some inherited company management, document authorization, and other paths still require a systematic multi-tenant threat review. Do not deploy for multiple real institutions yet.
3. **Concurrency:** Completion and allocation workflows are not fully transaction-safe under simultaneous requests.
4. **Uploads:** Cloudinary authenticated delivery, MIME content verification, and file lifecycle require end-to-end security testing.
5. **Certificates:** Printable HTML certificates are not digitally signed and should not be treated as verifiable credentials.
6. **Deployment:** Production environment variables, CORS/cookie behavior, email, and cloud storage are unverified.
7. **Frontend:** Actual dependency installation, production build, accessibility audits, and browser E2E tests are pending.

## Local verification

1. Install Node 22+ and MongoDB or provision Atlas.
2. From project root: `npm install`.
3. Copy `server/.env.example` to `server/.env`, set secure secrets, MongoDB URI, and `SEED_DEMO_PASSWORD`. Copy `client/.env.example` to `client/.env`.
4. Start MongoDB, run `npm run seed`, `npm run dev`.
5. Run `npm test` and `npm run build`.
6. Log in as student, submit a weekly report; log in as mentor and request revision; log back in as student, resubmit the report, and verify mentor can approve it. Confirm the original week record is updated, not duplicated.
7. Verify student A cannot resubmit student B's report, a mentor cannot review another mentor's reports, and a company cannot view other companies' private data.
8. For true multi-institution verification, create two institutions and users, companies, internships, applications, and allocations in each, and attempt cross-tenant reads/writes on **every** endpoint. This has not been done here.
