# Mentor-confirmed internship applications (targeted workflow update)

## Why a new reviewer field is required
Existing `MentorAllocation` records are created **after** an application is selected. Accordingly, a faculty mentor cannot use an internship allocation to authorize their own preselection decision. Applications now contain an optional `reviewerMentorId` plus assignment audit fields. No database migration, collection reset, or re-seeding is required: Mongoose tolerates the field being absent from historical documents. Existing selected applications remain selected, and existing allocations and weekly reports are left untouched.

## New workflow
1. Student applies from Opportunities; record begins as `applied`.
2. Admin opens **Admin → Applications** and assigns an eligible faculty mentor as the **application reviewer**. This does **not** approve the application or allocate an internship mentor.
3. Assigned reviewer opens **Mentor → Applications** and progresses the existing status flow: `applied → under_review → shortlisted → selected`, or rejects at an allowed stage.
4. Student sees the updated application status in **Student → Applications**.
5. A `selected` application appears in **Admin → Allocations**, where Admin assigns the ongoing internship mentor (which may be the same or a different mentor). Weekly reports and evaluations continue unchanged.

## Security
Only Admin can assign/reassign a reviewer before a final application decision, and only to an active faculty mentor within Admin's institution. Only the assigned mentor within the same institution can advance or reject the application. Students can only withdraw their own non-final application. Status transitions and atomic update checks remain in force. Old company and coordinator access is not restored.

## Endpoints
- `PATCH /api/v1/applications/:id/reviewer` (Admin only): `{ "mentorId": "<mentor user ObjectId>" }`.
- `GET /api/v1/applications` (Mentor): returns applications specifically assigned to that reviewer; Admin sees institution-scoped applications; Student sees their own.
- `PATCH /api/v1/applications/:id/status` (Student withdrawal or assigned Mentor decision only): `{ "status": "under_review | shortlisted | selected | rejected | withdrawn" }`; permitted transition depends on current status.

## Run
Use the existing project environment files. **Do not run any seed scripts just for this change.** After backing up the project, install dependencies from root and start with `npm run dev`. Optionally run `npm test` and `npm run build`. No changes to MongoDB Atlas access configuration are needed.

## Manual verification with a NEW test application
1. Log in as Student; apply to an internship where no application already exists.
2. Confirm its status is `Applied`.
3. Log in as Admin → Applications; choose Dr Meera Shah (or another real seeded mentor) as reviewer.
4. Log in as the chosen Mentor → Applications; move `Applied → Under Review → Shortlisted → Selected` in sequence, confirming persistence at each stage.
5. Check Student → Applications shows `Selected`; Admin → Allocations lists the selected unallocated application.
6. Negative checks: Admin may not advance status; another mentor may not approve; mentor cannot select their own application reviewer; wrong-institution reviewer assignment is rejected; no reviewer may approve an unassigned application.
7. Check existing Ananya Rao weekly report approvals and certificates are unaffected.

## Verification constraints
Static/unit checks do not prove a live Atlas connection, UI rendering, or full browser integration. Those must be verified locally against your database. Historical selected applications need not be assigned a new reviewer retroactively.
