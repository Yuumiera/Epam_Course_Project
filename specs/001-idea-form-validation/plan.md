# Implementation Plan: Phase 2 Smart Idea Submission Form Improvements

**Branch**: `001-idea-form-validation` | **Date**: 2026-02-27 | **Spec**: `/specs/001-idea-form-validation/spec.md`
**Input**: Feature specification from `/specs/001-idea-form-validation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Strengthen the idea creation workflow by introducing robust server-side validation for `title`, `description`, and `category`, returning consistent `400` field-level JSON errors, and upgrading the frontend form with inline validation plus submit-button gating until the form is valid.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `@prisma/client`, `jsonwebtoken`, `multer`  
**Storage**: SQLite via Prisma (`prisma/schema.prisma`)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js server runtime + browser frontend
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Validation response p95 under 2 seconds for idea-create requests under normal MVP load  
**Constraints**: Maintain existing idea endpoint contract for successful requests; return JSON for all outcomes; no secret values committed  
**Scale/Scope**: One endpoint behavior update (`POST /ideas`) and one form UX upgrade in `public/app.js`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts and request/response shapes are explicitly defined in spec, research, and contract artifacts.
- **Lint gate (PASS)**: No new linting exceptions are introduced; implementation includes running existing repository checks before merge.
- **Testing gate (PASS)**: Plan includes API validation tests and frontend-facing validation behavior coverage in integration flow tests.
- **Coverage gate (PASS)**: Validation additions are targeted and test-backed, preserving >=80% business-logic line coverage.
- **Security gate (PASS)**: Validation enhancements do not change secret handling; env-based auth secret usage remains unchanged.
- **Commit gate (PASS)**: Work is sliceable into focused commits (server validation, error schema, frontend UX, tests, docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-idea-form-validation/
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
├── middlewares/
│   ├── auth.js
│   └── upload.js
├── services/
│   └── authService.js
├── store/
│   ├── userStore.js
│   └── ideaStore.js
└── lib/
    └── prisma.js

public/
├── index.html
├── app.js
└── style.css

prisma/
└── schema.prisma

tests/
├── auth.test.js
├── ideas.test.js
├── evaluation.test.js
└── smoke.test.js
```

**Structure Decision**: Keep the existing single-project Express + static frontend structure; implement validation behavior in `src/routes/ideas.js` and `public/app.js` without introducing new architectural layers.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Data model and contract explicitly define field validation and error payload shapes.
- **Lint gate (PASS)**: Design changes are confined to existing modules and follow existing style conventions.
- **Testing gate (PASS)**: Planned artifacts include deterministic tests for invalid and valid submission paths.
- **Coverage gate (PASS)**: Validation branches are fully testable; no untestable business logic added.
- **Security gate (PASS)**: No sensitive data paths or secret handling changes introduced.
- **Commit gate (PASS)**: Plan supports small, meaningful commits aligned to validation and UX slices.

