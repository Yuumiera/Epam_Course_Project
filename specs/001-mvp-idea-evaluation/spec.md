# Feature Specification: MVP Idea Evaluation Workflow

**Feature Branch**: `001-mvp-idea-evaluation`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "Implement MVP evaluation workflow for InnovatEPAM Portal. Admin users can update an idea status to \"under_review\", \"accepted\", or \"rejected\" and add an optional comment. Only admins can change status. All endpoints return JSON and require JWT. Include integration tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Updates Idea Status (Priority: P1)

As an admin, I can update an existing idea's status to `under_review`, `accepted`, or `rejected`, with an optional comment, so I can run an evaluation workflow.

**Why this priority**: Status evaluation is the core business capability of this feature and delivers immediate governance value.

**Independent Test**: Authenticate as an admin, submit a valid status update request for an existing idea, and verify JSON response returns updated status and comment.

**Acceptance Scenarios**:

1. **Given** an existing idea and an authenticated admin token, **When** the admin sets status to `under_review`, **Then** the system returns `200` JSON with updated status.
2. **Given** an existing idea and an authenticated admin token, **When** the admin sets status to `accepted` with a comment, **Then** the system returns `200` JSON including the comment.
3. **Given** an existing idea and an authenticated admin token, **When** the admin sets status to `rejected` without a comment, **Then** the system returns `200` JSON and leaves comment empty or null.

---

### User Story 2 - Enforce Access Control (Priority: P2)

As a product owner, I need only admins to change idea status so evaluation decisions remain controlled.

**Why this priority**: Authorization correctness prevents unauthorized decision changes and protects workflow integrity.

**Independent Test**: Authenticate as non-admin and attempt status update, then verify denial response in JSON.

**Acceptance Scenarios**:

1. **Given** an existing idea and a non-admin authenticated token, **When** status update is requested, **Then** the system returns `403` JSON error.
2. **Given** a request with missing or invalid JWT, **When** any evaluation endpoint is called, **Then** the system returns `401` JSON error.

---

### User Story 3 - Validate Evaluation Input (Priority: P3)

As an admin, I receive clear errors when status input is invalid or idea does not exist so I can correct requests quickly.

**Why this priority**: Validation keeps data quality high and avoids invalid workflow states.

**Independent Test**: Submit invalid status value and unknown idea ID, then verify JSON validation and not-found errors.

**Acceptance Scenarios**:

1. **Given** an authenticated admin token, **When** status is outside `under_review`, `accepted`, `rejected`, **Then** the system returns `400` JSON error.
2. **Given** an authenticated admin token and unknown idea ID, **When** status update is requested, **Then** the system returns `404` JSON error.

---

### Edge Cases

- Status update request includes an empty-string comment.
- Status update request omits status field entirely.
- Status update request includes mixed-case status value (for example `Accepted`).
- Update is attempted for an idea ID that is malformed or not present.
- Valid JWT is provided but role claim is missing or not `admin`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated JSON endpoint for updating an existing idea evaluation status.
- **FR-002**: System MUST allow only these status values: `under_review`, `accepted`, `rejected`.
- **FR-003**: System MUST allow an optional evaluation comment when updating status.
- **FR-004**: System MUST allow only authenticated users with role `admin` to change idea status.
- **FR-005**: System MUST reject status-update requests from authenticated non-admin users with a JSON authorization error.
- **FR-006**: System MUST require valid JWT authentication for all evaluation workflow endpoints.
- **FR-007**: System MUST return JSON responses for success and all error outcomes.
- **FR-008**: System MUST return a JSON not-found error when attempting to evaluate a non-existent idea.
- **FR-009**: System MUST validate status input and reject invalid values with JSON validation error.
- **FR-010**: Updated idea response MUST include at least `id`, `status`, and `comment` fields.
- **FR-011**: System MUST include automated integration tests covering success, unauthorized, forbidden, validation-failure, and not-found scenarios.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **IdeaEvaluationUpdateRequest**: Input containing `status` (required, enum) and `comment` (optional string).
- **IdeaEvaluationResult**: Output representing evaluated idea state including `id`, `status`, `comment`, and unchanged idea identity fields.
- **AuthenticatedActor**: JWT-derived user identity with `id` and `role` used for authorization checks.

## Assumptions

- Existing JWT login flow remains the authentication source for this feature.
- Existing idea records already exist in memory and are addressable by ID.
- Evaluation comment is optional and does not require minimum length in MVP.

## Dependencies

- Existing authentication middleware and JWT token format.
- Existing idea storage and retrieval capability from idea-submission MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid admin evaluation updates complete successfully in under 2 seconds under normal load.
- **SC-002**: 100% of non-admin authenticated attempts to change status are denied.
- **SC-003**: 100% of evaluation workflow endpoint responses use JSON content type for success and errors.
- **SC-004**: Integration test suite covers all critical evaluation paths (success, unauthorized, forbidden, invalid status, not-found) with 100% pass rate in CI.
