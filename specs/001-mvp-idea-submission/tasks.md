# Tasks: MVP Idea Submission for InnovatEPAM Portal

**Input**: Design documents from `/specs/001-mvp-idea-submission/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Integration tests are REQUIRED for all business-logic stories.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare runtime/test scaffolding for idea submission workflows.

- [ ] T001 Confirm scripts used by idea tests in package.json
- [ ] T002 [P] Add submission workflow notes in specs/001-mvp-idea-submission/quickstart.md
- [ ] T003 [P] Ensure idea integration test scaffold exists in tests/ideas.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared persistence and routing primitives needed by all stories.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [ ] T004 Confirm Prisma idea model fields and defaults in prisma/schema.prisma
- [ ] T005 [P] Implement create/list/get store helpers for ideas in src/store/ideaStore.js
- [ ] T006 [P] Ensure Bearer JWT auth helper behavior for create endpoint in src/middlewares/auth.js
- [ ] T007 Add ideas route scaffold for create/list/detail in src/routes/ideas.js
- [ ] T008 Wire ideas router mount in src/app.js

**Checkpoint**: Foundation ready; user stories can proceed independently.

---

## Phase 3: User Story 1 - Submit New Idea (Priority: P1) 🎯 MVP

**Goal**: Authenticated users submit ideas with default `submitted` status.

**Independent Test**: Authenticated `POST /ideas` returns `201` JSON with required fields and default status; unauthenticated request returns `401` JSON.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration test for authenticated POST /ideas success in tests/ideas.test.js
- [ ] T010 [P] [US1] Add failing integration test for unauthenticated POST /ideas rejection in tests/ideas.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Implement POST /ideas success flow in src/routes/ideas.js
- [ ] T012 [US1] Validate title/description/category request payload in src/routes/ideas.js
- [ ] T013 [US1] Enforce default status `submitted` on create in src/store/ideaStore.js
- [ ] T014 [US1] Return JSON `400` and `401` errors for invalid/unauthorized create in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - List Ideas (Priority: P2)

**Goal**: Users list all ideas as JSON.

**Independent Test**: `GET /ideas` returns `200` JSON array for both empty and populated database states.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T015 [P] [US2] Add failing integration tests for empty and populated GET /ideas in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T016 [US2] Implement GET /ideas response mapping in src/routes/ideas.js
- [ ] T017 [US2] Wire list operation from store to route in src/store/ideaStore.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - View Idea Details (Priority: P3)

**Goal**: Users fetch one idea by ID with deterministic not-found behavior.

**Independent Test**: `GET /ideas/:id` returns `200` JSON for existing ID and `404` JSON for missing ID.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T018 [P] [US3] Add failing integration tests for GET /ideas/:id success and not-found in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T019 [US3] Implement GET /ideas/:id route in src/routes/ideas.js
- [ ] T020 [US3] Return JSON `404` for missing idea IDs in src/routes/ideas.js
- [ ] T021 [US3] Wire get-by-id store operation for detail reads in src/store/ideaStore.js

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Attachment Extension - Single File Per Idea

**Goal**: Support a single optional attachment per idea with validation and metadata responses.

**Independent Test**: Valid single-file upload succeeds; multiple files/invalid type/oversize return JSON `400`; detail response includes attachment metadata.

### Tests for Attachment Extension (REQUIRED) ✅

- [ ] T022 [P] Add integration test for successful single-file upload in tests/ideas.test.js
- [ ] T023 [P] Add integration test for multi-file rejection in tests/ideas.test.js
- [ ] T024 [P] Add integration test for invalid type/oversize attachment in tests/ideas.test.js
- [ ] T025 [P] Add integration test for attachment metadata in detail response in tests/ideas.test.js

### Implementation for Attachment Extension

- [ ] T026 Implement single-file upload middleware configuration in src/middlewares/upload.js
- [ ] T027 Extend idea persistence for attachment metadata fields in src/store/ideaStore.js
- [ ] T028 Implement attachment-aware POST /ideas handling in src/routes/ideas.js
- [ ] T029 Implement attachment download endpoint in src/routes/ideas.js
- [ ] T030 Add upload runtime ignore and persistence notes in .gitignore

**Checkpoint**: Attachment behavior is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, coverage, and documentation checks.

- [ ] T031 [P] Ensure DB reset helpers are used for test isolation in tests/ideas.test.js
- [ ] T032 [P] Add/confirm JSON content-type assertions in tests/ideas.test.js
- [ ] T033 Update submission workflow notes in README.md
- [ ] T034 Run full suite and verify submission/evaluation/auth scenarios via npm test in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 and delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed independently.
- **Phase 5 (US3)**: Depends on Phase 2 and can proceed independently.
- **Phase 6 (Attachment Extension)**: Depends on Phase 2 and integrates with US1/US3 flows.
- **Phase 7 (Polish)**: Depends on completed target stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories.
- **US2 (P2)**: No dependency on US1 behavior beyond shared foundation.
- **US3 (P3)**: No dependency on US2 behavior beyond shared foundation.

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel.
- US1: T009 and T010 can run in parallel.
- US2: T015 test authoring can run while T016 scaffold starts.
- US3: T018 test authoring can run while T019 scaffold starts.
- Attachment: T022, T023, T024, and T025 can run in parallel.
- Polish: T031 and T032 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T009 in tests/ideas.test.js
- Parallel task B: T010 in tests/ideas.test.js
- Parallel task C: T011 in src/routes/ideas.js

---

## Parallel Example: User Story 2

- Parallel task A: T015 in tests/ideas.test.js
- Parallel task B: T016 in src/routes/ideas.js
- Parallel task C: T017 in src/store/ideaStore.js

---

## Parallel Example: User Story 3

- Parallel task A: T018 in tests/ideas.test.js
- Parallel task B: T019 in src/routes/ideas.js
- Parallel task C: T021 in src/store/ideaStore.js

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 end-to-end.
3. Validate with integration tests before expanding scope.

### Incremental Delivery

1. Add US1 (create) and validate.
2. Add US2 (list) and validate.
3. Add US3 (detail) and validate.
4. Add attachment extension and validate.
5. Complete polish tasks.
