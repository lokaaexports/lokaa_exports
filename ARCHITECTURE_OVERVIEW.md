# Lokaa Exports — Architecture Overview

## 1) Top-Down Working

### Public website
- Users land on `app/page.js`, which renders `components/site/home-page-client.jsx`.
- Marketing pages like `about`, `contact`, `process`, `industrial`, `organics`, `products`, `category/[slug]`, and `product/[slug]` are server routes under `app/`.
- SEO metadata, canonical URLs, sitemap, and robots output are handled at the app layer through `app/metadata.js`, `app/sitemap.js`, and `app/robots.js`.

### Customer auth flow
- Customer registration, login, logout, profile, email verification, and password reset are exposed under `app/api/auth/*`.
- Customer state is backed by MySQL through `lib/customer-auth-service.js` and token helpers in `lib/auth-service.js`.
- OTP emails are sent through `lib/email-service.js`.

### Admin portal
- Admin pages live under `app/admin/*`.
- Protected admin APIs live under `app/api/admin/*`.
- Admin authentication is handled by `app/api/admin/auth/*` plus `lib/admin/services/auth.service.js`.
- The portal covers dashboard, CRM, catalog, products, RFQs, orders, tasks, reporting, employees, and settings.

### Data layer
- MySQL is the primary operational database.
- Prisma is used for the RBAC/auth domain and admin user management.
- Catalog and product data are also served through helper layers such as `lib/catalog-service.js`, `lib/products-server.js`, `lib/products.js`, and `lib/services.js`.

## 2) Main Features

### Public-facing features
- Brand homepage and content pages.
- Product catalog browsing.
- Category and subcategory navigation.
- RFQ submission flow.
- Customer account and authentication.
- SEO-friendly static and dynamic pages.

### Customer features
- Registration with email verification.
- Login/logout and session handling.
- Forgot password flow.
- Customer profile viewing and updates.
- RFQ and inquiry submission.

### Admin features
- OTP-based admin login.
- Admin forgot-password flow.
- Dashboard with KPI and activity views.
- CRM: customers, leads, lead activities, pipeline, tasks.
- Operations: inventory, orders, suppliers.
- Products and catalog management.
- Advanced product system: categories, subcategories, templates, specifications, images, packaging, certifications, export info, SEO, RFQ enquiries.
- Reporting and analytics.
- Super-admin management for admins and company settings.

## 3) Architecture Layers

### Presentation layer
- Next.js App Router pages in `app/`.
- Shared UI components in `components/ui/`.
- Site components in `components/site/`.
- Admin components in `components/admin/`.

### Route layer
- API routes in `app/api/*`.
- Page routes in `app/*/page.js`.
- Middleware and auth guards are split between `middleware.js`, `lib/admin/middleware/*`, and `lib/auth-service.js`.

### Service layer
- Customer auth and profile logic: `lib/customer-auth-service.js`.
- Admin auth and OTP logic: `lib/admin/services/auth.service.js`.
- Catalog and product logic: `lib/catalog-service.js`, `lib/products-server.js`, `lib/services.js`, `lib/pim-service.js`, `lib/mysql-client.js`.
- Admin domain services: `lib/admin/services/*` and `lib/admin/modules/*/services/*`.

### Persistence layer
- Prisma schema: `prisma/schema.prisma`.
- SQL schema scripts: `database/schemas/*`, `lib/admin/database/*.sql`, and setup scripts in `scripts/`.
- MySQL connection pool: `lib/mysql-client.js`.

### Cross-cutting concerns
- Email delivery: `lib/email-service.js`.
- JWT/session helpers: `lib/auth-service.js`, `lib/jwt.js`, `lib/admin/auth/jwt.js`.
- Audit logging: `lib/audit-log.js`.
- UI metadata/SEO: `app/metadata.js`, `lib/seo.js`.

## 4) Request Flow

### Public product page
1. Route handler in `app/products/[slug]/page.js` loads catalog data.
2. `lib/products-server.js` resolves the category/product.
3. Data is rendered through `components/site/product-detail-client.jsx`.
4. SEO metadata is generated from `lib/seo.js`.

### Customer registration
1. Client submits form to `app/api/auth/register`.
2. `lib/customer-auth-service.js` validates input and writes to MySQL.
3. OTP is generated and emailed through `lib/email-service.js`.
4. User verifies email through `app/api/auth/verify-email`.

### Admin login
1. Login form calls `app/api/admin/auth/login`.
2. `lib/admin/services/auth.service.js` validates credentials against Prisma `User`.
3. OTP is stored in memory and mailed through `lib/email-service.js`.
4. `app/api/admin/auth/verify-otp` exchanges OTP for JWT cookies.

### Admin forgot password
1. Admin forgot-password page posts to `app/api/admin/auth/forgot-password`.
2. Service currently returns a safe response path.
3. A true reset-link workflow can be layered on top of the same mailer and JWT utilities.

## 5) Directory Map

- `app/` — routes, pages, and API endpoints.
- `components/site/` — public site UI.
- `components/admin/` — admin UI.
- `components/ui/` — shared design system primitives.
- `lib/` — business logic, auth, data access, mail, SEO, utilities.
- `lib/admin/` — admin-only auth, services, RBAC, modules, and database scripts.
- `prisma/` — schema and Prisma client generation config.
- `database/` — SQL schema files for MySQL bootstrapping.
- `scripts/` — maintenance and setup scripts.

## 6) Deployment Notes

- Production deploy should run `npm run build` successfully.
- Environment variables required at minimum:
  - `DATABASE_URL`
  - `MYSQL_HOST`
  - `MYSQL_PORT`
  - `MYSQL_USER`
  - `MYSQL_PASSWORD`
  - `MYSQL_DATABASE`
  - `EMAIL_HOST`
  - `EMAIL_PORT`
  - `EMAIL_USER`
  - `EMAIL_PASSWORD`
  - `EMAIL_FROM`
- Demo admin login should stay disabled in production unless explicitly required.

## 7) Practical Summary

- This is a hybrid Next.js app with a public storefront plus an admin ERP-style back office.
- The public side is mostly content/catalog/RFQ.
- The admin side is CRM, catalog, RFQ, orders, reporting, and RBAC.
- MySQL is the runtime data store; Prisma is used for the auth/admin relational model.
- Email and JWTs are used for OTP and session-based authentication.
