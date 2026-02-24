# Implementation Plan: MVP Authentication for InnovatEPAM Portal

**Branch**: `001-mvp-authentication` | **Date**: 2026-02-24 | **Spec**: `/specs/001-mvp-authentication/spec.md`
**Input**: Feature specification from `/specs/001-mvp-authentication/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement MVP authentication for the Express API: registration, login returning JWT, and authentication middleware for protected endpoints. The implementation uses JWT bearer tokens (24h expiry), password hashing, strict role and input validation, and clear HTTP semantics (`409` duplicate email, `401` invalid login/auth failures) while keeping logout client-side only for MVP.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `jsonwebtoken`, `bcryptjs`, `dotenv`  
**Storage**: File-based JSON store for MVP user persistence (`data/users.json`)  
**Testing**: `jest` + `supertest` with unit/integration/contract coverage  
**Target Platform**: Node.js server runtime (local dev + CI)
**Project Type**: Single-project web API  
**Performance Goals**: Auth endpoints p95 <= 2s under normal test load; token verification <= 100ms per request  
**Constraints**: JWT expiry fixed to 24h; minimum password length 8; no token blacklist/logout revocation for MVP; no secrets in repository  
**Scale/Scope**: MVP scope for one service, two auth endpoints + protected middleware, role values `submitter|admin`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: Project is JavaScript-only; module interfaces and request/response contracts are documented in spec and contracts.
- **Lint gate (PASS)**: Plan includes adding ESLint config and a mandatory passing lint script.
- **Testing gate (PASS)**: Plan includes automated tests for registration, login, and auth middleware behavior.
- **Coverage gate (PASS)**: Plan includes CI/local coverage check enforcing >=80% lines for business logic.
- **Security gate (PASS)**: Plan uses env-based secrets (`JWT_SECRET`), excludes secrets from VCS, and avoids hardcoded credentials.
- **Commit gate (PASS)**: Plan execution will be split into meaningful commits by capability (model, service, middleware, route, tests, docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-authentication/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app.js
├── server.js
├── config/
│   └── auth.js
├── middleware/
│   └── authenticate.js
├── models/
│   └── userStore.js
├── routes/
│   └── authRoutes.js
└── services/
    └── authService.js

data/
└── users.json

tests/
├── contract/
│   └── auth.contract.test.js
├── integration/
│   └── auth.integration.test.js
└── unit/
    ├── authService.test.js
    └── authenticate.test.js
```

**Structure Decision**: Single-project Express API structure selected to keep MVP scope minimal while cleanly separating persistence, service logic, middleware, and route contracts.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Data model and contract documents define stable JS module boundaries and API shapes.
- **Lint gate (PASS)**: Quickstart and implementation include lint run before test/build.
- **Testing gate (PASS)**: Contracts + quickstart prescribe tests for all business logic paths.
- **Coverage gate (PASS)**: Coverage threshold remains >=80% lines for business logic.
- **Security gate (PASS)**: JWT secret and runtime config remain env-only; no secret files introduced.
- **Commit gate (PASS)**: Implementation phases remain split into reviewable, intent-focused commits.
