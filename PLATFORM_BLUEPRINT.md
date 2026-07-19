# Platform Blueprint

This repository is moving from a single-product/catalog app to a domain-driven business platform.

## Target Domains

- `crm` — customers, leads, activities, pipeline
- `pim` — products, categories, attributes, templates, variants, packaging, certifications, SEO, documents, media, relationships
- `rfq` — inquiry capture, quoting, approvals, communication
- `orders` — order lifecycle and fulfillment
- `export` — IEC, shipping bills, BL, invoices, packing lists, COO, inspection, container tracking
- `shipment` — logistics tracking and events
- `inventory` — stock, availability, warehouse state
- `finance` — invoicing, payments, reconciliation
- `reports` — operational and executive reporting
- `notifications` — bell center, alerts, email/push/system notifications
- `media` — DAM/media library and reusable assets
- `workflow` — draft → review → approval → publish lifecycle
- `rbac` — roles, permissions, approval gates
- `buyer` — buyer portal and self-service access
- `suppliers` — supplier/factory/farmer portal
- `ai` — generation helpers for content and assistance
- `settings` — company, users, API, storage, backups, logs, security, integrations

## Requested Capability Expansion

### 1. PIM

Replace the current product-only model with:

- Products
- Categories
- Subcategories
- Product Templates
- Dynamic Attributes
- Attribute Groups
- Product Variants
- Packaging
- Certifications
- Export Details
- SEO
- Documents
- Images
- Videos
- Product Relationships

### 2. DAM

Centralize reusable assets:

- Images
- Videos
- Certificates
- PDFs
- Catalogues
- Brochures
- Icons

### 3. Workflow Engine

Standard lifecycle:

- Draft
- Pending Review
- Approved
- Published
- Archived

Apply it to products, RFQs, documents, and catalogues.

### 4. Notification Center

Events to support:

- RFQ Received
- Product Updated
- Employee Assigned
- Order Paid
- Shipment Created
- Task Due
- OTP Sent
- Server Error

### 5. Global Search

One search entrypoint across:

- Products
- Customers
- Companies
- Employees
- Orders
- RFQs
- Countries
- Categories
- Invoices

### 6. Activity Timeline

Track:

- Created
- Updated
- Deleted
- Viewed
- Downloaded
- RFQ Submitted
- Email Sent
- Employee Assigned

### 7. Approval System

Support staged approvals:

- Employee creates product
- Manager approves
- Admin approves
- Publish

### 8. RBAC Expansion

Roles:

- Super Admin
- Admin
- Sales Manager
- CRM Executive
- Export Executive
- Product Manager
- Finance
- Warehouse
- HR
- Marketing
- Viewer

Permissions:

- Read
- Create
- Update
- Delete
- Approve
- Export

### 9. Dashboards

Separate dashboards for:

- CEO
- Sales
- CRM
- Export
- Inventory
- Marketing
- Finance

### 10. Analytics

Add:

- Most viewed product
- Best selling
- RFQ conversion
- Country revenue
- Traffic
- Keywords
- Downloads
- Top buyers

### 11. Export Module

Track:

- IEC
- Shipping Bills
- BL
- Invoice
- Packing List
- COO
- Inspection
- Container
- Tracking

### 12. Supplier Portal

Support:

- Suppliers
- Factories
- Farmers
- Manufacturers
- Documents
- Contracts
- Payments

### 13. Buyer Portal

Support:

- Orders
- RFQs
- Invoices
- Documents
- Messages
- Downloads
- Profile

### 14. AI Module

Assist with:

- Description generation
- SEO
- Keywords
- HS code suggestions
- Specification suggestions
- Translation
- Email replies

### 15. System Module

Central administration for:

- Company
- Users
- Roles
- Email
- API
- Storage
- Backup
- Logs
- Security
- Integrations

## Recommended Layout

```text
app/
components/
modules/
├── dashboard
├── crm
├── pim
├── rfq
├── orders
├── export
├── shipment
├── inventory
├── reports
├── finance
├── settings
├── media
├── notifications
├── workflow
├── rbac
├── suppliers
├── buyer
├── ai
├── system
services/
repositories/
prisma/
shared/
hooks/
types/
utils/
middleware/
emails/
workers/
jobs/
```

## Implementation Order

1. Create shared domain primitives: workflow, audit, notification, RBAC.
2. Split product into PIM and DAM.
3. Add global search and activity timeline.
4. Add dashboards and analytics by role.
5. Add export, supplier, and buyer portals.
6. Layer AI helpers on top of PIM, RFQ, and email.

## Principle

Each business domain should own:

- UI
- API routes
- services
- repositories
- types
- tests

That keeps the app maintainable as it grows.
