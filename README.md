# InternSphere — Smart Internship Lifecycle Management System

A MERN internship lifecycle application with five role-specific workspaces. This repository contains the Phase 7 application source plus Phase 8 deployment configurations and academic documentation.

> **Status:** Candidate project, not production certified. Phase 7 backend unit tests passed; frontend build, real MongoDB workflows, and external services are not yet fully verified. See `docs/testing-evidence.md`.

## Requirements
- Node.js 24 LTS recommended, npm, MongoDB local or Atlas.
- Optional Cloudinary and SMTP credentials for external features.

## Local setup
```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
# Set MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SEED_DEMO_PASSWORD in server/.env
# Ensure MongoDB is running before seeding
npm run seed
npm run dev
```

On Windows PowerShell use `Copy-Item server/.env.example server/.env` and `Copy-Item client/.env.example client/.env` instead of `cp`.

Frontend: http://localhost:5173 · Backend: http://localhost:5000 · Health: http://localhost:5000/health

## Commands
```bash
npm test
npm run build
npm run dev
npm run seed
```

`npm run seed` is development-only. Never run it against a production database. Seed credentials are configured by `SEED_DEMO_PASSWORD` and must not be committed.

## Environment
- `client/.env`: `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
- `server/.env`: `NODE_ENV`, `PORT`, `MONGODB_URI`, `CLIENT_URL`, two distinct 32+ character JWT secrets; optional Cloudinary and SMTP values.
- Never put JWT secrets or database credentials in `VITE_` variables.

## Deployment
See `docs/deployment.md` for Vercel frontend, Render backend and MongoDB Atlas instructions. Files `client/vercel.json` and `render.yaml` are included.

## Documentation
- `docs/project-report.md`: academic report draft and objectives
- `docs/architecture.md`: system architecture
- `docs/database-design.md`: ER diagram
- `docs/use-cases.md`: role use cases
- `docs/data-flow-diagram.md`: DFD levels 0 and 1
- `docs/api-reference.md`: implemented API reference
- `docs/testing-evidence.md`: verification and outstanding tests
- `docs/viva-questions.md`: viva Q&A
- `docs/deployment.md`: production deployment guide

## Security limitations
Multi-institution isolation is not completely audited; Cloudinary document authorization, production cookie behavior, email delivery, and live database workflows require end-to-end verification. Do not store real institutional data before these gates are passed.
