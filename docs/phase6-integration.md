# Phase 6: Integration status and verification

## What changed relative to Phase 5
- Added student certificate page and API (`GET /api/v1/certificates/:allocationId`) with server-computed mentor/company weighted score.
- Added authenticated completion transition (`PATCH /api/v1/mentor-allocations/:id/complete`, admin/coordinator only). Requires submitted mentor and company evaluations, at least one approved weekly report, and no unapproved reports.
- Added mentor/student meeting pages backed by existing `/meetings` endpoints.
- Added new navigation items and routes without renaming Phase 5 paths.
- Restricted company evaluation submissions to allocations for that company's internships.
- Prevented repeated reviews of non-submitted weekly reports.
- Protected exported CSV cells from spreadsheet formula injection.
- Added unit tests for completion eligibility, weighted scores, and CSV escaping.

## Test evidence in this environment
- `node --test server/tests/*.test.js`: **6 passed**, 0 failed.
- `node --check` on all server JavaScript files: **passed**.
- `npm install --offline`: **failed** with `ENOTCACHED` for `concurrently`; package dependencies were not installed.
- A regular `npm install` was attempted but timed out.
- Frontend production build, frontend tests, live MongoDB API tests, Cloudinary, email, and cross-role E2E flows: **not verified**.

## Run locally
1. Use Node.js 22+ and MongoDB 7+ or MongoDB Atlas.
2. From the project root, run `npm install` with npm registry access.
3. Copy `server/.env.example` to `server/.env`; fill in MongoDB URI, JWT secrets, client URL, and demo seed password.
4. Copy `client/.env.example` to `client/.env`; set `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
5. Start MongoDB, run `npm run seed`, then `npm run dev`.
6. Run `npm run build` and `npm test` and resolve any local dependency/runtime errors.

## Recommended manual integration flow
1. Company logs in, creates a published internship; verify student sees it.
2. Student applies; verify company sees the application and cannot access another company's data.
3. Company changes status through review, shortlist, selected; verify student sees changes.
4. Admin allocates mentor; verify student and mentor see the allocation.
5. Student submits weekly report; mentor reviews; verify student sees the review.
6. Mentor and company submit evaluations; verify scores and access restrictions.
7. Admin or coordinator invokes completion endpoint; verify it rejects incomplete records.
8. Student visits `/student/certificates` and prints certificate after successful completion.
9. Mentor schedules a meeting at `/mentor/meetings`; student sees it at `/student/meetings`.
10. Verify notifications, analytics refresh, report CSV escaping, mobile layout, and logout.

## Known limitations requiring future work
- No browser E2E test or MongoDB-backed integration test has been run.
- Multi-institution scoping is not consistently enforced in legacy Phase 3/5 endpoints; do not deploy this for unrelated institutions.
- The certificate is a printable HTML view, not a cryptographically signed certificate or stored PDF.
- Documents are uploaded through the existing Cloudinary endpoint, but Phase 6 does not add a complete document management UI.
- Review revisions currently cannot be resubmitted under the same allocation/week unique index.
- Production-ready atomic multi-record transactions, audit coverage, document authorization review, and password reset email delivery require further work.
- Frontend uses custom reusable UI controls rather than a fully initialized shadcn/ui component library.
- Demo seeding is strictly for development; never run it in production.

## API contracts added
- `PATCH /api/v1/mentor-allocations/:id/complete`: authenticated admin/coordinator, empty JSON body; returns completed allocation or HTTP 409.
- `GET /api/v1/certificates/:allocationId`: authenticated student owner, assigned mentor, admin/coordinator or associated company; returns certificate data if allocation completed, otherwise HTTP 409.
- `GET /api/v1/meetings?allocationId=<id>` and `POST /api/v1/meetings`: pre-existing APIs now have connected UI pages.

## Remaining security consideration
Admin/coordinator operations in the inherited project are not fully scoped by institution. In particular, reports and global analytics may reveal cross-institution records. Production rollout must be blocked until institution ownership is enforced across all reads/writes.
