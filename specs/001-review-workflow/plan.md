# Implementation Plan: Multi-Stage Review Workflow

**Branch**: `001-review-workflow` | **Date**: 2026-03-01 | **Spec**: `/specs/001-review-workflow/spec.md`
**Input**: Feature specification from `/specs/001-review-workflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a multi-stage admin review lifecycle with strict transition rules (`submitted -> under_review -> approved_for_final -> accepted/rejected`), persist immutable evaluation history on each successful transition, and expose a timeline in idea detail UI.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `@prisma/client`, `jsonwebtoken`, existing frontend JS in `public/app.js`  
**Storage**: SQLite via Prisma (`Idea` records + new persisted evaluation history records)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js API server + browser-based frontend
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Review status update and idea detail load paths remain within normal MVP latency (p95 <= 2 seconds in local validation)  
**Constraints**: Only admins can transition status, transitions must follow allowed graph, history write must be consistent with status update, no secrets in repo  
**Scale/Scope**: Update evaluation endpoint rules, extend data model/store for history, return history in idea detail response, render timeline in UI, and add integration coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts for transition validation and history payloads are explicitly defined in route/store/contracts.
- **Lint gate (PASS)**: Implementation stays within existing lintable modules and repository scripts.
- **Testing gate (PASS)**: Plan includes integration tests for valid/invalid transitions, admin-only access, and timeline data exposure.
- **Coverage gate (PASS)**: New decision branches (transition rules + authorization + history persistence) will be test-covered to preserve >=80% business-logic coverage.
- **Security gate (PASS)**: Admin-only controls rely on existing JWT + role model; no secret handling changes required.
- **Commit gate (PASS)**: Work can be split into focused commits (model/store, route rules, timeline UI, tests/docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-review-workflow/
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
├── store/
│   ├── userStore.js
│   └── ideaStore.js
└── lib/
    └── prisma.js

public/
├── index.html
├── app.js
└── style.css

tests/
├── auth.test.js
├── ideas.test.js
├── evaluation.test.js
└── smoke.test.js

prisma/
└── schema.prisma
```

**Structure Decision**: Keep the existing single-project Express + static UI architecture. Add transition and history behavior in existing route/store modules, extend Prisma schema for history records, and render timeline in existing idea detail UI.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Status transition graph and history payload fields are deterministic in contract and data model.
- **Lint gate (PASS)**: Planned edits remain in established route/store/frontend files.
- **Testing gate (PASS)**: Integration tests include transition enforcement, history creation, and timeline visibility behavior.
- **Coverage gate (PASS)**: New branches around transitions/authorization/history are directly testable in existing suite.
- **Security gate (PASS)**: Admin-only transition checks and JWT-based auth remain enforced.
- **Commit gate (PASS)**: Plan supports small, intent-focused commits by feature slice.
