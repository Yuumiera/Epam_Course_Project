# Tasks: Blind Review Identity Masking

**Input**: Design documents from `/specs/001-blind-review/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for role-aware response masking and evaluation continuity.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align blind-review contract, docs, and test targets before implementation.

- [ ] T001 Confirm blind-review response policy in specs/001-blind-review/contracts/blind-review-api.yaml
- [ ] T002 [P] Confirm role-based validation flow in specs/001-blind-review/quickstart.md
- [ ] T003 [P] Identify identity-related assertions to extend in tests/ideas.test.js and tests/evaluation.test.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared role/context helpers for response shaping.

**⚠️ CRITICAL**: No user story work should begin before this phase is complete.

- [ ] T004 Add centralized identity-masking helper(s) for idea responses in src/routes/ideas.js
- [ ] T005 [P] Define and document masked identity field set in src/routes/ideas.js
- [ ] T006 [P] Ensure response serialization path supports role/context variants in src/routes/ideas.js and src/store/ideaStore.js
- [ ] T007 Add explicit context decision points for admin review vs submitter personal view in src/routes/ideas.js

**Checkpoint**: Shared masking foundation is complete.

---

## Phase 3: User Story 1 - Admin Reviews Without Submitter Identity (Priority: P1) 🎯 MVP

**Goal**: Admin review flows hide submitter identity fields in responses.

**Independent Test**: As admin, list/detail/review responses exclude submitter identity fields while review actions still succeed.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T008 [P] [US1] Add failing integration test for masked admin `GET /ideas` response in tests/ideas.test.js
- [ ] T009 [P] [US1] Add failing integration test for masked admin `GET /ideas/:id` response in tests/ideas.test.js
- [ ] T010 [P] [US1] Add failing integration test ensuring `PATCH /ideas/:id/status` response does not leak creator identity in tests/evaluation.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Apply identity masking to admin list responses in src/routes/ideas.js
- [ ] T012 [US1] Apply identity masking to admin detail responses in src/routes/ideas.js
- [ ] T013 [US1] Ensure evaluation endpoint responses are blind-review safe in src/routes/ideas.js
- [ ] T014 [US1] Keep admin review UI functional without submitter identity fields in public/app.js

**Checkpoint**: US1 is independently functional and testable (MVP).

---

## Phase 4: User Story 2 - Submitter Sees Own Identity in Personal View (Priority: P2)

**Goal**: Submitter personal view retains own identity fields for owned ideas.

**Independent Test**: As submitter owner, personal idea view includes identity fields while admin view remains masked.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T015 [P] [US2] Add failing integration test for submitter-owned detail showing identity fields in tests/ideas.test.js
- [ ] T016 [P] [US2] Add failing integration test for submitter personal list identity visibility in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T017 [US2] Implement submitter personal-view unmasked response behavior in src/routes/ideas.js
- [ ] T018 [US2] Ensure ownership-aware identity visibility rules are consistent across list/detail in src/routes/ideas.js
- [ ] T019 [US2] Update UI personal view display logic for submitter identity fields in public/app.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Evaluation Endpoints Remain Functional (Priority: P3)

**Goal**: Evaluation endpoints continue to behave correctly while blind-review masking is active.

**Independent Test**: Existing valid/invalid transition and history behaviors still pass with identity masking enabled.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T020 [P] [US3] Add/adjust failing integration test to confirm transition flow remains unchanged under masking in tests/evaluation.test.js
- [ ] T021 [P] [US3] Add/adjust failing integration test to confirm history payload remains intact without creator identity leakage in tests/evaluation.test.js
- [ ] T022 [P] [US3] Add/adjust failing regression test to confirm no authorization behavior regressions in tests/evaluation.test.js

### Implementation for User Story 3

- [ ] T023 [US3] Verify and adjust evaluation route response shape to preserve behavior and mask identity in src/routes/ideas.js
- [ ] T024 [US3] Ensure store layer remains unchanged in transition semantics while supporting masked response shaping in src/store/ideaStore.js
- [ ] T025 [US3] Update blind-review contract examples to match final behavior in specs/001-blind-review/contracts/blind-review-api.yaml

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, regression confidence, and documentation cleanup.

- [ ] T026 [P] Update blind-review behavior notes in README.md and/or PROJECT_SUMMARY.md
- [ ] T027 [P] Verify quickstart scenarios against final implementation in specs/001-blind-review/quickstart.md
- [ ] T028 Run targeted suites with `npm test -- ideas.test.js` and `npm test -- evaluation.test.js`
- [ ] T029 Run full regression with `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2 and masking baseline from US1
- **Phase 5 (US3)**: Depends on Phase 2 and validates behavior continuity after masking
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on US1 masking rules to define role-specific contrast
- **US3 (P3)**: Depends on US1/US2 final response-shaping behavior

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel.
- US1 tests: T008, T009, T010 can run in parallel.
- US2 tests: T015 and T016 can run in parallel.
- US3 tests: T020, T021, T022 can run in parallel.
- Polish: T026 and T027 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 with strict admin-side identity masking.
3. Validate admin review responses are blind-review compliant.

### Incremental Delivery

1. Ship US1 (admin masking).
2. Ship US2 (submitter personal-view identity visibility).
3. Ship US3 (evaluation continuity validation).
4. Finish polish and full regression.
