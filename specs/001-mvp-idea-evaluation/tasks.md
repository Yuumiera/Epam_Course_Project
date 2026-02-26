# Tasks: MVP Idea Evaluation Workflow

**Input**: Design documents from `/specs/001-mvp-idea-evaluation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Integration tests are REQUIRED for all evaluation business logic stories.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare evaluation feature docs and test entry points.

- [ ] T001 Confirm evaluation test script usage in package.json
- [ ] T002 [P] Add evaluation workflow run notes in specs/001-mvp-idea-evaluation/quickstart.md
- [ ] T003 [P] Ensure evaluation test file scaffold exists in tests/evaluation.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared route/store validation primitives required by all stories.

**⚠️ CRITICAL**: No user story implementation begins before this phase completes.

- [ ] T004 Confirm Prisma idea model supports evaluation fields (`status`, `comment`) in prisma/schema.prisma
- [ ] T005 [P] Implement store helper for evaluation update persistence in src/store/ideaStore.js
- [ ] T006 [P] Implement reusable admin-role authorization helper in src/routes/ideas.js
- [ ] T007 Add PATCH /ideas/:id/status route scaffold with auth middleware in src/routes/ideas.js
- [ ] T008 Wire status enum constants for evaluation flow in src/routes/ideas.js

**Checkpoint**: Foundation ready; user-story implementation can now proceed independently.

---

## Phase 3: User Story 1 - Admin Updates Idea Status (Priority: P1) 🎯 MVP

**Goal**: Admin can update idea to under_review/accepted/rejected with optional comment.

**Independent Test**: Admin token updates status and receives `200` JSON including `id`, `status`, `comment`.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration test for admin status update success in tests/evaluation.test.js
- [ ] T010 [P] [US1] Add failing integration test for optional comment persistence in tests/evaluation.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Implement PATCH /ideas/:id/status success path in src/routes/ideas.js
- [ ] T012 [US1] Persist normalized status/comment via store update helper in src/routes/ideas.js
- [ ] T013 [US1] Return JSON response shape `{ id, status, comment }` in src/routes/ideas.js

**Checkpoint**: US1 delivers core admin evaluation workflow.

---

## Phase 4: User Story 2 - Enforce Access Control (Priority: P2)

**Goal**: Only admins can change status, and auth failures return JSON errors.

**Independent Test**: Missing/invalid JWT gets `401`; non-admin authenticated request gets `403`.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T014 [P] [US2] Add failing integration test for missing token on evaluation endpoint in tests/evaluation.test.js
- [ ] T015 [P] [US2] Add failing integration test for non-admin forbidden update in tests/evaluation.test.js

### Implementation for User Story 2

- [ ] T016 [US2] Enforce JSON 401 Unauthorized via auth middleware for evaluation endpoint in src/middlewares/auth.js
- [ ] T017 [US2] Enforce JSON 403 Forbidden for non-admin users in src/routes/ideas.js
- [ ] T018 [US2] Ensure evaluation route applies auth before admin-role guard in src/routes/ideas.js

**Checkpoint**: Access control is correct and independently testable.

---

## Phase 5: User Story 3 - Validate Evaluation Input (Priority: P3)

**Goal**: Invalid status/comment and missing idea produce deterministic JSON errors.

**Independent Test**: Invalid status returns `400`; unknown idea returns `404`.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T019 [P] [US3] Add failing integration test for invalid status value in tests/evaluation.test.js
- [ ] T020 [P] [US3] Add failing integration test for unknown idea id in tests/evaluation.test.js
- [ ] T021 [P] [US3] Add failing integration test for non-string comment validation in tests/evaluation.test.js

### Implementation for User Story 3

- [ ] T022 [US3] Validate status enum under_review|accepted|rejected in src/routes/ideas.js
- [ ] T023 [US3] Validate comment type and empty-string normalization in src/routes/ideas.js
- [ ] T024 [US3] Return JSON 404 Not found for missing idea on evaluation update in src/routes/ideas.js

**Checkpoint**: Validation and not-found behavior complete for evaluation workflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure consistency, docs, and quality gates across all stories.

- [ ] T025 [P] Add JSON content-type assertions for all evaluation outcomes in tests/evaluation.test.js
- [ ] T026 [P] Ensure database reset helpers run before each evaluation test in tests/evaluation.test.js
- [ ] T027 Run full test suite and verify evaluation scenarios via npm test in package.json
- [ ] T028 Update evaluation workflow examples in specs/001-mvp-idea-evaluation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks user stories.
- **Phase 3 (US1)**: Depends on Phase 2 and delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed independently.
- **Phase 5 (US3)**: Depends on Phase 2 and can proceed independently.
- **Phase 6 (Polish)**: Depends on completed target stories.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational work.
- **US2 (P2)**: Independent after foundational work; no direct dependency on US1 behavior.
- **US3 (P3)**: Independent after foundational work; no direct dependency on US2 behavior.

### Within Each User Story

- Write tests first and confirm they fail.
- Implement route/store/middleware behavior.
- Re-run story tests to confirm pass.

---

## Parallel Opportunities

- T002 and T003 can run in parallel.
- T005 and T006 can run in parallel.
- T009 and T010 can run in parallel.
- T014 and T015 can run in parallel.
- T019, T020, and T021 can run in parallel.
- T025 and T026 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T009 in tests/evaluation.test.js
- Parallel task B: T010 in tests/evaluation.test.js
- Parallel task C: T011 in src/routes/ideas.js

---

## Parallel Example: User Story 2

- Parallel task A: T014 in tests/evaluation.test.js
- Parallel task B: T015 in tests/evaluation.test.js
- Parallel task C: T017 in src/routes/ideas.js

---

## Parallel Example: User Story 3

- Parallel task A: T019 in tests/evaluation.test.js
- Parallel task B: T020 in tests/evaluation.test.js
- Parallel task C: T021 in tests/evaluation.test.js

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 and validate admin success + optional comment behavior.
3. Demo MVP evaluation update flow.

### Incremental Delivery

1. Ship US1 (admin success path).
2. Add US2 (authorization correctness).
3. Add US3 (validation + not-found safety).
4. Finish polish and docs.

### Frequent Commit Plan

1. Commit A: T001-T005 (setup + store primitives).
2. Commit B: T006-T008 (middleware + route scaffolding).
3. Commit C: T009-T013 (US1 tests + implementation).
4. Commit D: T014-T018 (US2 tests + access control).
5. Commit E: T019-T024 (US3 tests + validation).
6. Commit F: T025-T028 (polish + quality verification).
