Brightloop Subscription Management System
Shared API & Database Contract
Version: 1.0
Status: Shared Business Contracts Agreed
Date: 31 October 2026

1. Architecture Principles
The application follows a centralized backend architecture.

FastAPI is the single source of truth for application business logic.
Frontend applications communicate exclusively through backend APIs.
Authentication and authorization are handled by FastAPI.
JWT is used for authentication.
Argon2 is used for password hashing.
All modules use one shared SQLAlchemy Base, database engine and SessionLocal.
One shared Alembic migration environment is maintained.
Financial records must be preserved for auditing.
All financial calculations must be performed and validated by the backend.
No team member should independently create duplicate shared models or database infrastructure.

Technology Stack



Component
Technology




Backend
FastAPI


Database
Supabase PostgreSQL


ORM
SQLAlchemy


Database driver
Psycopg 3


Migrations
Alembic


Authentication
JWT


Password hashing
Argon2


Frontend
React + TypeScript


API communication
HTTP/REST


Financial calculations
Python Decimal




2. Shared Database Conventions
All team members must follow these conventions.



Property
Convention




Primary key strategy
Integer


Primary key field
id


Foreign key naming
<entity>_id


Monetary data type
Numeric(12, 2) initially


Timestamp
Timezone-aware DateTime


Email
Unique where applicable


Database
Supabase PostgreSQL


ORM
SQLAlchemy


Migration tool
Alembic



Important rules

Use Python Decimal for monetary calculations.
Do not use floating-point arithmetic for financial values.
Store timestamps with timezone information.
Use appropriate foreign-key constraints and indexes.
Validate data on the backend.
Preserve historical transaction information.


3. User Roles and Access Control
The application supports three primary roles:

ADMIN
STAFF
CUSTOMER

ADMIN

Manage users and staff.
Manage products and product variants.
Manage subscription plans.
Configure taxes and discounts.
Manage subscriptions.
Access invoices, payments and financial reports.
Access administrative dashboards.

STAFF

Access authorized operational features.
Manage permitted products and subscriptions.
Assist with customer and subscription operations.
Access permitted billing information.

CUSTOMER

Access their own profile.
View their own subscriptions.
View their own invoices.
View their payment history.
Access customer portal features.

Security rules

Authentication is handled through JWT.
Passwords are hashed using Argon2.
Authorization is enforced through backend RBAC.
Customers must never access another customer's records.
Frontend role checks do not replace backend authorization.


4. Shared Subscription Contracts
4.1 Subscription Statuses
The agreed subscription statuses are:

DRAFT
QUOTATION
CONFIRMED
ACTIVE
PAUSED
CLOSED

Subscription status and invoice/payment status must remain independent.
Valid status transitions must be enforced by backend business logic.
A paused subscription may be resumed. Closed subscriptions are treated as terminal unless a future business requirement explicitly permits reopening.
4.2 Billing Frequencies
Supported billing frequencies:

DAILY
WEEKLY
MONTHLY
YEARLY

Billing frequency must be stored on the Subscription independently of its SubscriptionPlan.
4.3 SubscriptionPlan
Table: subscription_plans
Proposed fields:

id
name
description
plan_code
billing_frequency
base_price
currency
is_active
created_at
updated_at

Relationship:

SubscriptionPlan → Subscriptions (one-to-many)

A subscription may exist without a predefined plan.
The plan_id field on Subscription is nullable.
Historical plan information must be preserved:

Plan name
Plan price
Currency
Billing frequency

Changes to current plan configuration must not modify existing subscriptions.
4.4 Subscription
Table: subscriptions
Proposed fields:

id
subscription_code
customer_id
plan_id (nullable)
status
start_date
end_date
billing_frequency
next_billing_date
created_by
created_at
updated_at

Relationships:

Subscription → Customer
Subscription → SubscriptionPlan
Subscription → SubscriptionLines
Subscription → Invoices
Subscription → BillingCycles

Historical plan snapshots must be retained.
4.5 SubscriptionLine
Table: subscription_lines
Agreed relationships:

product_id: required FK to products.
product_variant_id: nullable FK to product_variants.

If a variant is selected, the backend must validate that it belongs to the selected product.
Historical snapshot fields:

product_name
variant_name
sku
quantity
unit_price
line_total

Historical prices must not change when current product or variant prices change.

5. Shared Model Ownership
Member 2 — Shared Backend Models



Model
Table




User
users


Role
roles


Customer
customers


Product
products


ProductVariant
product_variants


SubscriptionPlan
subscription_plans


Subscription
subscriptions


SubscriptionLine
subscription_lines



Member 2 owns the shared database infrastructure, authentication and core subscription-side models.
Member 3 — Billing Models



Model
Table




Invoice
invoices


InvoiceLine
invoice_lines


TaxRule
tax_rules


Discount
discounts


DiscountUsage
discount_usages


Payment
payments


BillingCycle
billing_cycles


BillingExecutionLog
billing_execution_logs



Member 3 owns billing models, financial calculations, invoice generation, payment recording and recurring billing.
All billing models must reuse the shared SQLAlchemy Base and existing database infrastructure.

6. Financial Database Relationships
The following relationships are agreed.



Parent
Child
Relationship




Customer
Subscription
One-to-many


Product
ProductVariant
One-to-many


Subscription
SubscriptionLine
One-to-many


Product
SubscriptionLine
One-to-many


ProductVariant
SubscriptionLine
One-to-many


Subscription
Invoice
One-to-many


Customer
Invoice
One-to-many


Invoice
InvoiceLine
One-to-many


Invoice
Payment
One-to-many


Subscription
BillingCycle
One-to-many



6.1 Invoice Relationships
Member 3 owns the Invoice model.
Required fields:

customer_id: required FK to customers.
subscription_id: nullable FK to subscriptions.

This supports:

Subscription-based invoices.
Standalone invoices.

Invoice records must preserve historical financial information.
6.2 Payment Relationships
One invoice can have multiple payment records.
Partial payments must be supported.
Example:



Transaction
Amount




Invoice total
₹10,000


First payment
₹3,000


Second payment
₹2,000


Outstanding balance
₹5,000



Outstanding Balance:
Invoice Total - Total Successful Payments
Only successfully recorded payments reduce the outstanding balance.
Failed payments and refunds must be handled separately.
6.3 Deletion Policies

Financial records must not be cascade-deleted when customers or subscriptions are deactivated.
Referenced customers, products and subscriptions should generally be deactivated instead of deleted.
Historical invoices and payments must be retained for auditing.
Foreign-key deletion policies must preserve financial integrity.


7. Invoice and Payment Lifecycle
7.1 Invoice Workflow Status
Agreed invoice workflow statuses:

DRAFT
CONFIRMED
CANCELLED

7.2 Invoice Payment Status
Agreed payment statuses:

UNPAID
PARTIALLY_PAID
PAID
OVERDUE

Invoice workflow status and payment status must be stored and managed separately.
An invoice can be:

CONFIRMED + UNPAID
CONFIRMED + PARTIALLY_PAID
CONFIRMED + PAID
CONFIRMED + OVERDUE

7.3 Payment Record Status
Proposed payment record statuses:

RECORDED
REVERSED

Payment recording must not be confused with successful payment gateway processing.
Payment gateway integration is not assumed to exist.
Payment allocation, refund representation and reversal rules must be finalized before implementation.

8. Billing and Financial Calculation Rules
8.1 Invoice Generation

Generate invoices from eligible subscriptions.
Support standalone invoices where authorized.
Generate invoice lines from agreed subscription pricing.
Preserve historical product and pricing information.
Store invoice totals and relevant calculation details.
Prevent duplicate invoices for the same subscription billing period.

8.2 Tax Calculation

Tax rules are configured by authorized administrators.
Tax calculations are performed on the backend.
Tax details must be preserved in invoice records.
Tax calculation must support the agreed product and invoice-level requirements.

Tax-inclusive versus tax-exclusive pricing requires final confirmation.
8.3 Discount Management
Support:

Fixed discounts.
Percentage discounts.
Minimum purchase conditions.
Quantity conditions.
Start and end dates.
Usage limits.
Product-specific discounts.
Subscription-wide discounts.

Discounts must be validated by the backend before application.
Discount stacking and application priority require final confirmation.
8.4 Payment Recording
Payment records should contain:

Invoice reference.
Amount.
Payment method.
Payment date.
Reference or note.
Payment record status.

Payment recording must use database transactions.
The system must support multiple payments against one invoice.
8.5 Outstanding and Overdue Invoices
The billing system must:

Calculate outstanding balances.
Identify partially paid invoices.
Identify overdue invoices.
Update payment status consistently.
Preserve payment history.

8.6 Recurring Billing
Recurring billing must:

Identify subscriptions due for billing.
Generate invoices for eligible billing periods.
Record billing execution history.
Prevent duplicate invoice generation.
Update the next billing date.
Handle paused and closed subscriptions correctly.

Database-level idempotency protection must be implemented.
8.7 Renewal and Expiry Processing
The billing engine must support:

Upcoming renewal identification.
Subscription expiry tracking.
Renewal processing.
Paused subscription handling.
Closed subscription exclusion.

Exact renewal and expiry rules must follow the agreed subscription lifecycle.

9. API Conventions
Base API prefix:
/api/v1
All frontend applications must communicate with FastAPI through these APIs.
9.1 Shared Backend Endpoints
Proposed endpoint groups:
Authentication

POST /auth/register
POST /auth/login
GET /auth/me

Users and Roles

GET /users
POST /users
GET /users/{user_id}
PATCH /users/{user_id}
GET /roles

Customers

GET /customers
POST /customers
GET /customers/{customer_id}
PATCH /customers/{customer_id}

Products

GET /products
POST /products
GET /products/{product_id}
PATCH /products/{product_id}
POST /products/{product_id}/variants

Subscription Plans

GET /plans
POST /plans
GET /plans/{plan_id}
PATCH /plans/{plan_id}

Subscriptions

GET /subscriptions
POST /subscriptions
GET /subscriptions/{subscription_id}
PATCH /subscriptions/{subscription_id}
PATCH /subscriptions/{subscription_id}/status

9.2 Billing Endpoint Ownership
Member 3 owns the following API groups:

/invoices
/payments
/tax-rules
/discounts
/billing

Exact request and response schemas must be finalized before implementation.
All endpoints must enforce appropriate authentication and role permissions.

10. API and Database Integration Rules

FastAPI is the only application layer allowed to perform database operations.
Frontend applications must not connect directly to PostgreSQL.
All shared models must use the existing SQLAlchemy Base.
All database operations must use the shared SessionLocal/get_db infrastructure.
API request and response schemas must be consistent across modules.
Financial calculations must remain backend-authoritative.
API changes affecting another member must be communicated before implementation.
Shared field names and foreign-key references must remain consistent.
Authentication and authorization must be enforced on the backend.
All important business operations must include appropriate validation and error handling.


11. Alembic Migration Coordination
The project maintains one shared Alembic environment.
Existing migration checkpoint
Initial migration:
b1e1fe71309d
Description: Create roles and users tables.
Member 2 reports this migration is currently applied to Supabase PostgreSQL.
Migration rules

Do not create duplicate Alembic environments.
Do not create separate migration directories.
Do not independently generate conflicting migration revisions.
Communicate shared model changes to affected team members.
Review combined SQLAlchemy model metadata before generating migrations.
Generate one coordinated migration revision for each agreed integration batch.
Review migration scripts before applying them to Supabase.
Verify the current migration revision after application.
Never assume a migration has been applied just because its file exists.

Agreed migration workflow

Finalize shared model contracts.
Implement the agreed models.
Register all models in the shared model package.
Review combined metadata.
Generate one coordinated Alembic revision.
Inspect the generated migration.
Apply the migration to Supabase.
Verify the database revision.
Commit and push the coordinated changes.


12. Four-Member Team Ownership
Member 1 — Frontend & UI/UX Developer
Ownership: Frontend
Responsibilities:

Build the main application layout.
Develop the Admin dashboard UI.
Develop the Staff dashboard UI.
Build product and plan management pages.
Build subscription management pages.
Develop responsive sidebar and navigation.
Build forms, tables, search and filters.
Connect frontend pages to backend APIs.

Deliverable: Functional Admin and Staff interfaces.
Member 2 — Backend & Database Developer
Ownership: Core Backend
Responsibilities:

Set up the FastAPI backend.
Design the PostgreSQL database.
Implement user registration and login.
Implement Admin, Staff and Customer authentication.
Implement JWT authentication and Argon2 password hashing.
Implement Role-Based Access Control (RBAC).
Develop product and variant APIs.
Develop subscription plan APIs.
Develop subscription lifecycle APIs.
Implement database relationships and validations.

Deliverable: Working authentication, database and core subscription APIs.
Member 3 — Billing & Financial Logic Developer
Ownership: Billing
Responsibilities:

Implement automated recurring billing.
Develop invoice generation.
Implement invoice status management.
Develop tax calculation.
Implement discount rules and automatic application.
Develop payment recording.
Implement outstanding and overdue invoice tracking.
Prevent duplicate invoice generation.
Implement renewal and expiry processing.

Deliverable: Fully functional billing, invoice, discount and payment modules.
Member 4 — Analytics, Customer Portal & Integration Developer
Ownership: Analytics, Customer Portal and Integration
Responsibilities:

Develop the Customer Portal UI.
Implement customer subscription and invoice views.
Display customer payment history.
Develop revenue analytics.
Implement MRR and ARR calculations.
Develop interactive charts.
Build the upcoming renewals dashboard.
Develop overdue invoice reports.
Support frontend/backend integration.
Coordinate testing and deployment.

Deliverable: Functional Customer Portal, analytics dashboard and integrated application.

13. Pending Technical Decisions
The following details require final technical confirmation before their respective implementation:

Exact Customer, Product and Subscription field constraints.
Complete historical snapshot fields.
Invoice numbering strategy.
Supported currencies and monetary precision.
Tax-inclusive versus tax-exclusive pricing.
Discount stacking and application priority.
Payment allocation and refund representation.
Billing period boundaries and timezone rules.
Exact status transition permissions.
API request and response schemas.
Standard API error response format.
Pagination conventions.
Detailed role permissions for each endpoint.
Recurring billing scheduling mechanism.
Invoice cancellation and reversal rules.

These pending decisions must not be silently assumed during implementation.

14. Shared Development Rules
All four team members must follow these rules:

Do not create duplicate shared models.
Do not create duplicate database infrastructure.
Do not independently modify shared contracts without informing affected members.
Do not generate conflicting Alembic migrations.
Do not implement frontend business calculations that should belong to the backend.
Do not expose database credentials or secrets.
Preserve historical financial records.
Test individual modules before integration.
Coordinate API changes through the shared contract.
Keep the main branch stable and synchronize before beginning shared integration work.


15. Contract Approval
This document represents the shared business agreements confirmed by the backend and billing contributors.
Any change to shared database fields, model relationships, enum values or API contracts must be communicated and reviewed by the affected team members.
The document will be updated as implementation details are finalized.
Document: Brightloop Subscription Management System — Shared API & Database Contract
Version: 1.0
Status: Shared Business Contracts Agreed
End of Document
