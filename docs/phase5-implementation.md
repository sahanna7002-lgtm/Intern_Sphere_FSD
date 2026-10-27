# Phase 5: Core pages and role dashboards

Implemented React pages for five role-aware dashboards, applications, student directory, company approvals, company internship creation/editing/archival, mentor allocation/reassignment, weekly submission/review, evaluation, notifications, real application charts and CSV downloads.

## Backend API additions

- `GET /api/v1/internships/manage/mine` — company-owned internships or admin overview (authenticated company/admin).
- `GET /api/v1/users/mentors` — active faculty choices (admin/coordinator).
- `GET /api/v1/analytics/:role/trends` — role-scoped monthly application counts and status breakdown.
- `GET /api/v1/evaluations/config/current` — effective evaluation weights.

## Known limitations

- All lists and charts require a running seeded MongoDB; no synthetic metrics.
- Student document uploads, certificates, internship drives, full configuration management, meeting UI and complete institution-scoping hardening are not finished.
- Historical mentor assignments and selected engagements require additional business checks and transaction tests.
- The Phase 3 backend still requires comprehensive role and document authorization testing before public deployment.

## Verification

Run `npm install`, configure `.env` files, start MongoDB, `npm run seed`, `npm run dev`, `npm run build`, `npm test`. In separate role sessions: company posts internship; student applies; company advances status; admin assigns mentor; student posts report; mentor reviews; company/mentor evaluate; admin exports CSV; chart reflects status changes.
