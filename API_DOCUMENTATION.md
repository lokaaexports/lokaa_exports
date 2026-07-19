# API Documentation

## Auth

| Endpoint | Method | Auth | Request Body | Response | Tables / Stores |
| --- | --- | --- | --- | --- | --- |
| `/api/auth` | `POST` | No | `{ email, password }` or `{ email, password, name, company }` with `?action=login|register` | `ok`, user object, or error | `users` |
| `/api/auth` | `GET` | Cookie auth | none | `{ authenticated, user }` | `users` |
| `/api/auth/register` | `POST` | No | Customer registration payload | Registration result + OTP email trigger | `customers` |
| `/api/auth/customer-login` | `POST` | No | `{ email, password, rememberMe }` | Customer session + `auth_token` cookie | `customers` |
| `/api/auth/verify-email` | `POST` | No | `{ email, otp, action? }` | OTP verification or resend result | `customers` |
| `/api/auth/customer-profile` | `GET/PUT` | Customer cookie | Profile payload for `PUT` | Customer profile | `customers` |
| `/api/auth/customer-change-password` | `POST` | Customer cookie | `{ currentPassword, newPassword }` | Password change confirmation | `customers` |
| `/api/auth/forgot-password` | `POST` | No | `{ email, action?, otp?, newPassword? }` | Forgot/reset flow result | `customers` |
| `/api/auth/session` | `GET` | Cookie auth | none | Session status | JWT cookie only |
| `/api/auth/refresh` | `POST` | Refresh token | `{ refreshToken }` | New auth cookies | JWT cookies |
| `/api/auth/logout` | `POST` | Cookie auth | none | Clears auth cookies | JWT cookies |
| `/api/auth/customer-logout` | `POST` | Customer cookie | none | Clears customer cookie | JWT cookie |

## Admin Auth

| Endpoint | Method | Auth | Request Body | Response | Tables / Stores |
| --- | --- | --- | --- | --- | --- |
| `/api/admin/auth/login` | `POST` | No | `{ email, password, rememberMe }` | OTP challenge response | Prisma `user` |
| `/api/admin/auth/verify-otp` | `POST` | No | `{ email, otp }` | Access/refresh tokens + cookies | In-memory OTP/session maps |
| `/api/admin/auth/resend-otp` | `POST` | No | `{ email }` | OTP resend response | In-memory OTP map |
| `/api/admin/auth/forgot-password` | `POST` | No | `{ email }` | Password-reset acknowledgement | Placeholder only |

## Admin CRUD

| Endpoint | Method | Auth | Request Body | Response | Tables / Stores |
| --- | --- | --- | --- | --- | --- |
| `/api/admin/customers` | `GET/POST/PUT/DELETE` | Admin cookie | Filters or customer data | List/create/update/delete | `customers` |
| `/api/admin/rfqs` | `GET/POST/PUT/DELETE` | Admin cookie | Filters or RFQ data | List/create/update/delete | `rfqs` |
| `/api/admin/rfqs/[id]` | `PATCH` | Admin cookie | Status/update payload | Updated RFQ | `rfqs` |
| `/api/admin/leads` | `GET/POST/PUT/DELETE` | Admin cookie | Lead filters or payload | Lead CRUD | Lead service tables |
| `/api/admin/leads/activities` | `GET/POST` | Admin cookie | Lead activity payload | Activity list/log | Lead activity tables |
| `/api/admin/employees` | `GET/POST/PUT/DELETE` | Admin cookie | Employee payload | Employee CRUD | Employee tables / Prisma |
| `/api/admin/orders` | `GET/POST/PUT/DELETE` | Admin cookie | Order payload | Order CRUD | Order tables / service layer |
| `/api/admin/tasks` | `GET/POST/PUT/DELETE` | Admin cookie | Task payload | Task CRUD | Task tables / service layer |
| `/api/admin/categories` | `GET/POST` | Admin cookie | Category payload | Category CRUD | `categories` |
| `/api/admin/categories/[slug]` | `GET/PUT/DELETE` | Admin cookie | Category slug or payload | Single category ops | `categories` |
| `/api/admin/products` | `GET/POST/PUT/DELETE` | Admin cookie | Product payload | Product CRUD | In-memory `mockProducts` |
| `/api/admin/catalog` | `GET/POST/DELETE` | Admin cookie | Action-based payload | Catalog list/generate/delete | `data/catalog.json` + MySQL fallback |
| `/api/admin/catalog/generate` | `POST/GET` | Bearer token only | Catalogue generation payload | PDF response or status | Catalogue service |
| `/api/admin/settings` | `GET/PUT` | Admin cookie | Settings payload | Settings data | Settings service |
| `/api/admin/stats` | `GET` | Admin cookie | none | Dashboard counts | Multiple service calls |
| `/api/admin/analytics/dashboard` | `GET` | Admin cookie + permission | report query params | Analytics payload | Analytics service |
| `/api/admin/audit-logs` | `GET` | Admin cookie | `limit` query param | Audit log list | `audit_logs` |
| `/api/admin/super-admin/admins` | `GET/POST/PUT/DELETE` | Super admin cookie | Admin management payload | Admin CRUD | Prisma `user`, audit tables |
| `/api/admin/super-admin/company` | `GET/PUT` | Super admin/admin cookie | Settings payload | Company config | Company config service |

## Catalog / Public Data

| Endpoint | Method | Auth | Request Body | Response | Tables / Stores |
| --- | --- | --- | --- | --- | --- |
| `/api/rfqs` | `GET/POST` | Customer cookie for `GET`, none for `POST` | RFQ payload | RFQ list or creation result | `rfqs`, `rfqEnquiry`, `data/rfqs.json`, `data/rfqs.csv` |
| `/api/uploads` | `POST` | None | multipart form-data with `image`, `type`, `entityType` | Uploaded file URL | `media_assets` + `public/uploads/*` |
| `/api/[[...path]]` | `GET/POST` | None | RFQ/public helper payloads | Health, product data, RFQ intake | In-memory data + file fallback + MySQL |

## Notes

- Many admin routes use a common `verifyAdmin()` helper that reads the `authToken` cookie.
- Several admin handlers call service layers that then use Prisma, while older routes use direct MySQL access.
- `/api/admin/products` is currently not database-backed.
- `/api/admin/catalog` prefers `data/catalog.json` when present, then falls back to MySQL.
- `/api/[[...path]]` is effectively a legacy public API bridge with file and MySQL persistence mixed together.

