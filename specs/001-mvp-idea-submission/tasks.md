# Tasks: MVP Idea Submission for InnovatEPAM Portal

**Input**: Design documents from `/specs/001-mvp-idea-submission/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ideas-api.yaml

**Tests**: Integration tests are REQUIRED for each business-logic story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare minimal test/runtime scaffolding for the feature.

- [ ] T001 Confirm test script and environment usage in package.json
- [ ] T002 [P] Add idea feature section to docs in README.md
- [ ] T003 [P] Create ideas test file scaffold in tests/ideas.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared building blocks required by all stories.

- [ ] T004 Implement in-memory idea store with reset support in src/store/ideaStore.js
- [ ] T005 [P] Implement idea business helpers (create/list/get) in src/services/ideaService.js
- [ ] T006 [P] Add auth middleware reusable helper for Bearer JWT verification in src/middleware/auth.js
- [ ] T007 Create ideas router scaffold and export in src/routes/ideas.js
- [ ] T008 Mount ideas router in src/app.js

**Checkpoint**: Foundation ready for independent story implementation.

---

## Phase 3: User Story 1 - Submit New Idea (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can submit ideas with default `submitted` status.

**Independent Test**: Authenticated `POST /ideas` returns `201` JSON with required fields and `status: "submitted"`; unauthenticated request returns `401` JSON.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration tests for authenticated and unauthenticated POST /ideas in tests/ideas.test.js

### Implementation for User Story 1

- [ ] T010 [US1] Implement POST /ideas route with auth middleware reuse in src/routes/ideas.js
- [ ] T011 [US1] Add request payload validation for title/description/category in src/routes/ideas.js
- [ ] T012 [US1] Enforce default status `submitted` during create flow in src/services/ideaService.js
- [ ] T013 [US1] Return JSON error responses (`400`/`401`) for invalid or unauthorized create in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - List Ideas (Priority: P2)

**Goal**: Users can list all ideas as JSON.

**Independent Test**: `GET /ideas` returns `200` JSON array for both empty and populated store states.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T014 [P] [US2] Add failing integration tests for empty and populated GET /ideas responses in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T015 [US2] Implement GET /ideas route returning JSON array in src/routes/ideas.js
- [ ] T016 [US2] Wire list operation from idea store/service into GET /ideas in src/services/ideaService.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - View Idea Details (Priority: P3)

**Goal**: Users can fetch a single idea by ID with JSON not-found behavior.

**Independent Test**: `GET /ideas/:id` returns `200` JSON for existing ID and `404` JSON for missing ID.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T017 [P] [US3] Add failing integration tests for GET /ideas/:id success and not-found in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T018 [US3] Implement GET /ideas/:id route in src/routes/ideas.js
- [ ] T019 [US3] Add `404` JSON response when idea is missing in src/routes/ideas.js
- [ ] T020 [US3] Wire get-by-id operation in src/services/ideaService.js

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, coverage, and documentation checks.

- [ ] T021 [P] Ensure idea store reset is used for test isolation in tests/ideas.test.js
- [ ] T022 [P] Add/confirm JSON content-type assertions across idea endpoint tests in tests/ideas.test.js
- [ ] T023 Update feature quick usage and run/test notes in README.md
- [ ] T024 Run full test suite and coverage check commands from quickstart in specs/001-mvp-idea-submission/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1; blocks all stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2; can proceed after or alongside US1 once shared router/store are stable
- **Phase 5 (US3)**: Depends on Phase 2; can proceed after or alongside US2 once shared router/store are stable
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: No functional dependency on US1 output data model beyond shared store/service
- **US3 (P3)**: No functional dependency on US2 beyond shared store/service

---

## Parallel Opportunities

- **Setup**: T002 and T003 can run in parallel.
- **Foundational**: T005 and T006 can run in parallel after T004.
- **US1**: T009 can be authored while T010-T012 are being scaffolded.
- **US2**: T014 can run in parallel with T015 skeleton work.
- **US3**: T017 can run in parallel with T018 skeleton work.
- **Polish**: T021 and T022 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T009 in tests/ideas.test.js
- Parallel task B: T010 in src/routes/ideas.js
- Parallel task C: T012 in src/services/ideaService.js

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phases 1-2.
2. Deliver Phase 3 (US1) end-to-end.
3. Validate with integration tests before expanding scope.

### Incremental Delivery

1. Add US1 (create) and validate.
2. Add US2 (list) and validate.
3. Add US3 (detail) and validate.
4. Finish polish tasks.

### Frequent Commit Plan

- Commit batch 1: T001-T004 (setup + store baseline)
- Commit batch 2: T005-T008 (service/middleware/router wiring)
- Commit batch 3: T009-T013 (US1 tests + create flow)
- Commit batch 4: T014-T016 (US2 tests + list flow)
- Commit batch 5: T017-T020 (US3 tests + detail flow)
- Commit batch 6: T021-T024 (polish + docs + verification)
