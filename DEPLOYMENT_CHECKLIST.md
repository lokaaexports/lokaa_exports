# Deployment Checklist

Date: 2026-07-15

## Current State

- Production code builds successfully.
- Secrets have been removed from the checked-in `.env` and replaced with placeholders.
- PIM now includes documents, videos, variants, and related products.
- Upload behavior is configurable for persistent filesystem storage.
- RBAC and audit logging are wired into key mutation routes.

## Deployment Order

### 1. Production Secrets

- Set production values in your secret manager or hosting environment.
- Do not commit real secrets back into the repository.
- Required variables:
  - `DATABASE_URL`
  - `MYSQL_HOST`
  - `MYSQL_PORT`
  - `MYSQL_USER`
  - `MYSQL_PASSWORD`
  - `MYSQL_DATABASE`
  - `MYSQL_SSL`
  - `JWT_SECRET`
  - `EMAIL_HOST`
  - `EMAIL_PORT`
  - `EMAIL_USER`
  - `EMAIL_PASSWORD`
  - `EMAIL_FROM`
  - `NEXT_PUBLIC_BASE_URL`
  - `CORS_ORIGINS`
  - `UPLOAD_STORAGE_MODE`
  - `UPLOAD_STORAGE_DIR`
  - `UPLOAD_PUBLIC_BASE_URL`

### 2. Database Validation

- Compare production schema against [`prisma/schema.prisma`](./prisma/schema.prisma).
- Verify:
  - tables exist
  - foreign keys are correct
  - indexes exist
  - required seed data exists
  - `customer_tasks` matches `scripts/setup-extended-schema.js`
- Confirm the production database is reachable from the deployment target.

### 3. RBAC Seed State

- Ensure the permission seed has been applied in production.
- Confirm these modules exist and are assigned as expected:
  - `products`
  - `crm`
  - `employees`
  - `rfqs`
  - `orders`
  - `tasks`
  - `notifications`
  - `audit`
  - `settings`

### 4. Upload Storage

- If deployment is not on persistent disk, do not use filesystem uploads.
- If using filesystem uploads:
  - mount a persistent directory
  - set `UPLOAD_STORAGE_MODE=filesystem`
  - set `UPLOAD_STORAGE_DIR` to that mount
  - set `UPLOAD_PUBLIC_BASE_URL` to the production domain

### 5. Smoke Test

Run these checks against staging or production:

- Login/logout
- Employee CRUD
- Task CRUD
- PIM category CRUD
- PIM product CRUD
- Product documents/videos/variants/related products CRUD
- Media upload
- Media library listing
- Audit log listing
- Notification center load
- RFQ creation and retrieval

### 6. Monitoring

- Confirm error logging is active.
- Confirm audit logs are visible.
- Confirm backups are running.
- Confirm restore procedure is documented and tested.

## Go-Live Gate

Do not deploy until:

- secrets are rotated and stored outside the repo
- production DB schema is verified
- RBAC seed state is confirmed
- upload storage is persistent or externalized
- smoke tests pass in staging

## Rollback Plan

- Keep the previous deployment image available.
- Keep a validated backup of the production database.
- If uploads fail in production, disable upload endpoints until persistent storage is restored.
- If a schema mismatch appears, stop traffic and restore the known-good deployment.
