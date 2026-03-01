# Feature Specification: Idea Scoring System

**Feature Branch**: `001-idea-scoring-system`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Add scoring system: Admin can score ideas on criteria (impact, feasibility, innovation) 1-5. Compute total score and store it. Add endpoint to list ideas sorted by score. UI shows score breakdown and ranking"

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

### User Story 1 - Admin Scores Ideas (Priority: P1)

As an admin, I can assign scores from 1 to 5 for impact, feasibility, and innovation so each idea has a structured and consistent evaluation.

**Why this priority**: Without scoring input, ranking and score-based comparison cannot exist.

**Independent Test**: Can be fully tested by submitting scores for a single idea and verifying the stored criterion scores and total score are returned correctly.

**Acceptance Scenarios**:

1. **Given** an idea is eligible for review, **When** an admin submits impact, feasibility, and innovation scores, **Then** each score is saved with the idea.
2. **Given** an admin submits scores, **When** the system stores the evaluation, **Then** the total score is computed and persisted for that idea.
3. **Given** a score outside the allowed range, **When** the admin submits the evaluation, **Then** the request is rejected with a validation error.

---

### User Story 2 - Ranked Idea Listing (Priority: P2)

As an authenticated user, I can request ideas sorted by total score so I can quickly identify the highest-rated ideas.

**Why this priority**: Ranking is the primary decision-support output of the scoring model.

**Independent Test**: Can be fully tested by scoring multiple ideas, calling the ranked listing endpoint, and confirming descending order by total score.

**Acceptance Scenarios**:

1. **Given** multiple ideas have stored scores, **When** a user requests the ranked list endpoint, **Then** ideas are returned ordered from highest to lowest total score.
2. **Given** two ideas have equal total score, **When** ranked results are returned, **Then** the order is deterministic and consistent across repeated requests.

---

### User Story 3 - UI Score Breakdown and Ranking (Priority: P3)

As a user, I can view each idea’s criterion-level scores, total score, and rank position in the UI so I understand why ideas are ordered as shown.

**Why this priority**: Transparency of scoring improves trust and usefulness of the ranking view.

**Independent Test**: Can be fully tested by opening the UI after scoring several ideas and verifying each displayed row/card includes impact, feasibility, innovation, total score, and rank.

**Acceptance Scenarios**:

1. **Given** ranked data is available, **When** the user opens the idea list UI, **Then** each idea shows score breakdown and total score.
2. **Given** ideas are sorted by score, **When** the ranking UI renders, **Then** each idea shows its rank position in that ordering.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- A score is submitted as non-numeric input or as a decimal value.
- One or more criteria are missing in the scoring request.
- Existing ideas without scores appear in ranked listings.
- Multiple ideas share the same total score.
- A previously scored idea is re-scored by admin.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow admins to submit three criterion scores for an idea: impact, feasibility, and innovation.
- **FR-002**: The system MUST validate each criterion score as an integer from 1 to 5 inclusive.
- **FR-003**: The system MUST reject scoring requests that contain missing or invalid criterion values.
- **FR-004**: The system MUST compute and store a total score for each scored idea.
- **FR-005**: The system MUST provide an endpoint that returns ideas sorted by total score in descending order.
- **FR-006**: The ranked-list endpoint MUST include score breakdown fields (impact, feasibility, innovation) and total score for each returned idea.
- **FR-007**: The system MUST preserve existing role permissions so only admins can create or update idea scores.
- **FR-008**: The system MUST expose ranking position information in UI-consumable data or deterministically derivable order.
- **FR-009**: The UI MUST display, for each ranked idea, impact score, feasibility score, innovation score, total score, and rank position.
- **FR-010**: The system MUST include automated tests for score validation, total score persistence, ranked endpoint ordering, and score display data correctness.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **Idea Score**: Criterion-level evaluation values for one idea, including impact, feasibility, innovation, and computed total score.
- **Ranked Idea View**: Ordered representation of ideas with score breakdown and ranking position.
- **Scoring Request**: Admin action payload containing three criterion values used to calculate the idea total score.

### Assumptions

- Total score is the average of impact, feasibility, and innovation (equal weighting).
- Existing authentication and role model remains unchanged.
- Ranked listing is available to authenticated users unless broader access restrictions already exist.
- If an idea has no score yet, it is placed after scored ideas in ranked results.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of valid admin scoring submissions persist all three criterion scores and total score correctly.
- **SC-002**: 100% of invalid scoring submissions (out of range, missing criterion, non-integer) are rejected with validation errors.
- **SC-003**: 100% of ranked-list test scenarios return ideas ordered by descending total score with deterministic tie behavior.
- **SC-004**: In acceptance testing, users can identify top 3 ranked ideas and their score breakdown within 60 seconds.
