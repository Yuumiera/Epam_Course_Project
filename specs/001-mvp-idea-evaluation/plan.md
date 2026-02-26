# Implementation Plan: MVP Idea Evaluation Workflow

**Branch**: `001-mvp-idea-evaluation` | **Date**: 2026-02-25 | **Spec**: `/specs/001-mvp-idea-evaluation/spec.md`
**Input**: Feature specification from `/specs/001-mvp-idea-evaluation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add authenticated evaluation workflow for ideas by extending the existing ideas API with admin-only status updates to `under_review`, `accepted`, or `rejected`, plus optional comments. Reuse existing JWT middleware, enforce role-based authorization, keep JSON-only responses, and add integration tests for success and failure cases.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `jsonwebtoken`, `bcrypt`, `jest`, `supertest`  
**Storage**: SQLite via Prisma (`prisma/schema.prisma`, `src/store/ideaStore.js`)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js server runtime (local dev + CI)
**Project Type**: Single-project web API  
**Performance Goals**: Evaluation update and fetch paths p95 <= 2s under normal MVP load  
**Constraints**: JWT required on evaluation endpoints; only `admin` role may change status; statuses limited to `under_review|accepted|rejected`; all responses JSON  
**Scale/Scope**: One service, one evaluation write endpoint, existing ideas read/create endpoints with expanded model fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts are explicit for route/store/middleware interactions and request/response shapes.
- **Lint gate (PASS)**: Plan includes lint run and cleanup before merge.
- **Testing gate (PASS)**: Business logic changes are covered with Jest + Supertest integration tests for all critical paths.
- **Coverage gate (PASS)**: Plan preserves >=80% business-logic line coverage.
- **Security gate (PASS)**: JWT secret remains env-based (`JWT_SECRET`), no secrets added to repository.
- **Commit gate (PASS)**: Work is split into small intent-focused commits (store shape, route auth/authorization, validation, tests, docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-idea-evaluation/
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
├── middlewares/
│   └── auth.js
├── routes/
│   ├── auth.js
│   └── ideas.js
└── store/
    ├── userStore.js
    └── ideaStore.js

tests/
├── smoke.test.js
├── auth.test.js
└── ideas.test.js
```

**Structure Decision**: Keep single-project Express API and implement evaluation in existing `ideas` route/store modules to minimize churn and maximize reuse.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Data model and contract define allowed status enum and response fields.
- **Lint gate (PASS)**: Design artifacts include verification step for lint and tests.
- **Testing gate (PASS)**: Integration tests explicitly include success, unauthorized, forbidden, invalid-status, and not-found flows.
- **Coverage gate (PASS)**: Test additions keep business-logic coverage target >=80%.
- **Security gate (PASS)**: JWT verification and role checks rely on existing middleware with env-based secret handling.
- **Commit gate (PASS)**: Planned changes remain decomposed into reviewable commit slices.
