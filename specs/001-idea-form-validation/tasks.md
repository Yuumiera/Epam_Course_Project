# Tasks: Phase 2 Smart Idea Submission Form Improvements

**Input**: Design documents from `/specs/001-idea-form-validation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for all business-logic stories in this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare docs and test scaffolding for validation-focused implementation.

- [ ] T001 Confirm validation feature scripts and test command usage in package.json
- [ ] T002 [P] Add Phase 2 validation notes in specs/001-idea-form-validation/quickstart.md
- [ ] T003 [P] Add validation contract reference notes in specs/001-idea-form-validation/contracts/idea-validation-api.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add reusable validation primitives and response contract baseline used by all user stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T004 Implement centralized idea field validation helper in src/routes/ideas.js
- [ ] T005 [P] Define allowed category constants for validation in src/routes/ideas.js
- [ ] T006 [P] Implement `400` validation error response builder with `fieldErrors` map in src/routes/ideas.js
- [ ] T007 Add frontend validation state container for create form in public/app.js
- [ ] T008 Add inline error UI placeholders for create form fields in public/index.html

**Checkpoint**: Shared validation baseline is ready for story-by-story delivery.

---

## Phase 3: User Story 1 - Validate Submission on Server (Priority: P1) 🎯 MVP

**Goal**: Server rejects invalid `title`, `description`, and `category` with deterministic validation behavior.

**Independent Test**: Invalid create requests return `400` with field-level errors; valid request still returns `201`.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T009 [P] [US1] Add failing integration test for blank/whitespace title validation in tests/ideas.test.js
- [ ] T010 [P] [US1] Add failing integration test for short description validation in tests/ideas.test.js
- [ ] T011 [P] [US1] Add failing integration test for invalid category validation in tests/ideas.test.js

### Implementation for User Story 1

- [ ] T012 [US1] Enforce title length and trim rules in POST /ideas in src/routes/ideas.js
- [ ] T013 [US1] Enforce description length and trim rules in POST /ideas in src/routes/ideas.js
- [ ] T014 [US1] Enforce category enum validation in POST /ideas in src/routes/ideas.js
- [ ] T015 [US1] Preserve successful creation flow for valid payloads in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Return Field-Level Error Responses (Priority: P2)

**Goal**: API returns clear `400` JSON with all failed field messages in one response.

**Independent Test**: Multi-field invalid submission returns one `fieldErrors` object containing every failed field.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T016 [P] [US2] Add failing integration test for single-field validation error shape in tests/ideas.test.js
- [ ] T017 [P] [US2] Add failing integration test for multi-field validation error aggregation in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T018 [US2] Return `400` with `{ error, fieldErrors }` payload for validation failures in src/routes/ideas.js
- [ ] T019 [US2] Ensure only invalid fields are included in `fieldErrors` in src/routes/ideas.js
- [ ] T020 [US2] Keep unauthorized and non-validation error response behavior intact in src/routes/ideas.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Inline Form Guidance and Submit Gating (Priority: P3)

**Goal**: Frontend shows inline validation and keeps Create button disabled until form is valid.

**Independent Test**: Invalid field edits show inline errors and disabled submit; all valid fields enable submit and allow submission.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T021 [P] [US3] Add integration test asserting server `fieldErrors` are returned for UI mapping in tests/ideas.test.js
- [ ] T022 [P] [US3] Add integration test asserting valid submission still succeeds after validation rules in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T023 [US3] Add inline validation message elements for title/description/category in public/index.html
- [ ] T024 [US3] Add inline validation message styles and invalid state styles in public/style.css
- [ ] T025 [US3] Implement client-side field validators and real-time state updates in public/app.js
- [ ] T026 [US3] Disable/enable Create Idea submit button from form validity state in public/app.js
- [ ] T027 [US3] Map server `fieldErrors` response into inline message areas in public/app.js

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, regression safety, and developer-facing documentation.

- [ ] T028 [P] Add/confirm JSON content-type and validation payload assertions in tests/ideas.test.js
- [ ] T029 [P] Ensure test setup reset helpers preserve deterministic validation tests in tests/ideas.test.js
- [ ] T030 Update README validation behavior notes in README.md
- [ ] T031 Run full suite and verify no regressions with npm test in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2; can proceed independently from US1 after shared baseline
- **Phase 5 (US3)**: Depends on Phase 2; can proceed independently from US2 after shared baseline
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on core validation baseline but not on US1 UI work
- **US3 (P3)**: Depends on server error shape from US2 for error mapping

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel after T004 starts.
- US1: T009, T010, and T011 can run in parallel.
- US2: T016 and T017 can run in parallel.
- US3: T021 and T022 can run in parallel; T023 and T024 can run in parallel.
- Polish: T028 and T029 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T009 in tests/ideas.test.js
- Parallel task B: T010 in tests/ideas.test.js
- Parallel task C: T011 in tests/ideas.test.js

---

## Parallel Example: User Story 2

- Parallel task A: T016 in tests/ideas.test.js
- Parallel task B: T017 in tests/ideas.test.js
- Parallel task C: T018 in src/routes/ideas.js

---

## Parallel Example: User Story 3

- Parallel task A: T023 in public/index.html
- Parallel task B: T024 in public/style.css
- Parallel task C: T025 in public/app.js

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 (US1) with server validation + tests.
3. Validate API behavior before extending to response richness and UI.

### Incremental Delivery

1. Ship US1 (server validation core).
2. Ship US2 (field-level error contract).
3. Ship US3 (inline UX + submit gating).
4. Finish polish and full regression test run.
