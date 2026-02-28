# Feature Specification: Multi-Stage Review Workflow

**Feature Branch**: `001-review-workflow`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Implement multi-stage review workflow: Add statuses submitted -> under_review -> approved_for_final -> accepted/rejected; admin can move ideas through allowed transitions only; store evaluation history entries (status, comment, reviewerId, timestamp); UI shows review history timeline"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Admin Advances Review Stages (Priority: P1)

As an admin, I can move an idea through defined review stages so evaluation follows a controlled and auditable process.

**Why this priority**: Controlled stage transitions are the core business rule for the review workflow and unblock all downstream reporting and UI behavior.

**Independent Test**: Can be fully tested by attempting valid and invalid stage transitions as admin and verifying only allowed transitions succeed.

**Acceptance Scenarios**:

1. **Given** an idea in `submitted`, **When** an admin updates it, **Then** it can move to `under_review`.
2. **Given** an idea in `under_review`, **When** an admin updates it, **Then** it can move to `approved_for_final`.
3. **Given** an idea in `approved_for_final`, **When** an admin updates it, **Then** it can move to either `accepted` or `rejected`.
4. **Given** any idea state, **When** an admin attempts a disallowed transition, **Then** the system rejects the request with a clear error response.

---

### User Story 2 - Capture Evaluation History (Priority: P2)

As a product owner, I can see immutable evaluation history entries for each review update so decisions are traceable.

**Why this priority**: History records are required for transparency, accountability, and diagnosing review outcomes.

**Independent Test**: Can be fully tested by performing multiple admin stage updates and verifying each update appends a history entry with status, comment, reviewerId, and timestamp.

**Acceptance Scenarios**:

1. **Given** an admin changes an idea review status, **When** the update is saved, **Then** a new evaluation history entry is stored with `status`, `comment`, `reviewerId`, and `timestamp`.
2. **Given** an idea has existing history, **When** another valid transition occurs, **Then** previous history entries remain intact and a new entry is appended.

---

### User Story 3 - View Review Timeline in UI (Priority: P3)

As a user viewing idea details, I can see a chronological review timeline so I understand how and why the idea progressed.

**Why this priority**: The timeline makes workflow state changes understandable to end users and closes the loop between backend history and UI visibility.

**Independent Test**: Can be fully tested by opening an idea with multiple history entries and confirming timeline order and entry fields are visible in the detail view.

**Acceptance Scenarios**:

1. **Given** an idea has evaluation history, **When** a user opens the detail view, **Then** the UI displays the review history timeline in chronological order.
2. **Given** a history entry includes a comment, **When** timeline is rendered, **Then** status, comment, reviewer identifier, and timestamp are shown for that entry.
3. **Given** an idea has no evaluation history, **When** detail view is opened, **Then** the UI displays an empty-history state message.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- An admin attempts to skip stages (for example `submitted` directly to `accepted`).
- A non-admin user attempts to change review status.
- An admin sends a status value outside the defined workflow states.
- History write succeeds but status update fails (system must avoid partial writes).
- Timeline includes entries with empty comment values.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST support review statuses: `submitted`, `under_review`, `approved_for_final`, `accepted`, `rejected`.
- **FR-002**: The system MUST allow only these stage transitions: `submitted -> under_review`, `under_review -> approved_for_final`, `approved_for_final -> accepted`, `approved_for_final -> rejected`.
- **FR-003**: The system MUST reject any transition not listed in the allowed transition map.
- **FR-004**: The system MUST allow only admin users to perform review status transitions.
- **FR-005**: For each successful review transition, the system MUST store a new evaluation history entry containing `status`, `comment`, `reviewerId`, and `timestamp`.
- **FR-006**: The system MUST preserve prior evaluation history entries and append new entries without overwriting existing history.
- **FR-007**: The system MUST expose evaluation history in idea detail responses for timeline rendering.
- **FR-008**: The UI MUST display evaluation history entries in chronological order as a review timeline.
- **FR-009**: The UI MUST show status, reviewer identifier, timestamp, and comment (if present) for each review history entry.
- **FR-010**: The UI MUST show a clear empty state when an idea has no evaluation history.
- **FR-011**: The system MUST return clear error responses for unauthorized or invalid transition attempts.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **Idea**: A submitted proposal that moves through review stages and has one current review status.
- **Review Transition Rule**: Defines valid source-to-target status movement in the review lifecycle.
- **Evaluation History Entry**: Immutable record of a review action with `status`, optional `comment`, `reviewerId`, and `timestamp`.
- **Reviewer**: Admin user responsible for performing status transitions and generating history entries.

### Assumptions

- Existing authentication and role model already identify whether a user is admin.
- Existing idea detail page is the target location for rendering review timeline.
- History entries are shown oldest-to-newest unless product defaults already enforce a different chronological convention.
- The feature does not introduce new user roles beyond current submitter/admin roles.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of tested valid status transitions succeed and update the idea to the requested next state.
- **SC-002**: 100% of tested invalid or skipped transitions are rejected with a non-success response.
- **SC-003**: 100% of successful transitions create one new evaluation history entry with all required fields populated.
- **SC-004**: 95% of users in acceptance testing can identify latest review decision and prior review steps from the timeline in under 15 seconds.
