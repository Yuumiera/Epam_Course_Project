# Tasks: MVP Idea Evaluation Workflow

**Input**: Design documents from `/specs/001-mvp-idea-evaluation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/idea-evaluation-api.yaml

**Tests**: Integration tests are REQUIRED for evaluation business logic.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare repo for evaluation feature development and verification.

- [ ] T001 Verify npm test command for integration runs in package.json
- [ ] T002 [P] Add evaluation workflow section in README.md
- [ ] T003 [P] Create evaluation test scaffold in tests/ideaEvaluation.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared structures required by all user stories.

- [ ] T004 Extend idea shape for evaluation comment handling in src/store/ideaStore.js
- [ ] T005 [P] Add store update helper for status/comment mutation in src/store/ideaStore.js
- [ ] T006 [P] Add reusable admin-role guard middleware in src/middlewares/adminOnly.js
- [ ] T007 Add route scaffold for PATCH /ideas/:id/status in src/routes/ideas.js
- [ ] T008 Wire middleware chain auth+admin for evaluation route in src/routes/ideas.js

**Checkpoint**: Core infrastructure is ready for user-story implementation.

---

## Phase 3: User Story 1 - Admin Updates Idea Status (Priority: P1) 🎯 MVP

**Goal**: Admin can update idea to under_review/accepted/rejected with optional comment.

**Independent Test**: Admin token updates status and receives `200` JSON including `id`, `status`, `comment`.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration test for admin update success in tests/ideaEvaluation.test.js
- [ ] T010 [P] [US1] Add failing integration test for optional comment persistence in tests/ideaEvaluation.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Implement PATCH /ideas/:id/status success path in src/routes/ideas.js
- [ ] T012 [US1] Normalize and persist optional comment in src/routes/ideas.js
- [ ] T013 [US1] Return JSON response shape { id, status, comment } in src/routes/ideas.js

**Checkpoint**: US1 delivers core admin evaluation workflow.

---

## Phase 4: User Story 2 - Enforce Access Control (Priority: P2)

**Goal**: Only admins can change status, and auth failures return JSON errors.

**Independent Test**: Missing/invalid JWT gets `401`; non-admin authenticated request gets `403`.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T014 [P] [US2] Add failing integration test for missing token on evaluation endpoint in tests/ideaEvaluation.test.js
- [ ] T015 [P] [US2] Add failing integration test for non-admin forbidden update in tests/ideaEvaluation.test.js

### Implementation for User Story 2

- [ ] T016 [US2] Enforce JSON 401 Unauthorized via auth middleware for evaluation endpoint in src/middlewares/auth.js
- [ ] T017 [US2] Enforce JSON 403 Forbidden for non-admin users in src/middlewares/adminOnly.js
- [ ] T018 [US2] Ensure evaluation route uses auth then admin middleware order in src/routes/ideas.js

**Checkpoint**: Access control is correct and independently testable.

---

## Phase 5: User Story 3 - Validate Evaluation Input (Priority: P3)

**Goal**: Invalid status/comment and missing idea produce deterministic JSON errors.

**Independent Test**: Invalid status returns `400`; unknown idea returns `404`.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T019 [P] [US3] Add failing integration test for invalid status value in tests/ideaEvaluation.test.js
- [ ] T020 [P] [US3] Add failing integration test for unknown idea id in tests/ideaEvaluation.test.js
- [ ] T021 [P] [US3] Add failing integration test for non-string comment validation in tests/ideaEvaluation.test.js

### Implementation for User Story 3

- [ ] T022 [US3] Validate status enum under_review|accepted|rejected in src/routes/ideas.js
- [ ] T023 [US3] Validate comment type and empty-string normalization in src/routes/ideas.js
- [ ] T024 [US3] Return JSON 404 Not found for missing idea on evaluation update in src/routes/ideas.js

**Checkpoint**: Validation and not-found behavior complete for evaluation workflow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure consistency, docs, and quality gates across all stories.

- [ ] T025 [P] Add JSON content-type assertions for all evaluation outcomes in tests/ideaEvaluation.test.js
- [ ] T026 [P] Reset user and idea stores in test setup for isolation in tests/ideaEvaluation.test.js
- [ ] T027 Run full test suite and verify coverage gate in package.json
- [ ] T028 Update feature quick checks and examples in specs/001-mvp-idea-evaluation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks user stories.
- **Phase 3 (US1)**: Depends on Phase 2 and delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed in parallel with US3 after foundational completion.
- **Phase 5 (US3)**: Depends on Phase 2 and can proceed in parallel with US2 after foundational completion.
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

## Parallel Example: User Story 3

- Parallel task A: T019 in tests/ideaEvaluation.test.js
- Parallel task B: T020 in tests/ideaEvaluation.test.js
- Parallel task C: T021 in tests/ideaEvaluation.test.js

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
