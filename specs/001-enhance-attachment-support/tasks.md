# Tasks: Enhanced Idea Attachments

**Input**: Design documents from `/specs/001-enhance-attachment-support/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED for all attachment business-logic changes in this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare documentation and test scaffolding for attachment enhancement work.

- [ ] T001 Confirm attachment-related scripts and test commands in package.json
- [ ] T002 [P] Add attachment scenario notes in specs/001-enhance-attachment-support/quickstart.md
- [ ] T003 [P] Confirm API contract expectations in specs/001-enhance-attachment-support/contracts/attachment-api.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared attachment validation and metadata baseline used by all stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T004 Define attachment allowlist and max-size constants in src/middlewares/upload.js
- [ ] T005 [P] Ensure upload middleware returns deterministic validation errors for type and size failures in src/middlewares/upload.js
- [ ] T006 [P] Confirm attachment metadata shape (`filename`, `mimeType`, `sizeBytes`) remains consistent in src/routes/ideas.js
- [ ] T007 Verify idea detail serialization includes attachment metadata contract in src/routes/ideas.js

**Checkpoint**: Shared attachment behavior baseline is ready for story-by-story delivery.

---

## Phase 3: User Story 1 - Safe Attachment Upload Validation (Priority: P1) 🎯 MVP

**Goal**: Reject unsupported attachment formats and oversized files while preserving valid upload behavior.

**Independent Test**: Valid PDF/PNG/JPG uploads succeed; disallowed types and oversized files return `400`.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T008 [P] [US1] Add failing integration test for allowlisted attachment types in tests/ideas.test.js
- [ ] T009 [P] [US1] Add failing integration test for disallowed attachment type rejection in tests/ideas.test.js
- [ ] T010 [P] [US1] Add failing integration test for max-size rejection in tests/ideas.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Enforce allowlist (`pdf/png/jpg`) in upload middleware in src/middlewares/upload.js
- [ ] T012 [US1] Enforce max file size limit in upload middleware in src/middlewares/upload.js
- [ ] T013 [US1] Ensure invalid upload responses are clear and JSON-consistent in src/middlewares/upload.js
- [ ] T014 [US1] Preserve successful create-idea flow for valid attachments in src/routes/ideas.js

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Preserve Attachment Metadata (Priority: P2)

**Goal**: Store and return attachment metadata for ideas with files.

**Independent Test**: Creating an idea with an attachment and retrieving details returns exact metadata fields.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T015 [P] [US2] Add failing integration test for metadata persistence in tests/ideas.test.js
- [ ] T016 [P] [US2] Add failing integration test for no-attachment detail behavior in tests/ideas.test.js

### Implementation for User Story 2

- [ ] T017 [US2] Persist `filename`, `mimeType`, and `sizeBytes` from upload object in src/routes/ideas.js
- [ ] T018 [US2] Return metadata on idea detail responses in src/routes/ideas.js
- [ ] T019 [US2] Ensure metadata remains stable across list/detail reads in src/routes/ideas.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Access Attachments from Idea UI (Priority: P3)

**Goal**: Provide authenticated attachment retrieval endpoint and UI download/view action.

**Independent Test**: User can open idea detail, see attachment name, and retrieve file via download/view action.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T020 [P] [US3] Add failing integration test for authenticated attachment retrieval in tests/ideas.test.js
- [ ] T021 [P] [US3] Add failing integration test for missing attachment retrieval behavior in tests/ideas.test.js

### Implementation for User Story 3

- [ ] T022 [US3] Add or confirm authenticated attachment retrieval endpoint in src/routes/ideas.js
- [ ] T023 [US3] Return not-found response for absent/missing attachment files in src/routes/ideas.js
- [ ] T024 [US3] Display attachment name in idea detail UI in public/app.js
- [ ] T025 [US3] Add UI action for attachment download/view in public/app.js
- [ ] T026 [US3] Ensure no-attachment state is clearly rendered in public/index.html

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, regression safety, and user-facing clarity.

- [ ] T027 [P] Verify response content-type and download headers for attachments in tests/ideas.test.js
- [ ] T028 [P] Re-check test isolation/setup for attachment files in tests/ideas.test.js
- [ ] T029 Update README attachment behavior notes in README.md
- [ ] T030 Run full suite and verify no regressions with npm test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies
- **Phase 2**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP deliverable
- **Phase 4 (US2)**: Depends on Phase 2; can proceed independently after baseline
- **Phase 5 (US3)**: Depends on Phase 2; relies on metadata and endpoint behavior from earlier phases
- **Phase 6**: Depends on completed target stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories
- **US2 (P2)**: Depends on upload baseline but not on UI retrieval flows
- **US3 (P3)**: Depends on attachment metadata and retrieval contract from US2

---

## Parallel Opportunities

- Setup: T002 and T003 can run in parallel.
- Foundational: T005 and T006 can run in parallel after T004 starts.
- US1: T008, T009, and T010 can run in parallel.
- US2: T015 and T016 can run in parallel.
- US3: T020 and T021 can run in parallel; T024 and T026 can run in parallel.
- Polish: T027 and T028 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T008 in tests/ideas.test.js
- Parallel task B: T009 in tests/ideas.test.js
- Parallel task C: T010 in tests/ideas.test.js

---

## Parallel Example: User Story 2

- Parallel task A: T015 in tests/ideas.test.js
- Parallel task B: T016 in tests/ideas.test.js
- Parallel task C: T017 in src/routes/ideas.js

---

## Parallel Example: User Story 3

- Parallel task A: T024 in public/app.js
- Parallel task B: T026 in public/index.html
- Parallel task C: T022 in src/routes/ideas.js

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Deliver Phase 3 (US1) with attachment validation + tests.
3. Validate upload behavior before metadata/retrieval/UI expansion.

### Incremental Delivery

1. Ship US1 (validation baseline).
2. Ship US2 (metadata persistence + detail exposure).
3. Ship US3 (retrieval endpoint + UI action).
4. Finish polish and full regression run.
