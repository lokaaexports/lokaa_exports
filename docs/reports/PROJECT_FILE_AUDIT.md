# Lokaa Exports - Project File Audit Report

| Filename | Issue | Severity | Fix Applied |
|---|---|---|---|
| `components/admin/layout/AdminLayout.tsx` | Stray `// @ts-expect-error` comments inside JSX render blocks caused literal text leakage on UI | HIGH | Removed raw comments leaking into rendered text nodes |
| `lib/email-service.ts` | OTP & Password Reset emails queued to DB table were not sent automatically without background worker daemon | CRITICAL | Added automatic non-blocking call to `processEmailQueue()` inside `queueEmail` |
| `app/api/admin/auth/logout/route.ts` | Logout API only deleted `adminToken` & `adminRefreshToken`, ignoring active `authToken` & `refreshToken` cookies | HIGH | Added cookie deletion for all auth cookie keys (`authToken`, `refreshToken`, `adminToken`, `adminRefreshToken`) |
| `lib/admin/services/auth.service.ts` | Role comparison mismatch for `Super Admin` vs `super_admin` in DB health queries | MEDIUM | Updated role lookups to check against both role slug and role name variants |
| `playwright.config.ts` | Parallel Playwright worker connections overloaded Hostinger Remote DB connection limits | HIGH | Forced single worker mode (`workers: 1`, `fullyParallel: false`) |
| `tests/live-qa/images.spec.js` | Queried stale `/category/organics` route instead of seeded `/category/agriculture-food` | MEDIUM | Updated path to dynamic seeded category route |
| `tests/live-qa/homepage.spec.js` | Aborted Next.js RSC prefetch requests triggered false failure in request listener | MEDIUM | Filtered out aborted `_rsc` prefetch events |
