# InternSphere — Viva Questions and Answers

1. **What problem does InternSphere solve?** It centralizes internship opportunities, applications, mentor allocation, weekly reporting and evaluations.
2. **Why MERN?** React supports reusable interfaces; Express provides APIs; MongoDB stores document records; Node runs the backend in JavaScript.
3. **What is REST?** A resource-oriented HTTP interface using methods such as GET, POST, PATCH and DELETE.
4. **Why Mongoose?** It provides schema validation, model relationships, indexes and query APIs for MongoDB.
5. **What is JWT?** A signed token used to authenticate API requests; signature verification does not replace authorization.
6. **What is RBAC?** Role-based access control, supplemented with ownership and institution checks for individual records.
7. **Why hash passwords?** Password hashes reduce exposure if the database is compromised; bcrypt uses salted, computationally expensive hashing.
8. **How is duplicate application prevented?** A unique student/internship index and backend validation.
9. **How are status transitions controlled?** The backend validates each requested next status against a transition map.
10. **Why separate Application from Internship?** Many students can apply to one internship, each with an independent status and history.
11. **How is mentor allocation represented?** A record connects student, mentor and internship, preserving allocation history.
12. **What is the difference between authentication and authorization?** Authentication verifies identity; authorization determines which resources and actions are permitted.
13. **What is CORS?** A browser mechanism governing cross-origin access; it is not a replacement for authentication.
14. **Why use refresh tokens?** To allow short-lived access tokens without requiring repeated logins; refresh sessions must be revocable.
15. **Why use indexes?** They accelerate frequent queries and enforce uniqueness where required.
16. **How is evaluation calculated?** Weighted criterion scores are combined on the backend according to configured rules.
17. **What happens when a mentor requests revisions?** The student updates the existing week report and resubmits it.
18. **Why use TanStack Query?** It manages remote-data caching, loading states, retries and refetching.
19. **How do you protect documents?** Authenticate, authorize ownership, validate uploads and use protected download mechanisms; full verification is pending.
20. **What testing is still needed?** Real database integration, browser E2E, cross-tenant authorization, uploads, emails and deployment smoke tests.
21. **What is the biggest security risk?** Unauthorized cross-user or cross-institution data access through API endpoints.
22. **What is a deployment environment variable?** Configuration supplied outside source code, including database URIs and secrets.
23. **Why Vercel and Render?** They provide straightforward static frontend and Node backend hosting respectively.
24. **What is the current project status?** Major source workflows exist, but a production build and end-to-end database verification are not yet confirmed.
25. **What would you improve first?** Complete integration tests and multi-tenant authorization hardening before deploying real student data.
