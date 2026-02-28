# Feature Specification: Blind Review Identity Masking

**Feature Branch**: `001-blind-review`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Implement blind review: when admin reviews ideas, hide submitter identity fields in responses; submitter can still see their own identity in personal view; ensure evaluation endpoints work without exposing creator details"

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

### User Story 1 - Admin Reviews Without Submitter Identity (Priority: P1)

As an admin reviewer, I can evaluate ideas without seeing submitter identity details so decisions are less biased.

**Why this priority**: Blind review is the core policy requirement and must be enforced before any secondary UI or response refinements.

**Independent Test**: Can be fully tested by fetching review-related idea data as admin and verifying submitter identity fields are absent while evaluation actions still work.

**Acceptance Scenarios**:

1. **Given** an admin requests idea data used for review, **When** the response is returned, **Then** submitter identity fields are omitted.
2. **Given** an admin performs an evaluation status update, **When** the endpoint responds, **Then** the evaluation succeeds without exposing submitter identity fields.

---

### User Story 2 - Submitter Sees Own Identity in Personal View (Priority: P2)

As a submitter, I can still view my own identity details in my personal idea context so I can confirm ownership.

**Why this priority**: Privacy masking for admins must not degrade ownership visibility for submitters in their own view.

**Independent Test**: Can be fully tested by retrieving personal idea view as submitter and confirming own identity details remain available.

**Acceptance Scenarios**:

1. **Given** a submitter opens their own idea view, **When** idea details are shown, **Then** personal identity fields are available for that submitter.

---

### User Story 3 - Evaluation Endpoints Remain Functional (Priority: P3)

As an admin, I can continue to use evaluation endpoints normally while blind-review masking is applied.

**Why this priority**: This ensures blind-review policy does not break existing evaluation workflow and operational continuity.

**Independent Test**: Can be fully tested by running existing evaluation flows end-to-end after masking changes and confirming expected statuses and history updates still work.

**Acceptance Scenarios**:

1. **Given** blind-review masking is active, **When** admin calls evaluation endpoints, **Then** endpoint behavior remains correct for valid and invalid transitions.
2. **Given** evaluation endpoints return payloads, **When** responses are inspected, **Then** creator identity fields are not exposed in admin review context.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- A user with admin role is also an idea creator and accesses the same idea in review context.
- Cached client data contains identity fields from earlier non-blind responses.
- Evaluation history entries include reviewer details but must not leak submitter identity in admin review responses.
- Non-admin users request endpoints intended for review and should continue to receive existing authorization behavior.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST hide submitter identity fields from responses used by admins in review context.
- **FR-002**: The system MUST prevent creator identity leakage in evaluation endpoint responses returned to admins.
- **FR-003**: The system MUST preserve existing authorization checks for evaluation endpoints.
- **FR-004**: The system MUST keep blind-review masking active for both idea listing and idea detail data used by admin review flows.
- **FR-005**: The system MUST allow submitters to see their own identity in personal-view context for their own ideas.
- **FR-006**: The system MUST apply consistent response-shape rules so identity masking is deterministic for admin review responses.
- **FR-007**: The system MUST keep existing evaluation workflow behavior (valid transitions, invalid-transition errors, history capture) unaffected by identity masking.
- **FR-008**: The system MUST include automated tests verifying masked admin responses and unmasked submitter personal view behavior.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **Review Context Response**: Idea data returned for admin review operations where submitter identity must be hidden.
- **Personal Idea View**: Submitter-facing idea data where submitter identity remains visible for own records.
- **Identity Field Set**: Fields representing submitter identity that are conditionally masked based on role and context.
- **Evaluation Endpoint Response**: Status update and related review payload that must remain functional without creator identity exposure.

### Assumptions

- Current authentication payload reliably distinguishes `admin` and `submitter` roles.
- Personal view scope for submitters is based on ownership of the idea.
- Existing evaluation transition and history behavior is already covered and should remain unchanged.
- Blind review requirement applies to submitter identity, not reviewer identity.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of tested admin review responses omit all submitter identity fields defined for masking.
- **SC-002**: 100% of tested submitter personal-view responses for owned ideas include submitter identity fields.
- **SC-003**: 100% of existing evaluation endpoint tests continue to pass after blind-review masking is enabled.
- **SC-004**: 95% of admins in acceptance validation can complete review actions without identity exposure incidents.
