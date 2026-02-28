# Implementation Plan: Blind Review Identity Masking

**Branch**: `001-blind-review` | **Date**: 2026-03-01 | **Spec**: `/specs/001-blind-review/spec.md`
**Input**: Feature specification from `/specs/001-blind-review/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement blind review by removing submitter identity fields from admin review-facing responses while preserving submitter self-identity in personal view and keeping evaluation endpoints fully operational.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `@prisma/client`, `jsonwebtoken`, existing frontend JS in `public/app.js`  
**Storage**: SQLite via Prisma (`Idea`, `User`, evaluation history records already in use)  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js API server + browser frontend
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Identity masking checks should not materially impact baseline idea list/detail and evaluation response times (p95 <= 2 seconds in local validation)  
**Constraints**: Admin review responses must not leak creator identity; submitter-owned personal view must retain own identity; evaluation behavior must remain unchanged  
**Scale/Scope**: Adjust response shaping for list/detail/evaluation contexts, update UI display logic for role-aware identity visibility, and extend integration tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript response contracts will explicitly define masked and unmasked identity field sets by context.
- **Lint gate (PASS)**: Planned edits stay in existing lintable API/UI modules and test files.
- **Testing gate (PASS)**: Plan includes integration coverage for admin-masked responses and submitter personal-view visibility.
- **Coverage gate (PASS)**: New role/context branching in response shaping will be covered to preserve >=80% business-logic coverage.
- **Security gate (PASS)**: Blind review reduces identity exposure and introduces no secret-handling changes.
- **Commit gate (PASS)**: Work can be split into focused commits (response shaping, endpoint continuity, UI behavior, tests/docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-blind-review/
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

**Structure Decision**: Keep current single-project API + static UI structure and apply role-aware response shaping in existing idea routes/store with companion UI adjustments and integration tests.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Masked/unmasked response contracts are deterministic by role and context.
- **Lint gate (PASS)**: Planned edits stay in established route/store/UI files.
- **Testing gate (PASS)**: Tests include both masked admin view and submitter personal-view identity visibility.
- **Coverage gate (PASS)**: New conditional branches for context-aware response shaping are directly testable.
- **Security gate (PASS)**: Blind review objective is achieved through least-exposure response design.
- **Commit gate (PASS)**: Plan remains sliceable into small, intent-focused commits.
