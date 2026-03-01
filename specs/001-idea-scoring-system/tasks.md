# Tasks: Idea Scoring System

**Input**: Design documents from `/specs/001-idea-scoring-system/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for scoring validation, persistence, ranking order, and UI score visibility.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align scoring contract, docs, and test targets before implementation.

- [ ] T001 Confirm scoring and ranked-list contract coverage in specs/001-idea-scoring-system/contracts/idea-scoring-api.yaml
- [ ] T002 [P] Confirm role and validation expectations in specs/001-idea-scoring-system/quickstart.md
- [ ] T003 [P] Identify existing idea/evaluation tests to extend in tests/ideas.test.js and tests/evaluation.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish data model and shared scoring helpers.

**⚠️ CRITICAL**: No user story work should begin before this phase is complete.

- [ ] T004 Add scoring fields and persistence model updates in prisma/schema.prisma
- [ ] T005 [P] Add store-layer DTO mapping for criterion scores and total score in src/store/ideaStore.js
- [ ] T006 [P] Add scoring validation helper(s) for integer 1-5 criteria in src/routes/ideas.js
- [ ] T007 Add deterministic ranking strategy (tie-break rule) in store/query layer in src/store/ideaStore.js

**Checkpoint**: Shared scoring foundation is complete.

---

## Phase 3: User Story 1 - Admin Scores Ideas (Priority: P1) 🎯 MVP

**Goal**: Admin can submit impact/feasibility/innovation scores and persist total score.

**Independent Test**: Submit valid and invalid score payloads as admin and verify persistence + validation behavior.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T008 [P] [US1] Add failing integration test for admin scoring success via `PATCH /ideas/:id/score` in tests/evaluation.test.js
- [ ] T009 [P] [US1] Add failing integration test for invalid score range/type rejection in tests/evaluation.test.js
- [ ] T010 [P] [US1] Add failing integration test for non-admin scoring forbidden behavior in tests/evaluation.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Implement admin-only scoring endpoint `PATCH /ideas/:id/score` in src/routes/ideas.js
- [ ] T012 [US1] Persist criterion scores and computed total score in src/store/ideaStore.js
- [ ] T013 [US1] Ensure score update behavior is deterministic on re-score requests in src/routes/ideas.js and src/store/ideaStore.js

**Checkpoint**: US1 is independently functional and testable (MVP).

---

## Phase 4: User Story 2 - Ranked Idea Listing (Priority: P2)

**Goal**: Authenticated users can fetch ideas sorted by total score with deterministic tie handling.

**Independent Test**: Score multiple ideas, request ranked endpoint, verify descending total score order and consistent tie order.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T014 [P] [US2] Add failing integration test for `GET /ideas/ranked` descending total score order in tests/ideas.test.js
- [ ] T015 [P] [US2] Add failing integration test for deterministic tie ordering in tests/ideas.test.js
- [ ] T016 [P] [US2] Add failing integration test verifying ranked payload includes criterion breakdown and total score in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T017 [US2] Implement ranked list endpoint `GET /ideas/ranked` in src/routes/ideas.js
- [ ] T018 [US2] Implement ranked query and rank numbering logic in src/store/ideaStore.js
- [ ] T019 [US2] Ensure ideas without score are placed after scored ideas with deterministic order in src/store/ideaStore.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - UI Score Breakdown and Ranking (Priority: P3)

**Goal**: UI displays rank plus impact/feasibility/innovation/total score per idea.

**Independent Test**: Open ranking view after scoring ideas and verify rank + score breakdown rendering.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T020 [P] [US3] Add/adjust integration test validating UI-consumable ranking payload shape in tests/ideas.test.js
- [ ] T021 [P] [US3] Add/adjust regression test ensuring existing idea detail/list flows remain valid with score fields in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T022 [US3] Update frontend data loading for ranked ideas in public/app.js
- [ ] T023 [US3] Render score breakdown and rank in idea list/detail UI in public/app.js and public/index.html
- [ ] T024 [US3] Add minimal style adjustments for score/rank readability in public/style.css

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs alignment, and regression confidence.

- [ ] T025 [P] Update feature behavior summary in README.md and/or PROJECT_SUMMARY.md
- [ ] T026 [P] Verify quickstart examples match final endpoint behavior in specs/001-idea-scoring-system/quickstart.md
- [ ] T027 [P] Verify contract examples align with implementation in specs/001-idea-scoring-system/contracts/idea-scoring-api.yaml
- [ ] T028 Run targeted suites with `npm test -- ideas.test.js` and `npm test -- evaluation.test.js`
- [ ] T029 Run full regression with `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2 and uses persisted scoring from US1
- **Phase 5 (US3)**: Depends on Phase 4 ranked data contracts
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on US1 score persistence
- **US3 (P3)**: Depends on US2 ranked payload

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel.
- US1 tests: T008, T009, T010 can run in parallel.
- US2 tests: T014, T015, T016 can run in parallel.
- US3 tests: T020 and T021 can run in parallel.
- Polish: T025, T026, and T027 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 with admin scoring + total persistence.
3. Validate score input and authorization behavior.

### Incremental Delivery

1. Ship US1 (admin scoring and validation).
2. Ship US2 (ranked endpoint and deterministic ordering).
3. Ship US3 (UI score/rank visibility).
4. Finish polish and full regression.
