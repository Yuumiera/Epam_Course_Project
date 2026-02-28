# Implementation Plan: Idea Draft Management

**Branch**: `001-idea-draft-management` | **Date**: 2026-03-01 | **Spec**: `/specs/001-idea-draft-management/spec.md`
**Input**: Feature specification from `/specs/001-idea-draft-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a full draft lifecycle for ideas by supporting draft creation, creator-only draft edits, and explicit draft submission while enforcing visibility and authorization boundaries so submitters cannot view or mutate drafts they do not own.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `@prisma/client`, `jsonwebtoken`, `multer`  
**Storage**: SQLite via Prisma (`Idea` records with status and ownership fields)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js API server + browser frontend client
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Draft create/edit/submit requests should remain within existing MVP API latency targets (p95 under 2 seconds in local acceptance checks)  
**Constraints**: Ownership enforcement is mandatory; drafts must be hidden from non-creators; no secrets in repo; existing submitted-idea behavior remains intact  
**Scale/Scope**: Update idea creation/list/detail and introduce draft update + submit endpoints plus integration tests and API contract for draft lifecycle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts are explicitly defined via route-level validation and response shapes in spec + contract.
- **Lint gate (PASS)**: Changes remain in existing lintable modules; `npm test` remains the quality gate used in repository workflow.
- **Testing gate (PASS)**: Plan includes integration tests for draft creation, ownership filtering, edit authorization, and submit transition.
- **Coverage gate (PASS)**: New draft decision branches are covered in `tests/ideas.test.js` to preserve the 80% business-logic threshold.
- **Security gate (PASS)**: Authorization remains token-based; ownership checks prevent cross-user draft access; no secret-handling changes required.
- **Commit gate (PASS)**: Work can be split into focused commits (route/store behavior, contract/docs, tests).

## Project Structure

### Documentation (this feature)

```text
specs/001-idea-draft-management/
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
```

**Structure Decision**: Keep the existing single-project Express API + static frontend layout. Implement draft lifecycle behavior in `src/routes/ideas.js` and `src/store/ideaStore.js`, with coverage in `tests/ideas.test.js` and no new architectural layers.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Request/response contracts for draft endpoints are documented and map to route validation behavior.
- **Lint gate (PASS)**: Planned edits stay within existing project conventions and scripts.
- **Testing gate (PASS)**: Integration tests cover key draft lifecycle and authorization scenarios.
- **Coverage gate (PASS)**: New logic branches (ownership checks, state transition guards, visibility filters) are directly testable.
- **Security gate (PASS)**: Access control boundaries are strengthened for creator-only draft operations.
- **Commit gate (PASS)**: Plan remains sliceable into small, intent-focused commits.
