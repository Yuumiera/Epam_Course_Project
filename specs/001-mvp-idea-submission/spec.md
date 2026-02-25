# Feature Specification: MVP Idea Submission for InnovatEPAM Portal

**Feature Branch**: `001-mvp-idea-submission`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "Implement MVP idea submission for InnovatEPAM Portal. Authenticated users can create an idea with title, description and category. Ideas can be listed and viewed individually. Each idea has a default status of \"submitted\". All endpoints must return JSON. Store ideas in memory for MVP."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit New Idea (Priority: P1)

As an authenticated user, I can create a new idea with title, description, and category so I can propose improvements.

**Why this priority**: Idea creation is the core business capability and primary value of the MVP.

**Independent Test**: Call create-idea endpoint with valid authenticated request and verify JSON response includes idea details and default `submitted` status.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit a valid idea payload, **Then** the system creates the idea and returns JSON with the created record.
2. **Given** an authenticated user, **When** they create an idea without specifying status, **Then** the created idea has status `submitted`.
3. **Given** an unauthenticated request, **When** it attempts to create an idea, **Then** the system denies the request with a JSON error response.

---

### User Story 2 - List Ideas (Priority: P2)

As a portal user, I can list submitted ideas so I can browse all proposals currently stored in the system.

**Why this priority**: Listing enables visibility of created ideas and is necessary for basic review workflows.

**Independent Test**: Seed one or more ideas, call list endpoint, and verify JSON array response contains expected entries.

**Acceptance Scenarios**:

1. **Given** ideas exist in memory, **When** the list endpoint is requested, **Then** the system returns all ideas as a JSON array.
2. **Given** no ideas exist, **When** the list endpoint is requested, **Then** the system returns an empty JSON array.

---

### User Story 3 - View Idea Details (Priority: P3)

As a portal user, I can view a single idea by ID so I can read its full details.

**Why this priority**: Individual detail view completes the MVP read workflow after list capability.

**Independent Test**: Create a known idea, request it by ID, and verify JSON response; request unknown ID and verify JSON not-found behavior.

**Acceptance Scenarios**:

1. **Given** an existing idea ID, **When** the detail endpoint is requested with that ID, **Then** the system returns the idea as JSON.
2. **Given** a non-existent idea ID, **When** the detail endpoint is requested, **Then** the system returns a JSON error indicating not found.

---

### Edge Cases
- Idea creation payload missing title, description, or category.
- Idea creation with empty-string fields.
- Requesting idea details with malformed ID format.
- Requesting idea details for an ID that does not exist.
- Listing ideas immediately after server start (no records yet).
- Authenticated endpoint called without valid authentication context.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create ideas with `title`, `description`, and `category`.
- **FR-002**: System MUST assign default status `submitted` to each newly created idea.
- **FR-003**: System MUST store ideas in memory for MVP.
- **FR-004**: System MUST provide an endpoint to list all ideas.
- **FR-005**: System MUST provide an endpoint to retrieve a single idea by ID.
- **FR-006**: System MUST return JSON responses for all idea endpoints, including errors.
- **FR-007**: System MUST validate required creation fields and reject invalid payloads.
- **FR-008**: System MUST return a JSON not-found response when an idea ID does not exist.
- **FR-009**: System MUST require authentication for idea creation endpoint.
- **FR-010**: Idea records MUST include at least `id`, `title`, `description`, `category`, and `status`.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **Idea**: Represents a submitted proposal with fields `id`, `title`, `description`, `category`, and `status`.
- **IdeaSubmissionRequest**: Represents the authenticated input required to create an idea (`title`, `description`, `category`).
- **IdeaCollection**: In-memory list of idea records available for listing and lookup by ID.

## Assumptions

- Existing MVP authentication from prior feature is available and can identify authenticated users.
- Authorization scope for MVP is simple: any authenticated user may create ideas.
- Ideas are ephemeral for MVP because storage is in memory and resets on restart.

## Dependencies

- Authentication middleware/context from the MVP authentication feature.
- Existing Express app routing and JSON middleware setup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid authenticated create-idea requests complete successfully within 2 seconds under normal load.
- **SC-002**: 100% of created ideas default to status `submitted` when no status is provided.
- **SC-003**: 100% of idea endpoints return JSON content type for both success and error responses.
- **SC-004**: At least 90% of UAT participants can create, list, and view an idea without assistance.
