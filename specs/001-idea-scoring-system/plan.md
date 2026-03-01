# Implementation Plan: Idea Scoring System

**Branch**: `001-idea-scoring-system` | **Date**: 2026-03-01 | **Spec**: `/specs/001-idea-scoring-system/spec.md`
**Input**: Feature specification from `/specs/001-idea-scoring-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add admin-driven idea scoring with three criteria (impact, feasibility, innovation), persist criterion and total scores, provide ranked list retrieval by total score, and expose score breakdown with ranking in UI.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `@prisma/client`, existing frontend JS in `public/app.js`  
**Storage**: SQLite via Prisma (`Idea` model extensions for scoring fields)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js API server + browser frontend
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Ranked list and score-detail responses should remain within existing local UX expectations (p95 <= 2 seconds)  
**Constraints**: Only admins can score; score values must be integer 1-5; ranking must be deterministic for tied totals  
**Scale/Scope**: Add scoring to existing idea evaluation flow, one ranked listing endpoint, and UI score/rank rendering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript business-logic contracts for scoring payload, persistence fields, and ranked response shape will be explicit in route/store boundaries.
- **Lint gate (PASS)**: Planned edits remain in existing linted API/UI/test files.
- **Testing gate (PASS)**: Plan includes integration tests for score validation, persistence, and ranked ordering.
- **Coverage gate (PASS)**: New business-logic branches (validation, ranking, tie handling, role checks) are directly test-covered to preserve >=80% line coverage.
- **Security gate (PASS)**: No secret handling changes; existing auth model is reused for admin-only scoring actions.
- **Commit gate (PASS)**: Work can be sliced into scoring model, API endpoints, UI rendering, and tests/docs commits.

## Project Structure

### Documentation (this feature)

```text
specs/001-idea-scoring-system/
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

**Structure Decision**: Keep the existing single-project API + static UI structure and implement scoring/ranking in current idea route/store layers with matching UI and integration test updates.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Scoring payload and ranked response contracts are explicit and deterministic.
- **Lint gate (PASS)**: Planned changes remain in established route/store/UI/test files.
- **Testing gate (PASS)**: Test plan covers scoring validation, persistence, ranking, and visibility behaviors.
- **Coverage gate (PASS)**: Added scoring branches are all independently testable.
- **Security gate (PASS)**: Admin-only scoring enforcement reuses existing auth controls.
- **Commit gate (PASS)**: Work remains sliceable into small intent-focused commits.
