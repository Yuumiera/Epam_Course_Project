# Tasks: Multi-Stage Review Workflow

**Input**: Design documents from `/specs/001-review-workflow/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for all review transition and history business logic changes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align contracts/docs/tests before implementation starts.

- [ ] T001 Confirm workflow status contract in specs/001-review-workflow/contracts/review-workflow-api.yaml
- [ ] T002 [P] Confirm manual scenario flow in specs/001-review-workflow/quickstart.md
- [ ] T003 [P] Identify evaluation-related tests to extend in tests/evaluation.test.js and tests/ideas.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared model and transition primitives used by all stories.

**⚠️ CRITICAL**: No user story work should begin before this phase is complete.

- [ ] T004 Add evaluation history model/entity in prisma/schema.prisma
- [ ] T005 [P] Update store mappings for history serialization in src/store/ideaStore.js
- [ ] T006 [P] Define allowed transition graph constants (`submitted -> under_review -> approved_for_final -> accepted/rejected`) in src/routes/ideas.js
- [ ] T007 Add helper for transition validation in src/routes/ideas.js
- [ ] T008 Ensure transition + history append are performed consistently in src/store/ideaStore.js

**Checkpoint**: Transition and history foundation is complete.

---

## Phase 3: User Story 1 - Admin Advances Review Stages (Priority: P1) 🎯 MVP

**Goal**: Admin can move ideas only through allowed review transitions.

**Independent Test**: Admin can perform valid transitions; invalid/skipped transitions and non-admin attempts are rejected.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration test for `submitted -> under_review` in tests/evaluation.test.js
- [ ] T010 [P] [US1] Add failing integration test for `under_review -> approved_for_final` in tests/evaluation.test.js
- [ ] T011 [P] [US1] Add failing integration test for `approved_for_final -> accepted` and `approved_for_final -> rejected` in tests/evaluation.test.js
- [ ] T012 [P] [US1] Add failing integration test for disallowed transition rejection (skip-stage) in tests/evaluation.test.js
- [ ] T013 [P] [US1] Add failing integration test for non-admin transition rejection in tests/evaluation.test.js

### Implementation for User Story 1

- [ ] T014 [US1] Extend allowed status set with `approved_for_final` in src/routes/ideas.js
- [ ] T015 [US1] Enforce transition graph validation in PATCH /ideas/:id/status route in src/routes/ideas.js
- [ ] T016 [US1] Preserve admin-only enforcement for status transitions in src/routes/ideas.js
- [ ] T017 [US1] Return deterministic invalid-transition error response in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable (MVP).

---

## Phase 4: User Story 2 - Capture Evaluation History (Priority: P2)

**Goal**: Each successful transition appends immutable history entry with status/comment/reviewerId/timestamp.

**Independent Test**: Multiple transitions create ordered history entries without overwriting prior entries.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T018 [P] [US2] Add failing integration test that successful transition appends one history entry in tests/evaluation.test.js
- [ ] T019 [P] [US2] Add failing integration test that history entry includes `status`, `comment`, `reviewerId`, `timestamp` in tests/evaluation.test.js
- [ ] T020 [P] [US2] Add failing integration test that prior history entries remain after later transitions in tests/evaluation.test.js
- [ ] T021 [P] [US2] Add failing integration test that idea detail includes evaluationHistory array in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T022 [US2] Implement store method to append evaluation history during status transition in src/store/ideaStore.js
- [ ] T023 [US2] Include reviewerId and timestamp population in history creation path in src/store/ideaStore.js
- [ ] T024 [US2] Ensure route passes reviewer identity + comment into transition/store layer in src/routes/ideas.js
- [ ] T025 [US2] Expose evaluationHistory in idea detail response in src/routes/ideas.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - View Review Timeline in UI (Priority: P3)

**Goal**: Idea detail UI shows chronological review history timeline and empty state when none.

**Independent Test**: Detail panel shows timeline entries with required fields and empty-history message when no entries exist.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T026 [P] [US3] Add failing API integration assertion for chronological evaluationHistory ordering in tests/ideas.test.js
- [ ] T027 [P] [US3] Add failing API integration assertion for empty history state payload in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T028 [US3] Render timeline section in idea detail panel in public/app.js
- [ ] T029 [US3] Show each timeline item with status, reviewerId, timestamp, and optional comment in public/app.js
- [ ] T030 [US3] Show clear empty-history UI state when evaluationHistory is empty in public/app.js
- [ ] T031 [US3] Add minimal timeline presentation styles in public/style.css

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, regression confidence, and documentation updates.

- [ ] T032 [P] Update workflow and timeline behavior docs in README.md and/or PROJECT_SUMMARY.md
- [ ] T033 [P] Cross-check endpoint behavior vs specs/001-review-workflow/contracts/review-workflow-api.yaml
- [ ] T034 Run Prisma sync and verify schema changes with `npm run prisma:push`
- [ ] T035 Run targeted tests with `npm test -- evaluation.test.js` and `npm test -- ideas.test.js`
- [ ] T036 Run full regression with `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2 and transition flow from US1
- **Phase 5 (US3)**: Depends on Phase 2 and history exposure from US2
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on US1 transition path and shared model foundation
- **US3 (P3)**: Depends on US2 history data availability

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel.
- US1 tests: T009–T013 can run in parallel.
- US2 tests: T018–T021 can run in parallel.
- US3: T028 and T031 can run in parallel.
- Polish: T032 and T033 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 (US1) transition controls and authorization.
3. Validate transition matrix independently before history/timeline additions.

### Incremental Delivery

1. Ship US1 (strict transition workflow).
2. Ship US2 (append-only evaluation history).
3. Ship US3 (timeline visualization in detail UI).
4. Finalize with polish and full regression.
