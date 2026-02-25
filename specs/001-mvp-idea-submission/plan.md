# Implementation Plan: MVP Idea Submission for InnovatEPAM Portal

**Branch**: `001-mvp-idea-submission` | **Date**: 2026-02-25 | **Spec**: `/specs/001-mvp-idea-submission/spec.md`
**Input**: Feature specification from `/specs/001-mvp-idea-submission/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement MVP idea submission endpoints where authenticated users can create ideas (`title`, `description`, `category`) with default status `submitted`, and all users can list ideas and view ideas by ID. Use an in-memory idea store and JSON-only API responses, reusing existing auth middleware context for protected creation endpoint.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, existing auth stack (`jsonwebtoken`, `bcrypt`)  
**Storage**: In-memory idea store (`src/store/ideaStore.js`) for MVP  
**Testing**: `jest` + `supertest` integration and route/service unit tests  
**Target Platform**: Node.js server runtime (local + CI)
**Project Type**: Single-project web API  
**Performance Goals**: Create/list/get idea endpoints p95 <= 2s under normal test load  
**Constraints**: JSON-only responses; create endpoint requires authentication; idea default status is `submitted`; in-memory persistence only for MVP  
**Scale/Scope**: MVP scope for one service with three idea endpoints (create/list/get-by-id)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts will be defined for idea store/service/routes and documented in contracts.
- **Lint gate (PASS)**: Plan includes maintaining lint script and fixing route/service lint findings.
- **Testing gate (PASS)**: Plan includes Jest+Supertest tests for create/list/get and auth-protected create behavior.
- **Coverage gate (PASS)**: Plan includes maintaining >=80% line coverage for idea business logic.
- **Security gate (PASS)**: No secrets introduced; auth dependency remains environment-based.
- **Commit gate (PASS)**: Work is split into small commits by capability (store, routes, middleware integration, tests, docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-idea-submission/
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
├── routes/
│   ├── auth.js
│   └── ideas.js
├── services/
│   ├── authService.js
│   └── ideaService.js
└── store/
    ├── userStore.js
    └── ideaStore.js

tests/
├── auth.test.js
└── ideas.test.js
```

**Structure Decision**: Keep single-project Express API and add isolated idea store/service/route layers to preserve MVP simplicity with clear separation of concerns.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Data model and API contract define stable request/response shapes for idea endpoints.
- **Lint gate (PASS)**: Quickstart requires lint run before merge.
- **Testing gate (PASS)**: Design includes integration tests for all primary user flows.
- **Coverage gate (PASS)**: Coverage target >=80% maintained for idea business logic.
- **Security gate (PASS)**: No additional secrets introduced; authentication behavior preserved.
- **Commit gate (PASS)**: Implementation remains decomposed into small reviewable commits.
