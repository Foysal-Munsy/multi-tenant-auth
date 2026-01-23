
<div align="center">

# Multi‑Tenant Auth (Org‑Scoped)

🔐 Authentication + 🏢 tenant isolation + 🎭 org roles — in one small NestJS API.

</div>

## What problem this solves

Most auth demos stop at “login = token”. Real apps need more:

- One user can belong to multiple organizations (tenants)
- The same user can have different roles per organization
- Every request must be scoped to the *active* organization to prevent cross‑tenant data access

This project demonstrates a practical baseline for **multi‑tenant authentication + authorization** using:

- **JWT access tokens** that include the user’s org memberships
- An **Organization selection header** (`X-Organization-Id`) to choose the active tenant per request
- A **User ↔ Organization mapping** (with `role`) to support org‑scoped RBAC

## How it works (conceptually)

### 🧩 Data model

- `User`: identity + hashed password
- `Organization`: tenant boundary
- `UserOrgMap`: membership table (`user_id`, `org_id`, `role`)

### 🔑 Authentication

- `POST /auth/login` verifies credentials and issues a JWT.
- The JWT contains an `organizations[]` array so the client knows what tenants the user can act in.

### 🛡️ Authorization (tenant isolation)

- Protected routes require:
	- `Authorization: Bearer <token>`
	- `X-Organization-Id: <orgId>`
- The server checks the selected org exists in the token’s memberships.

### 🎭 Roles (org‑scoped RBAC)

- Role lives on the membership record (not globally on the user).
- Example roles you can model: `owner` / `admin` / `member`.

## API surface (current)

- `POST /auth/register` — create a user and join/create an organization
- `POST /auth/login` — return JWT access token
- `GET /auth/organization-details` — example route that validates org context
- `POST /auth/create-org` — create a new organization (if not already present)

## Runtime

Runs on **Bun** (Bun-friendly dependency/workflow supported).

---

If you’re building a SaaS-style backend, this is the missing layer between “auth works” and “multi-tenant safe”.

