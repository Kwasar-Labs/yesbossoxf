# YesBoss Backend: Project & Architecture Blueprint

This document contains **everything about the architecture, stack, patterns, and folder structure** of the `yesboss-backend` repository. It is written to serve as a comprehensive spec file. A new AI agent or human developer should be able to read this document and perfectly reconstruct the repository in an independent folder.

---

## 1. High-Level Architecture
The `yesboss-backend` is a **TypeScript Monorepo** managing a distributed backend ecosystem. 

**Core Stack:**
- **Package Manager:** `pnpm` (Workspaces)
- **Language:** TypeScript (`tsx` for dev runtime, `tsc`/`tsup` for builds)
- **Web Framework:** Express.js (v5.x)
- **Database:** MongoDB (using native `mongodb` driver, decoupled per service)
- **Message Broker:** RabbitMQ (Event-driven communication)
- **API Gateway:** `http-proxy-middleware` for local routing
- **Deployment/Process Manager:** PM2 (`ecosystem.config.js`)
- **API Documentation/Testing:** Bruno (`yb-bruno-apis/`)

---

## 2. Monorepo Structure & Dependencies

The repository uses pnpm workspaces (`pnpm-workspace.yaml`) with two main namespaces:
- `packages/*`: Shared internal libraries (Types, Errors, Utils).
- `apps/*`: Runnable independent microservices (Auth, Communication, Workforce, Dev-Gateway).

### Monorepo Dependency Rules
1. **No Circular Dependencies:** Apps consume Packages. Packages consume other Packages. Apps **never** consume other Apps.
2. **Package Linking:** Workspace packages are linked using `workspace:*` in `package.json`.
3. **Build Tooling:** Shared packages are bundled using `tsup`. Apps are built using `tsc`.
4. **Dev Tooling:** Apps run in watch mode using `tsx --watch src/index.ts`.

---

## 3. The `packages/` Domain (Shared Libraries)

### `@yesboss/types`
**Purpose:** Centralized repository for all domain models, interfaces, and enums. Guarantees type consistency across all microservices without risking runtime bundle sizes.
**Contents:**
- `common.ts` (Base types, pagination, responses)
- `department.ts`, `organization.ts`, `project.ts`, `role.ts`, `task.ts`, `team.ts`, `user.ts` (Core entity models)
- `whatsapp-message.ts` (External integration models)
- `enums/` (Shared Enums)

### `@yesboss/errors`
**Purpose:** Standardized HTTP Error handling.
**Contents:**
- `http-error.ts`: Custom Error subclass containing status codes and structured payloads.
- `http-error-handler.ts`: Express middleware that catches internal errors and formats them into a standard JSON response (`{ error: { code, message } }`).

### `@yesboss/utils`
**Purpose:** Pure utility functions and shared middleware decoupled from business logic.
**Contents:**
- `async-handler.ts`: Wrapper for Express route handlers to automatically catch promise rejections and pass them to `next()`.
- `jwt/`: Token generation and verification utilities.
- `password-hashing.ts`: Wrappers for `bcrypt`.
- `logger.ts`: Standardized console or structured logging.
- `http-response.ts`: Standardized success response formatters.
- `scripts/`: E.g., `generatePrivateAndPublicKeys.js` (for RS256 JWT signing).

---

## 4. The `apps/` Domain (Microservices)

Every microservice under `apps/` follows a standardized Express + Controller-Service-Route pattern.

**Standard App Anatomy:**
```text
apps/<service-name>/
  package.json         # Includes "dev": "tsx --watch src/index.ts"
  tsconfig.json        # Service specific TS configuration
  src/
    app.ts             # Express app initialization (cors, helmet, compression, error handlers)
    index.ts           # Server start block (app.listen) and DB connection initialization
    config/            # Environment specific variables (process.env parsers)
    database/          # MongoDB connection handlers and repository files
    middlewares/       # App-specific middlewares (auth guards, rate limiters)
    controllers/       # Request validation & HTTP response orchestration
    services/          # Business logic (Optional, often inside controllers for simple apps)
    types/             # App-specific types not shared globally
    routes/            # Express Routers mapping endpoints to controllers
```

### `apps/auth`
**Domain:** Identity, Organizations, Departments, Teams, and Role-Based Access Control (RBAC).
**Key Responsibilities:**
- Login / JWT Authentication.
- Org & Department hierarchy management.
- Creating and removing members from teams/departments.
- Namespace & permissions management.

### `apps/communication`
**Domain:** External integrations and asynchronous messaging.
**Key Responsibilities:**
- WhatsApp integration (Webhooks, send/receive handlers).
- Contains advanced `rabbit/` and `rabbit-queue-handler/` directories.
- Receives events via RabbitMQ (e.g., from `workforce` or `auth`) and dispatches messages to external APIs.

### `apps/workforce`
**Domain:** Project management and task delegation.
**Key Responsibilities:**
- Managing Projects and Tasks.
- Core internal workforce operations.

### `apps/dev-gateway`
**Domain:** Local Reverse Proxy.
**Key Responsibilities:**
- Uses `http-proxy-middleware` and `express`.
- Exposes a single port locally and routes `/api/auth` to the `auth` service port, `/api/workforce` to the `workforce` service port, etc.

---

## 5. Development & Deployment Tooling

### Workspace Scripts (`package.json` at root)
- `"dev"`: Runs `pnpm -r dev` or `dev:gateway`, `dev:auth`, etc., spinning up all `tsx --watch` instances.
- `"build"`: Builds `@yesboss/types` -> `@yesboss/errors` -> `@yesboss/utils` -> Microservices.

### Bruno API Collections (`yb-bruno-apis/`)
Instead of Postman, the project uses Bruno (`bruno.json`).
- Environment variables configured in `environments/yt.bru`.
- Organized into folders: `auth/`, `communication/`, `workforce/`.
- Contains exact payloads, paths, and headers needed to interact with the backend APIs.

### PM2 / Ecosystem (`ecosystem.config.js`)
Configured to run the compiled `dist/index.js` files of each microservice in production, managing clustering and restarts independently per service.

---

## 6. How to Recreate This Independent Repository (Agent Instructions)

If asked to recreate this environment, follow these exact steps:

**Step 1: Scaffolding Workspace**
1. Initialize a new folder, create `package.json` with `private: true`, and install `tsx`, `typescript`, `tsup` locally.
2. Create `pnpm-workspace.yaml` including `packages/*` and `apps/*`.
3. Create `tsconfig.base.json` with standard strict defaults.

**Step 2: Scaffolding Packages**
1. Generate `packages/types/`, `packages/errors/`, `packages/utils/`.
2. Give them scoped names (e.g., `@yesboss/types`).
3. Add `tsup` build scripts: `"build": "tsup src/index.ts --format cjs,esm --dts"`.
4. Create the core entity files as listed in Section 3. Export them from `src/index.ts`.

**Step 3: Scaffolding Apps**
1. Generate `apps/dev-gateway`, `apps/auth`, `apps/communication`, `apps/workforce`.
2. Give them private `package.json`s. Add `express`, `mongodb`, and `dotenv`.
3. Link the internal packages: `pnpm add @yesboss/types @yesboss/utils @yesboss/errors --workspace --filter <app-name>`.
4. Create the boilerplate `src/index.ts` connecting to MongoDB and starting Express.
5. Create the required router and controller files conforming to the domains discussed above.

**Step 4: Scaffolding API Tests**
1. Re-create the `yb-bruno-apis/` directory structure.
2. Ensure endpoints in Bruno match the Express routes defined in your applications.