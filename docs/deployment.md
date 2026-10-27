# Deployment Guide — Vercel + Render + MongoDB Atlas

> **Deployment gate:** This is a deployment recipe, not evidence of successful production deployment. Do not onboard real student data until frontend build, browser tests, tenancy review, document authorization, and security checks pass.

## Prerequisites
- GitHub repository with `client/`, `server/`, `package.json`, `render.yaml`, `vercel.json`.
- Node 24 LTS (or a compatible version accepted by all installed packages), MongoDB Atlas account, Render account, Vercel account.
- Unique random JWT secrets of at least 32 characters each; keep them out of Git.

## MongoDB Atlas
1. Create a project and a cluster. Create a database user with a strong password and the minimum database permissions needed.
2. In Network Access, allow only the necessary source networks where practical. A temporary `0.0.0.0/0` rule is **not** a recommended final security posture; Render outbound IP restrictions depend on the plan/network setup.
3. Copy the `mongodb+srv://...` connection URI, URL-encode special password characters, and store it as Render `MONGODB_URI`.
4. Use TLS, enable backups and monitoring according to your Atlas tier. Seed **development databases only**.

## Render backend
1. Create a Blueprint using root `render.yaml`, or manually create a Node web service with **Root Directory** `server`, **Build Command** `npm install --omit=dev`, **Start Command** `npm start`.
2. Configure `NODE_ENV=production`, `MONGODB_URI`, `CLIENT_URL=https://YOUR-VERCEL-DOMAIN`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and Cloudinary/SMTP settings if used.
3. Deploy; check `GET https://YOUR-RENDER-DOMAIN/health` and application logs.
4. Render terminates HTTPS at its edge. Check `Secure`, `SameSite`, CORS, and reverse-proxy cookie behavior for the final domains. Cross-site cookies generally require `SameSite=None; Secure` and can be restricted by browsers; same-site custom domains are preferable.
5. Rate limits and in-memory counters may not be shared across multiple instances; use a shared store for scale.

## Vercel frontend
1. Import the GitHub repository and select **Root Directory** `client`.
2. Framework preset: Vite; Install Command: `npm install`; Build Command: `npm run build`; Output Directory: `dist`.
3. Set `VITE_API_BASE_URL=https://YOUR-RENDER-DOMAIN/api/v1`. This value is public, not a secret.
4. SPA navigation requires the fallback rewrite in `client/vercel.json` (included in this package). Redeploy after changes.
5. Open login, refresh, logout and protected pages; inspect browser Network/Console for CORS or cookie errors.

## Final smoke checks
- Health endpoint; login/refresh/logout; student registration; company approval; internship listing; application; mentor allocation; report revision; evaluation; certificate; role-based forbidden access; file upload/download; email delivery.
- Verify requests from disallowed origins are rejected and private records cannot be fetched by swapping IDs.
- If cookies fail: verify `CLIENT_URL` exactly matches frontend origin, API uses HTTPS, credentials are enabled, cookie attributes are correct, and the browser's third-party-cookie policy.
- If Atlas fails: inspect network allowlist, username/password encoding, database permissions and DNS.
- If Render fails: inspect Node version, install/build logs and missing environment variables.
- If Vercel returns 404 on deep links: verify SPA rewrite and output directory.
