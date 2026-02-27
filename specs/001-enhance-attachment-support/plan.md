# Implementation Plan: Enhanced Idea Attachments

**Branch**: `001-enhance-attachment-support` | **Date**: 2026-02-27 | **Spec**: `/specs/001-enhance-attachment-support/spec.md`
**Input**: Feature specification from `/specs/001-enhance-attachment-support/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enhance idea attachments by enforcing strict upload validation (type + size), persisting consistent attachment metadata, adding authenticated attachment retrieval, and exposing attachment download/view actions in the idea detail UI.

## Technical Context

**Language/Version**: JavaScript (Node.js >=18 runtime)  
**Primary Dependencies**: `express`, `multer`, `@prisma/client`, `jsonwebtoken`  
**Storage**: SQLite via Prisma plus server file storage for uploaded attachments  
**Testing**: Jest + Supertest integration tests (`tests/*.test.js`)  
**Target Platform**: Node.js server runtime + browser frontend
**Project Type**: Single-project web API with static frontend  
**Performance Goals**: Attachment upload validation and idea create responses complete within normal MVP request latency (p95 under 2 seconds)  
**Constraints**: Single attachment per idea, approved formats only, bounded file size, authenticated access for retrieval, no secrets in repository  
**Scale/Scope**: Update `POST /ideas`, idea detail response usage, attachment retrieval endpoint behavior, and idea detail UI download interaction

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Type safety gate (PASS)**: JavaScript module contracts for request/response payloads and validation outcomes are explicitly documented.
- **Lint gate (PASS)**: Implementation remains within existing lintable modules and commands.
- **Testing gate (PASS)**: Plan includes integration coverage for upload validation, metadata persistence, and attachment retrieval.
- **Coverage gate (PASS)**: Branching logic in validation and retrieval paths is test-backed to preserve 80%+ business-logic coverage.
- **Security gate (PASS)**: Authenticated retrieval and input validation reduce risk; no secrets or credentials introduced.
- **Commit gate (PASS)**: Work can be split into focused commits (validation, metadata contract, retrieval endpoint, UI behavior, tests/docs).

## Project Structure

### Documentation (this feature)

```text
specs/001-enhance-attachment-support/
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

**Structure Decision**: Keep the existing single-project Express + static frontend structure. Implement attachment behavior in existing upload middleware, `src/routes/ideas.js`, and `public/app.js` without introducing new architectural layers.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- **Type safety gate (PASS)**: Data model and contract define deterministic metadata and error payload shapes.
- **Lint gate (PASS)**: Planned edits stay in existing files and conventions.
- **Testing gate (PASS)**: Acceptance behavior is covered with integration tests.
- **Coverage gate (PASS)**: Validation and retrieval decision branches are directly testable.
- **Security gate (PASS)**: Attachment retrieval remains authenticated and constrained.
- **Commit gate (PASS)**: Plan supports small, intent-focused commits.
