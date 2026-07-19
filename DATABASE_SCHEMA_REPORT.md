# Database Schema Report

## Overview

The backend uses three overlapping data layers:

- Direct MySQL access through `lib/mysql-client.js`
- Prisma models in `prisma/schema.prisma` and `lib/admin/services/*`
- File-backed fallbacks for catalog and RFQ data in `data/*.json` and `data/*.csv`

This is functional, but the model is fragmented. Several business objects exist in more than one shape, and not all paths write to the same source of truth.

## Connection Architecture

- `lib/mysql-client.js` creates a singleton MySQL pool and runs schema bootstrap on first use.
- `lib/auth-service.js`, `lib/customer-auth-service.js`, `lib/services.js`, and many `app/api/*` routes use that pool directly.
- Admin RBAC and some admin CRUD services use Prisma instead of the MySQL pool.
- `MONGO_URL` and `DB_NAME` exist in `.env`, but no runtime code imports MongoDB.

## Main MySQL Tables

| Table | Purpose | Notes |
| --- | --- | --- |
| `users` | Admin/customer auth for the MySQL path | Stores `passwordHash`, role, status, timestamps |
| `customers` | Customer CRM/account records | Stores password hash, OTP, verification state, login attempts |
| `rfqs` | RFQ intake and status tracking | Has customer link via `customer_id` plus duplicate name/email fields |
| `products` | Product catalog | JSON text fields for gallery/specs/faq and SEO columns |
| `categories` | Product categories | Self-referencing parent category |
| `subcategories` | Product subcategories | Parent-child tree + category link |
| `attributes` | Product attributes | Used by product-advanced modules |
| `packaging_types` | Packaging catalog | Separate metadata table |
| `export_countries` | Export market catalog | Country list and sort order |
| `media_assets` | Uploaded files and media | Used by upload endpoint |
| `blogs` | Content/blog management | Author link to `users` |
| `audit_logs` | Activity trail | Stores action metadata and JSON details |

## RBAC / Admin Tables

The SQL bootstrap file `database/schemas/01_roles_and_permissions.sql` defines:

- `roles`
- `permissions`
- `role_permissions`
- `departments`
- `employees`
- `employee_roles`
- `sessions`
- `login_history`
- `activity_logs`
- `notifications`
- `api_keys`
- `email_templates`
- `company_settings`

These tables are not the same shape as the Prisma auth/admin schema. That means the codebase currently has two parallel admin data models.

## Relationships

- `customers` -> `rfqs.customer_id` is the main customer/RFQ link.
- `categories` -> `categories.parentCategoryId` is self-referential.
- `subcategories.categoryId` points to `categories.id`.
- `subcategories.parentId` is self-referential.
- `blogs.authorId` points to `users.id`.
- `audit_logs.userId` is the admin/user audit reference.
- In the SQL bootstrap file, `employees.department_id`, `employees.reporting_manager_id`, and `departments.manager_id` are mutually dependent.

## Gaps And Risks

1. `products.category` is a free-text column, not a foreign key, so catalog integrity depends on application code.
2. `rfqs` is written by multiple paths with different fallbacks: MySQL, Prisma, JSON, and CSV.
3. Schema creation happens inside `getMysqlPool()`, so every cold start can perform DDL.
4. The SQL bootstrap file mixes table creation and foreign-key creation for cyclic references, which is fragile.
5. Prisma and MySQL auth/admin models are duplicated rather than unified.
6. `MONGO_URL` and `DB_NAME` are unused, which increases configuration noise.

## Missing Improvements

- Move schema changes to real migrations instead of runtime DDL.
- Unify one source of truth for admin auth and RBAC.
- Add foreign keys or lookup tables for product category relations.
- Replace JSON text columns with structured tables where queryability matters.
- Add explicit unique constraints/indexes for lookup-heavy columns in the product and RFQ paths.
- Remove unused Mongo variables if MongoDB is not part of the architecture.

## ER Diagram Summary

### Core Commerce Flow

- Customer registers in `customers`.
- Customer submits RFQs in `rfqs`.
- Admin workflows read and update `rfqs`.
- Product catalog data lives in `products`, `categories`, `subcategories`, and related metadata tables.

### Admin / RBAC Flow

- The SQL bootstrap file models role-based access control with `roles`, `permissions`, and `role_permissions`.
- The Prisma admin path models users, roles, permissions, and related audit history separately.

### File / Media Flow

- Uploads are stored on disk under `public/uploads/*`.
- `media_assets` stores metadata for those uploads.
- Catalog generation can read from `data/catalog.json` before falling back to MySQL.

