# Tasks: MVP Authentication for InnovatEPAM Portal

**Input**: Design documents from `/specs/001-mvp-authentication/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Integration tests are REQUIRED for all business-logic stories.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare auth workflow docs, scripts, and test entry points.

- [ ] T001 Confirm auth-related scripts used in package.json
- [ ] T002 [P] Add auth workflow run notes in specs/001-mvp-authentication/quickstart.md
- [ ] T003 [P] Ensure auth integration test scaffold exists in tests/auth.test.js
- [ ] T004 [P] Confirm JWT secret env handling notes in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared auth persistence, middleware, and route scaffolding required by all stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T005 Confirm Prisma user model constraints (`email` unique, `role`) in prisma/schema.prisma
- [ ] T006 [P] Implement user persistence helpers for auth workflows in src/store/userStore.js
- [ ] T007 [P] Ensure password hash/verify helpers are exposed in src/services/authService.js
- [ ] T008 Add auth route input validation helpers in src/routes/auth.js
- [ ] T009 Wire auth route mounts used by the app in src/app.js

**Checkpoint**: Foundation ready; user stories can proceed independently.

---

## Phase 3: User Story 1 - Register New Account (Priority: P1) 🎯 MVP

**Goal**: User registers with email/password/role, default role is `submitter`, duplicate email returns `409`.

**Independent Test**: `POST /auth/register` covers success, duplicate email, invalid role, and invalid password behavior.

### Tests for User Story 1 (REQUIRED) ✅

- [ ] T010 [P] [US1] Add failing integration test for register success with default role in tests/auth.test.js
- [ ] T011 [P] [US1] Add failing integration test for duplicate email conflict in tests/auth.test.js
- [ ] T012 [P] [US1] Add failing integration test for invalid role/password validation in tests/auth.test.js

### Implementation for User Story 1

- [ ] T013 [US1] Implement register success flow in src/routes/auth.js
- [ ] T014 [US1] Enforce allowed roles and default `submitter` logic in src/routes/auth.js
- [ ] T015 [US1] Map duplicate email persistence conflict to JSON `409` in src/routes/auth.js

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Login and Receive Token (Priority: P2)

**Goal**: Registered user logs in with valid credentials and receives JWT token.

**Independent Test**: `POST /auth/login` returns token for valid credentials and `401` for invalid credentials.

### Tests for User Story 2 (REQUIRED) ✅

- [ ] T016 [P] [US2] Add failing integration test for login success token response in tests/auth.test.js
- [ ] T017 [P] [US2] Add failing integration test for wrong password rejection in tests/auth.test.js
- [ ] T018 [P] [US2] Add failing integration test for unknown email rejection in tests/auth.test.js

### Implementation for User Story 2

- [ ] T019 [US2] Implement login credential validation and lookup in src/routes/auth.js
- [ ] T020 [US2] Implement JWT token issuance on successful login in src/routes/auth.js
- [ ] T021 [US2] Return JSON `401` on invalid credentials in src/routes/auth.js

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Access Protected Endpoints (Priority: P3)

**Goal**: Protected endpoint access requires valid bearer token; missing/invalid/expired token returns `401`.

**Independent Test**: `GET /protected/ping` returns `200` with valid token and `401` for missing/invalid token.

### Tests for User Story 3 (REQUIRED) ✅

- [ ] T022 [P] [US3] Add failing integration test for protected endpoint without token in tests/auth.test.js
- [ ] T023 [P] [US3] Add failing integration test for protected endpoint with invalid token in tests/auth.test.js
- [ ] T024 [P] [US3] Add failing integration test for protected endpoint with valid token in tests/auth.test.js

### Implementation for User Story 3

- [ ] T025 [US3] Implement JWT bearer auth middleware checks in src/middlewares/auth.js
- [ ] T026 [US3] Implement protected ping endpoint in src/app.js
- [ ] T027 [US3] Attach verified auth context to requests in src/middlewares/auth.js

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, consistency, and security hygiene checks.

- [ ] T028 [P] Add JSON content-type assertions for auth endpoint outcomes in tests/auth.test.js
- [ ] T029 [P] Ensure user/idea DB reset helpers run before auth tests in tests/auth.test.js
- [ ] T030 Update auth endpoint examples and expected errors in specs/001-mvp-authentication/quickstart.md
- [ ] T031 Run full test suite and verify auth scenarios via npm test in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 and delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed independently.
- **Phase 5 (US3)**: Depends on Phase 2 and can proceed independently.
- **Phase 6 (Polish)**: Depends on completed target stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories.
- **US2 (P2)**: Depends on registration data path existing from foundation.
- **US3 (P3)**: Depends on login token issuance from US2.

---

## Parallel Opportunities

- Setup: T002, T003, T004 can run in parallel.
- Foundational: T006 and T007 can run in parallel.
- US1: T010, T011, and T012 can run in parallel.
- US2: T016, T017, and T018 can run in parallel.
- US3: T022, T023, and T024 can run in parallel.
- Polish: T028 and T029 can run in parallel.

---

## Parallel Example: User Story 1

- Parallel task A: T010 in tests/auth.test.js
- Parallel task B: T011 in tests/auth.test.js
- Parallel task C: T013 in src/routes/auth.js

---

## Parallel Example: User Story 2

- Parallel task A: T016 in tests/auth.test.js
- Parallel task B: T017 in tests/auth.test.js
- Parallel task C: T019 in src/routes/auth.js

---

## Parallel Example: User Story 3

- Parallel task A: T022 in tests/auth.test.js
- Parallel task B: T023 in tests/auth.test.js
- Parallel task C: T025 in src/middlewares/auth.js

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 end-to-end.
3. Validate registration independently before expanding scope.

### Incremental Delivery

1. Add US1 (register) and validate.
2. Add US2 (login/token) and validate.
3. Add US3 (protected access) and validate.
4. Complete polish and documentation tasks.
