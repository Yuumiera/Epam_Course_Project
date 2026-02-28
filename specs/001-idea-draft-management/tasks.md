# Tasks: Idea Draft Management

**Input**: Design documents from `/specs/001-idea-draft-management/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for all draft lifecycle business-logic changes in this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare contracts, docs, and baseline test entry points for draft lifecycle work.

- [ ] T001 Confirm draft endpoint contract aligns with existing API conventions in specs/001-idea-draft-management/contracts/idea-draft-api.yaml
- [ ] T002 [P] Confirm manual validation flow in specs/001-idea-draft-management/quickstart.md
- [ ] T003 [P] Identify draft-related assertions to extend in tests/ideas.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared draft-state and ownership primitives used by all stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T004 Add/confirm allowed idea statuses include `draft` and `submitted` in src/routes/ideas.js
- [ ] T005 [P] Add shared ownership guard utility for idea mutation access in src/routes/ideas.js
- [ ] T006 [P] Add store helper(s) for creator-scoped draft access/update in src/store/ideaStore.js
- [ ] T007 Define response behavior for hidden foreign drafts (for list/detail/mutation) in src/routes/ideas.js

**Checkpoint**: Draft ownership and status baseline is ready for story-by-story delivery.

---

## Phase 3: User Story 1 - Save Idea as Draft (Priority: P1) 🎯 MVP

**Goal**: Submitters can create ideas in `draft` status and drafts are not visible to other submitters.

**Independent Test**: Create draft as submitter A; verify status is `draft`; verify submitter B cannot see that draft in list/detail.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T008 [P] [US1] Add failing integration test for creating idea with `status: draft` in tests/ideas.test.js
- [ ] T009 [P] [US1] Add failing integration test for default create behavior remaining `submitted` when status omitted in tests/ideas.test.js
- [ ] T010 [P] [US1] Add failing integration test that foreign drafts are excluded from `GET /ideas` for other submitters in tests/ideas.test.js
- [ ] T011 [P] [US1] Add failing integration test that foreign draft `GET /ideas/:id` is denied or hidden per API rule in tests/ideas.test.js

### Implementation for User Story 1

- [ ] T012 [US1] Allow `POST /ideas` to accept explicit `draft` status while preserving current validation rules in src/routes/ideas.js
- [ ] T013 [US1] Keep `submitted` as default status when no status is provided in src/routes/ideas.js
- [ ] T014 [US1] Persist created draft ownership using authenticated user id in src/routes/ideas.js and src/store/ideaStore.js
- [ ] T015 [US1] Filter list results so draft ideas are visible only to creator in src/routes/ideas.js
- [ ] T016 [US1] Enforce detail visibility so non-creators cannot access another submitter’s draft in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable (MVP).

---

## Phase 4: User Story 2 - Edit Own Draft (Priority: P2)

**Goal**: Draft creator can update draft content via `PUT/PATCH /ideas/:id`; non-creators cannot.

**Independent Test**: Creator updates draft and sees persisted changes with status still `draft`; non-creator update attempt fails.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T017 [P] [US2] Add failing integration test for creator `PATCH /ideas/:id` draft update in tests/ideas.test.js
- [ ] T018 [P] [US2] Add failing integration test for creator `PUT /ideas/:id` draft update in tests/ideas.test.js
- [ ] T019 [P] [US2] Add failing integration test for non-creator draft update rejection in tests/ideas.test.js
- [ ] T020 [P] [US2] Add failing integration test that updating non-existent draft returns not-found response in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T021 [US2] Add `PATCH /ideas/:id` draft update endpoint with payload validation in src/routes/ideas.js
- [ ] T022 [US2] Add `PUT /ideas/:id` draft update endpoint with payload validation in src/routes/ideas.js
- [ ] T023 [US2] Restrict update endpoints to creator-owned ideas currently in `draft` status in src/routes/ideas.js
- [ ] T024 [US2] Add store update operation(s) for draft content changes in src/store/ideaStore.js
- [ ] T025 [US2] Ensure update responses preserve `draft` status and include normalized fields in src/routes/ideas.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Submit Finalized Draft (Priority: P3)

**Goal**: Draft creator can finalize draft via `PATCH /ideas/:id/submit`, transitioning status to `submitted`.

**Independent Test**: Creator submits own draft and receives `submitted`; non-creator and non-draft submit attempts fail.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T026 [P] [US3] Add failing integration test for creator draft submit success in tests/ideas.test.js
- [ ] T027 [P] [US3] Add failing integration test for non-creator draft submit rejection in tests/ideas.test.js
- [ ] T028 [P] [US3] Add failing integration test for submit endpoint rejecting already-submitted ideas in tests/ideas.test.js
- [ ] T029 [P] [US3] Add failing integration test for submiting non-existent draft returning not-found response in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T030 [US3] Add `PATCH /ideas/:id/submit` endpoint in src/routes/ideas.js
- [ ] T031 [US3] Enforce creator-only draft submit authorization in src/routes/ideas.js
- [ ] T032 [US3] Implement state-transition guard (`draft -> submitted` only) in src/routes/ideas.js
- [ ] T033 [US3] Add store operation for atomic draft submit transition in src/store/ideaStore.js
- [ ] T034 [US3] Return deterministic error responses for invalid state and missing idea in src/routes/ideas.js

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks across stories and documentation alignment.

- [ ] T035 [P] Update API documentation references in README.md and/or PROJECT_SUMMARY.md for draft lifecycle endpoints
- [ ] T036 [P] Cross-check route behavior against specs/001-idea-draft-management/contracts/idea-draft-api.yaml
- [ ] T037 Run targeted draft lifecycle tests with `npm test -- ideas.test.js`
- [ ] T038 Run full regression suite with `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2 and US1 ownership/visibility behavior
- **Phase 5 (US3)**: Depends on Phase 2 and draft existence from US1
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on US1 draft creation and ownership baseline
- **US3 (P3)**: Depends on US1 draft creation; independent of US2 edit behavior

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel after T004.
- US1 tests: T008, T009, T010, T011 can run in parallel.
- US2 tests: T017, T018, T019, T020 can run in parallel.
- US3 tests: T026, T027, T028, T029 can run in parallel.
- Polish: T035 and T036 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T008 in tests/ideas.test.js
- Parallel task B: T010 in tests/ideas.test.js
- Parallel task C: T012 in src/routes/ideas.js (after tests are added)

---

## Parallel Example: User Story 2

- Parallel task A: T017 in tests/ideas.test.js
- Parallel task B: T018 in tests/ideas.test.js
- Parallel task C: T024 in src/store/ideaStore.js

---

## Parallel Example: User Story 3

- Parallel task A: T026 in tests/ideas.test.js
- Parallel task B: T027 in tests/ideas.test.js
- Parallel task C: T033 in src/store/ideaStore.js

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 (US1) with draft creation and visibility isolation.
3. Validate US1 independently before adding edit/submit lifecycle.

### Incremental Delivery

1. Ship US1 (draft creation + hidden foreign drafts).
2. Ship US2 (creator-only draft update with PUT/PATCH).
3. Ship US3 (creator-only draft submit transition).
4. Finish polish and full regression run.

### Parallel Team Strategy

1. Team aligns on Phase 1-2 shared decisions.
2. After foundational completion:
   - Developer A: US1 route + visibility filtering.
   - Developer B: US2 update endpoints + store updates.
   - Developer C: US3 submit endpoint + transition guards.
3. Integrate and run Phase 6 regression checks.
