# Data Flow Diagrams

## Level 0 — Context
```mermaid
flowchart LR
 Student[Student] -->|Applications and reports| P((InternSphere))
 Company[Company] -->|Opportunities and decisions| P
 Mentor[Mentor] -->|Feedback and evaluation| P
 Admin[Admin and coordinator] -->|Approvals and allocations| P
 P -->|Statuses and notifications| Student
 P -->|Applicants and analytics| Company
 P -->|Reports and progress| Mentor
 P -->|Institution metrics| Admin
```

## Level 1 — Application lifecycle
```mermaid
flowchart TD
 A[Student applies] --> V[Validate role, deadline, duplicate]
 V -->|Valid| D[(Applications)]
 V -->|Invalid| E[4xx error]
 D --> R[Company reviews]
 R --> U[Update status and history]
 U --> D
 U --> N[(Notifications)]
 D --> Q[Student dashboard query]
```

The diagrams represent logical flows. The current system uses REST requests and database reads; it does not implement WebSockets.
