# InternSphere Phase 3 API

Base URL: `http://localhost:5000/api/v1`. All responses except CSV exports use `{success,message,data}`; errors use `{success:false,message,error:{code,details}}`.

| Method | Endpoint | Access |
|---|---|---|
| POST | /auth/register/student | Public |
| POST | /auth/register/company | Public |
| POST | /auth/login | Public |
| POST | /auth/refresh | Refresh cookie |
| POST | /auth/logout | Refresh cookie |
| GET | /auth/me | Authenticated |
| POST | /auth/forgot-password | Public |
| POST | /auth/reset-password | Reset token |
| GET/PATCH | /users/me | Authenticated |
| GET | /students | Admin/coordinator/assigned mentor |
| GET | /students/:id | Owner or authorized staff |
| GET | /companies | Public, approved only |
| GET | /companies/:id | Public, approved only |
| GET | /companies/pending/all | Admin |
| PATCH | /companies/:id/approval | Admin |
| GET | /internships | Public, open only |
| GET | /internships/:id | Public, open only |
| POST/PATCH/DELETE | /internships[/:id] | Company owner or admin |
| POST | /applications | Student |
| GET | /applications | Role-scoped |
| PATCH | /applications/:id/status | Student withdraw or authorized staff |
| POST/PATCH | /mentor-allocations[/:id] | Admin/coordinator |
| GET | /mentor-allocations | Role-scoped |
| POST/GET | /weekly-reports | Student submit, authorized reads |
| PATCH | /weekly-reports/:id/review | Assigned mentor |
| POST/GET | /evaluations | Mentor/company submit, authorized reads |
| GET | /notifications | Recipient |
| PATCH | /notifications/:id/read | Recipient |
| POST/GET/PATCH | /meetings[/:id] | Authorized users |
| POST | /documents | Authenticated, multipart `file` |
| GET | /documents/:id/download | Owner or authorized reviewer |
| GET | /analytics/:role/overview | Matching role |
| GET | /reports/:reportType | Admin/coordinator |

Supported CSV report types: applications, companies, mentor-workload. Unsupported planned endpoints (certificates, evaluation-config administration, drives) are intentionally not advertised as implemented.

### Application request
`POST /applications` with `{"internshipId":"<mongo-object-id>"}`. Student ID is from JWT. Unique compound database index rejects duplicates.

### Status transition request
`PATCH /applications/:id/status` with `{"status":"under_review"}`. Allowed: applied -> under_review/rejected/withdrawn; under_review -> shortlisted/rejected/withdrawn; shortlisted -> selected/rejected/withdrawn. Terminal: selected, rejected, withdrawn.

### Weekly report request
`POST /weekly-reports` with `allocationId`, numeric `weekNumber`, `tasksCompleted`, `skillsLearned`, `challenges`, numeric `hoursWorked`, `nextGoals` and `documentIds` array.

### Evaluation request
`POST /evaluations` with `allocationId`, and scores for `technical`, `communication`, `problemSolving`, `attendance`, `professionalism`, `taskCompletion`, `overall`, each between 0 and 10. Backend computes criterion-weighted percent.
