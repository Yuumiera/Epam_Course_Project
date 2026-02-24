# Tasks: MVP Authentication for InnovatEPAM Portal

**Input**: Design documents from `/specs/001-mvp-authentication/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.yaml, quickstart.md

**Tests**: Test tasks are REQUIRED for all business-logic stories and must include Jest + Supertest contract/integration coverage.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize dependencies, scripts, and repo hygiene for auth MVP work.

- [ ] T001 Add auth/runtime and test/lint dependencies in ./package.json
- [ ] T002 Add `lint`, `test`, and coverage scripts in ./package.json
- [ ] T003 [P] Add Jest config in ./jest.config.js
- [ ] T004 [P] Add ESLint config in ./.eslintrc.json
- [ ] T005 [P] Add `.env` ignore and local data hygiene in ./.gitignore
- [ ] T006 Create initial persistence file for users in data/users.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared auth primitives required by all user stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T007 Create auth environment config loader in src/config/auth.js
- [ ] T008 [P] Create password hash/compare utility in src/utils/password.js
- [ ] T009 [P] Create JWT sign/verify utility in src/utils/jwt.js
- [ ] T010 Create file-backed user persistence model in src/models/userStore.js
- [ ] T011 [P] Create standardized auth error helper in src/utils/httpErrors.js
- [ ] T012 Wire global error handling middleware in src/middleware/errorHandler.js
- [ ] T013 Register shared middleware and route mounts in src/app.js
- [ ] T014 Add shared test bootstrap for env/test data paths in tests/setup/env.js

**Checkpoint**: Foundation ready; user stories can proceed.

---

## Phase 3: User Story 1 - Register New Account (Priority: P1) 🎯 MVP

**Goal**: User can register with email/password/role, default role is `submitter`, duplicate email returns `409`.

**Independent Test**: Call `POST /auth/register` for success, duplicate email, invalid role, and short password.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add register contract tests in tests/contract/auth.register.contract.test.js
- [ ] T016 [P] [US1] Add register integration tests with Supertest in tests/integration/auth.register.integration.test.js

### Implementation for User Story 1

- [ ] T017 [US1] Implement register controller flow in src/controllers/authController.js
- [ ] T018 [US1] Add default role + input validation rules in src/controllers/authController.js
- [ ] T019 [US1] Enforce duplicate email to `409` mapping via store/service in src/controllers/authController.js
- [ ] T020 [US1] Add register endpoint wiring in src/routes/authRoutes.js
- [ ] T021 [US1] Mount auth routes in src/app.js
- [ ] T022 [US1] Add unit tests for register logic in tests/unit/authController.register.test.js

**Checkpoint**: Registration works and is independently testable.

---

## Phase 4: User Story 2 - Login and Receive Token (Priority: P2)

**Goal**: Registered user logs in and receives JWT token with 24h expiry; wrong credentials return `401`.

**Independent Test**: Call `POST /auth/login` for valid credentials and invalid credentials.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add login contract tests in tests/contract/auth.login.contract.test.js
- [ ] T024 [P] [US2] Add login integration tests with Supertest in tests/integration/auth.login.integration.test.js

### Implementation for User Story 2

- [ ] T025 [US2] Implement login controller flow in src/controllers/authController.js
- [ ] T026 [US2] Integrate password compare + JWT issue logic in src/controllers/authController.js
- [ ] T027 [US2] Enforce wrong-credential response `401` in src/controllers/authController.js
- [ ] T028 [US2] Add login endpoint wiring in src/routes/authRoutes.js
- [ ] T029 [US2] Add unit tests for login/JWT behavior in tests/unit/authController.login.test.js
- [ ] T030 [US2] Add unit tests for JWT utility expiry/signature checks in tests/unit/jwt.test.js

**Checkpoint**: Login + token issuance works and is independently testable.

---

## Phase 5: User Story 3 - Access Protected Endpoints (Priority: P3)

**Goal**: Protected endpoint requires valid bearer token; missing/invalid/expired token returns `401`.

**Independent Test**: Call `GET /protected/ping` with no token, invalid token, expired token, and valid token.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add protected endpoint contract tests in tests/contract/protected.ping.contract.test.js
- [ ] T032 [P] [US3] Add protected endpoint integration tests with Supertest in tests/integration/protected.ping.integration.test.js

### Implementation for User Story 3

- [ ] T033 [US3] Implement JWT authentication middleware in src/middleware/authenticate.js
- [ ] T034 [US3] Implement protected ping route/controller in src/routes/protectedRoutes.js
- [ ] T035 [US3] Mount protected routes with middleware in src/app.js
- [ ] T036 [US3] Add unit tests for auth middleware behavior in tests/unit/authenticate.test.js

**Checkpoint**: Protected endpoint enforcement works and is independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quality gates, and security hygiene.

- [ ] T037 [P] Update run/test instructions in ./README.md
- [ ] T038 Add Jest + Supertest usage and coverage command examples in ./README.md
- [ ] T039 [P] Document env requirements and no-secrets policy in ./README.md
- [ ] T040 Enforce lint script stability and fix violations in ./package.json
- [ ] T041 Enforce coverage threshold >=80% in ./jest.config.js
- [ ] T042 Add commit cadence guidance (small frequent commits) in specs/001-mvp-authentication/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all stories.
- **Phase 3–5 (User Stories)**: Depend on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after foundational phase; no dependency on other stories.
- **US2 (P2)**: Depends on US1 registration data path being available.
- **US3 (P3)**: Depends on US2 token issuance behavior.

### Within Each User Story

- Tests first (contract + integration), then implementation, then unit tests and route wiring.

## Parallel Opportunities

- Setup: `T003`, `T004`, `T005` can run in parallel.
- Foundational: `T008`, `T009`, `T011` can run in parallel.
- US1: `T015` and `T016` parallel; implementation can split between `T017/T018` and `T020` after controller skeleton.
- US2: `T023` and `T024` parallel; `T029` and `T030` parallel after login logic exists.
- US3: `T031` and `T032` parallel; `T033` and `T034` can be parallelized after middleware contract is fixed.
- Polish: `T037` and `T039` parallel.

---

## Parallel Example: User Story 2

```bash
# Parallel test authoring
Task: "T023 [US2] Add login contract tests in tests/contract/auth.login.contract.test.js"
Task: "T024 [US2] Add login integration tests with Supertest in tests/integration/auth.login.integration.test.js"

# Parallel unit validation after implementation
Task: "T029 [US2] Add unit tests for login/JWT behavior in tests/unit/authController.login.test.js"
Task: "T030 [US2] Add unit tests for JWT utility expiry/signature checks in tests/unit/jwt.test.js"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1 registration).
3. Validate registration independently before proceeding.

### Incremental Delivery

1. US1 registration.
2. US2 login/JWT issuance.
3. US3 protected endpoint enforcement.
4. Polish docs and quality gates.

### Frequent Commit Cadence

- Commit after every 1–2 completed tasks.
- Keep commit scope tied to a single capability (store, hashing, jwt util, route/controller, middleware, tests, docs).
- Use intent-focused messages (example: `feat(auth): add jwt utility with 24h expiry`).

## Notes

- All tasks follow required checklist format and include concrete file paths.
- Story phases are independently testable and map directly to spec priorities.
- Task granularity is intentionally small to support frequent commits.
