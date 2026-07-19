# Backend Audit Report

## Current Architecture

- Next.js App Router backend with API routes under `app/api/*`.
- Direct MySQL access through `lib/mysql-client.js` and `lib/customer-auth-service.js`.
- Prisma-backed admin/RBAC services in `lib/admin/services/*` and `prisma/schema.prisma`.
- File-backed fallback state for catalog and RFQ data in `data/*.json` and `data/*.csv`.
- MongoDB variables exist in `.env`, but there is no runtime MongoDB usage in the codebase.

## Critical Issues

1. **Admin auth cookie mismatch**
   - `middleware.js:17-29` and `lib/auth-service.js:94-96` read `authToken`.
   - `app/api/admin/auth/verify-otp/route.js:43-56` sets `accessToken` instead.
   - `app/api/auth/customer-login/route.js:41-43` sets `auth_token` instead.
   - Risk: admin sessions can fail middleware checks or become inconsistent across routes.

2. **Hardcoded credentials and demo login paths**
   - `lib/admin/services/auth.service.js:72-109` accepts hardcoded emails/passwords.
   - `lib/admin/services/auth.service.js:144-169` can create demo users on the fly.
   - `lib/admin/modules/rbac/seeds/seed.js:101-165` seeds and prints a default password.
   - Risk: production authentication can be bypassed or leaked.

3. **OTP secrets are logged and stored in memory**
   - `lib/admin/services/auth.service.js:11-13, 21-55` uses in-memory OTP/session maps.
   - `lib/admin/services/auth.service.js:78, 109` logs OTPs to console.
   - Risk: OTPs are exposed in logs, lost on restart, and not centrally invalidated.

4. **Unauthenticated public upload endpoint**
   - `app/api/uploads/route.js:19-104`
   - Risk: any client can upload files into `public/uploads/*`, including SVG and document types, with no auth or CSRF barrier.

5. **Committed secrets in `.env`**
   - `.env:1-17`
   - Risk: live DB credentials, SMTP credentials, and JWT secrets are stored in the repository workspace.

6. **JWT refresh design is weak**
   - `lib/jwt.js:11-21` signs both access and refresh tokens with the same secret.
   - `app/api/auth/refresh/route.js:11-16` reissues cookies from any valid refresh token without rotation.
   - Risk: refresh-token replay/reuse is not controlled and token type is not enforced.

7. **Customer OTP generation and reset flow are weak**
   - `lib/customer-auth-service.js:15-17` uses `Math.random()` for OTPs.
   - `lib/customer-auth-service.js:98-125` stores plaintext OTPs in MySQL.
   - `lib/customer-auth-service.js:134-160` and `:223-250` have no resend cooldown or attempt throttling.
   - `lib/customer-auth-service.js:254-287` resets password after OTP match, but still with no explicit lockout / replay defense.
   - Risk: OTP brute force and replay are easier than they should be.

8. **Product API is mock-backed**
   - `app/api/admin/products/route.js:6-169`
   - Risk: CRUD operations mutate `mockProducts` in memory only, so product changes do not persist or sync with the database.

9. **Catalog generation is not a single source of truth**
   - `app/api/admin/catalog/route.js:2-92`
   - `lib/catalog-service.js:512-529`
   - Risk: catalog data can come from `data/catalog.json` or MySQL depending on file presence, so admin updates may not propagate predictably.

10. **RFQ persistence is duplicated across storage layers**
    - `app/api/rfqs/route.js:35-138`
    - `app/api/[[...path]]/route.js:127-217`
    - Risk: RFQs are written to MySQL, Prisma, and local JSON/CSV files via different code paths, which can diverge or partially fail.

## High Risk Findings

- `lib/mysql-client.js:5-42, 544-558, 589, 647, 802` performs schema creation and foreign-key setup during pool initialization. This makes startup expensive and mixes migrations with runtime traffic.
- `app/api/auth/forgot-password/route.js:1-31` reveals whether a customer exists by returning `Customer not found`.
- `next.config.js:27-31` sets `X-Frame-Options: ALLOWALL` and a permissive framing policy. That is broader than typical production hardening.
- `lib/auth-service.js:137-159` logs login/logout metadata but does not record a durable session store or token revocation list.

## Medium Risk Findings

- `lib/auth-service.js:7-8` caches user lookups in memory without invalidation on updates.
- `app/api/admin/customers/route.js:1-121` and similar admin routes rely on `verifyAdmin()` but do not consistently use the same auth cookie as the admin OTP login flow.
- `app/api/admin/stats/route.js:1-28` derives counts from multiple services, which is okay, but the underlying services mix Prisma and MySQL models.
- `lib/admin/modules/super-admin/services/admin.service.js:1-182` uses Prisma admin tables that are separate from the MySQL auth tables.

## Security Review

### SQL Injection

- Positive: most direct MySQL queries use parameter binding.
- Concern: runtime DDL and mixed string-based route logic increase operational risk even if they do not create classic SQL injection.

### XSS

- `app/api/uploads/route.js` allows SVG uploads into a public directory.
- Email templates in `lib/email-service.js` interpolate values directly into HTML; those inputs should be sanitized before rendering.

### CSRF

- Cookie-based routes use `sameSite: 'lax'`, but there is no dedicated CSRF token layer.
- Sensitive state-changing routes should not rely on cookie mode alone.

### Rate Limiting

- No centralized rate limiter is visible for login, OTP verification, resend, password reset, or upload endpoints.

### Secrets

- `.env` is committed with real secrets.
- Hardcoded fallback credentials exist in admin auth and seed scripts.

### File Upload Security

- No content sniffing, malware scanning, or image validation beyond MIME/extension checks.

## Performance Review

- `getMysqlPool()` does schema work on first use, which slows cold starts.
- `app/api/admin/products/route.js` uses in-memory data, so reads are fast but not durable.
- Several admin routes compute stats via full list fetches instead of lean count queries.
- Mixed MySQL/Prisma/file access increases latency variance and makes caching harder.

## Error Handling Review

- There is no single backend-wide error handler.
- Most routes catch errors locally and return generic JSON responses.
- `lib/admin/services/auth.service.js:234-263` references `employeeDatabase`, which is undefined, so that forgot-password branch is incomplete.

## Missing Features

- Durable admin session store and token revocation.
- Centralized rate limiting.
- CSRF tokens for cookie-authenticated write routes.
- Unified schema migrations.
- Unified product/catalog source of truth.
- Secure file processing pipeline for uploads.
- Production logging and alerting integration.

## Recommended Fixes

1. Unify admin auth around one cookie name and one token shape.
2. Remove hardcoded credentials and all demo login branches.
3. Replace in-memory OTP/session maps with Redis or database-backed records.
4. Add OTP attempt counters, resend cooldowns, and explicit expiry enforcement in the database.
5. Move all schema changes to migrations.
6. Replace mock product storage with database-backed CRUD.
7. Remove public unauthenticated uploads or put them behind admin auth plus file type verification.
8. Remove secrets from the repository and rotate affected credentials.
9. Split refresh and access JWT secrets, add token type claims, and rotate refresh tokens.
10. Align Prisma and MySQL models or retire one of the stacks.

## Production Readiness Score

- **41/100**

The build is now healthy, but the backend still has critical auth, secret-management, and source-of-truth problems that should be fixed before production deployment.

