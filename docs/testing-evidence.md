# Testing Evidence and Outstanding Verification

## Evidence carried from Phase 7
The previous phase reported: 10/10 backend Node tests passed; backend JS syntax checks passed; npm dependency installation timed out, so frontend build, frontend Vitest and live MongoDB end-to-end tests were **not executed**. See `phase7-test-report.md` for details. Source-level assertions are not HTTP authorization tests.

## Phase 8 verification
See `phase8-verification.txt` for exact commands, outcomes, and environment limitations. Static config validation is not proof of successful deployment.

## Required manual acceptance matrix
| Actor | Positive case | Negative case |
|---|---|---|
| Student | Register, apply, submit/resubmit report | Cannot view another student's report |
| Company | Publish, shortlist, evaluate own intern | Cannot edit another company's internship |
| Mentor | Review assigned student's report | Cannot approve unrelated report |
| Admin | Approve company, allocate mentor | Cannot manage another institution |
| Coordinator | View permitted applications/analytics | Cannot bypass institution boundary |
| All roles | Refresh session and logout | Expired/revoked session rejected |

Use a disposable database, multiple users and two institutions for negative authorization tests. Record screenshots, HTTP status codes and database outcomes before claiming acceptance.
